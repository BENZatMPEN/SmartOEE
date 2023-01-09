import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Box, Button, Card, Divider, Grid, MenuItem, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Oee } from '../../../@types/oee';
import {
  EditProblemSolution,
  EditProblemSolutionTask,
  ProblemSolution,
  ProblemSolutionAttachment,
  ProblemSolutionTask,
} from '../../../@types/problemSolution';
import { User } from '../../../@types/user';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { EditorLabelStyle } from '../../../components/EditorLabelStyle';
import FormHeader from '../../../components/FormHeader';
import {
  FormProvider,
  RHFEditor,
  RHFGalleryUploadMultiFile,
  RHFSelect,
  RHFTextField,
} from '../../../components/hook-form';
import Iconify from '../../../components/Iconify';
import { PS_PROCESS_STATUS, PS_PROCESS_STATUS_ON_PROCESS } from '../../../constants';
import { RootState, useSelector } from '../../../redux/store';
import { PATH_PROBLEMS_SOLUTIONS } from '../../../routes/paths';
import axios from '../../../utils/axios';
import { getPsProcessStatusText } from '../../../utils/formatText';
import { getFileUrl } from '../../../utils/imageHelper';
import ProblemSolutionTaskList from './ProblemSolutionTaskList';

export interface ProblemSolutionFormValuesProps extends Partial<EditProblemSolution> {
  viewingBeforeProjectChartImages: (File | string)[];
  viewingBeforeProjectImages: (File | string)[];
  viewingAfterProjectChartImages: (File | string)[];
  viewingAfterProjectImages: (File | string)[];
  attachments: ProblemSolutionAttachment[];
  tasks: EditProblemSolutionTask[];
}

type Props = {
  isEdit: boolean;
  currentProblemSolution: ProblemSolution | null;
};

export default function ProblemSolutionForm({ isEdit, currentProblemSolution }: Props) {
  const theme = useTheme();

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const { selectedSite } = useSelector((state: RootState) => state.userSite);

  const NewProblemSolutionSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    headProjectUserId: Yup.number().min(1),
    oeeId: Yup.number().min(1),
  });

  const methods = useForm<ProblemSolutionFormValuesProps>({
    resolver: yupResolver(NewProblemSolutionSchema),
    defaultValues: {
      name: '',
      status: PS_PROCESS_STATUS[0],
      remark: '',
      date: new Date(),
      headProjectUserId: -1,
      approvedByUserId: -1,
      oeeId: -1,
      startDate: new Date(),
      endDate: new Date(),
      attachments: [],
      viewingBeforeProjectChartImages: [],
      viewingBeforeProjectImages: [],
      viewingAfterProjectChartImages: [],
      viewingAfterProjectImages: [],
      deletingAttachments: [],
      tasks: [],
    },
    values: {
      name: currentProblemSolution?.name || '',
      status: currentProblemSolution?.status || PS_PROCESS_STATUS[0],
      remark: currentProblemSolution?.remark || '',
      date: currentProblemSolution?.date || new Date(),
      headProjectUserId: currentProblemSolution?.headProjectUserId || -1,
      approvedByUserId: currentProblemSolution?.approvedByUserId || -1,
      oeeId: currentProblemSolution?.oeeId || -1,
      startDate: currentProblemSolution?.startDate || new Date(),
      endDate: currentProblemSolution?.endDate || new Date(),
      attachments: currentProblemSolution?.attachments || [],
      viewingBeforeProjectChartImages: (currentProblemSolution?.attachments || [])
        .filter((item) => item.groupName === 'beforeProjectChartImages')
        .map((item) => getFileUrl(item.attachment.fileName) || ''),
      viewingBeforeProjectImages: (currentProblemSolution?.attachments || [])
        .filter((item) => item.groupName === 'beforeProjectImages')
        .map((item) => getFileUrl(item.attachment.fileName) || ''),
      viewingAfterProjectChartImages: (currentProblemSolution?.attachments || [])
        .filter((item) => item.groupName === 'afterProjectChartImages')
        .map((item) => getFileUrl(item.attachment.fileName) || ''),
      viewingAfterProjectImages: (currentProblemSolution?.attachments || [])
        .filter((item) => item.groupName === 'afterProjectImages')
        .map((item) => getFileUrl(item.attachment.fileName) || ''),
      deletingAttachments: [],
      tasks: (currentProblemSolution?.tasks || []).map((task) => {
        return {
          id: task?.id,
          title: task?.title || '',
          assigneeUserId: task?.assigneeUserId || -1,
          startDate: task?.startDate || new Date(),
          endDate: task?.endDate || new Date(),
          status: task?.status || PS_PROCESS_STATUS_ON_PROCESS,
          comment: task?.comment || '',
          problemSolutionId: task?.problemSolutionId,
          attachments: task?.attachments || [],
          files: task?.attachments.map((attachment) => attachment.attachment.name),
          addingFiles: [],
          deletingFiles: [],
        };
      }),
    },
  });

  const {
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: ProblemSolutionFormValuesProps) => {
    try {
      const {
        viewingBeforeProjectChartImages,
        viewingBeforeProjectImages,
        viewingAfterProjectChartImages,
        viewingAfterProjectImages,
        tasks,
        ...dto
      } = data;

      dto.approvedByUserId = dto.approvedByUserId === -1 ? null : dto.approvedByUserId;
      dto.beforeProjectChartImages = (viewingBeforeProjectChartImages || []).filter(
        (file) => file instanceof File,
      ) as File[];
      dto.beforeProjectImages = (viewingBeforeProjectImages || []).filter((file) => file instanceof File) as File[];
      dto.afterProjectChartImages = (viewingAfterProjectChartImages || []).filter(
        (file) => file instanceof File,
      ) as File[];
      dto.afterProjectImages = (viewingAfterProjectImages || []).filter((file) => file instanceof File) as File[];
      if (!isEdit && selectedSite) {
        dto.siteId = selectedSite.id;
      }

      const response = await axios.request<ProblemSolution>({
        method: isEdit ? 'put' : 'post',
        url: isEdit ? `/problems-solutions/${currentProblemSolution?.id}` : '/problems-solutions',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        data: dto,
      });

      const { data: problemSolution } = response;
      await createOrUpdateTasks(tasks || [], problemSolution.id);
      if (deletingTasks.length > 0) {
        await deleteTasks(deletingTasks, problemSolution.id);
      }

      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
      navigate(PATH_PROBLEMS_SOLUTIONS.root);
    } catch (error) {
      console.error(error);
    }
  };

  const createOrUpdateTasks = async (tasks: EditProblemSolutionTask[], problemSolutionId: number) => {
    for (let task of tasks) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { attachments, files, ...dto } = task;
      dto.assigneeUserId = dto.assigneeUserId === -1 ? null : dto.assigneeUserId;
      dto.problemSolutionId = problemSolutionId;

      await axios.request<ProblemSolutionTask>({
        method: task.id ? 'put' : 'post',
        url: task.id ? `/problems-solution-tasks/${task.id}` : '/problems-solution-tasks',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        data: dto,
        params: {
          problemSolutionId,
        },
      });
    }
  };

  const deleteTasks = async (deletingTasks: number[], problemSolutionId: number) => {
    await axios.delete('/problems-solution-tasks', {
      params: { ids: deletingTasks, problemSolutionId },
    });
  };

  const handleBeforeProjectChartImageDrop = useCallback(
    (acceptedFiles) => {
      const viewingImages = getValues('viewingBeforeProjectChartImages');
      setValue('viewingBeforeProjectChartImages', [
        ...viewingImages,
        ...acceptedFiles.map((file: Blob | MediaSource) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      ]);
    },
    [getValues, setValue],
  );

  const handleBeforeProjectImageDrop = useCallback(
    (acceptedFiles) => {
      const existingImages = getValues('viewingBeforeProjectImages');
      setValue('viewingBeforeProjectImages', [
        ...existingImages,
        ...acceptedFiles.map((file: Blob | MediaSource) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      ]);
    },
    [getValues, setValue],
  );

  const handleAfterProjectChartImageDrop = useCallback(
    (acceptedFiles) => {
      const existingImages = getValues('viewingAfterProjectChartImages');
      setValue('viewingAfterProjectChartImages', [
        ...existingImages,
        ...acceptedFiles.map((file: Blob | MediaSource) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      ]);
    },
    [getValues, setValue],
  );

  const handleAfterProjectImageDrop = useCallback(
    (acceptedFiles) => {
      const existingImages = getValues('viewingAfterProjectImages');
      setValue('viewingAfterProjectImages', [
        ...existingImages,
        ...acceptedFiles.map((file: Blob | MediaSource) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      ]);
    },
    [getValues, setValue],
  );

  const handleBeforeProjectChartImageRemove = (index: number) => {
    const existingImages = getValues('viewingBeforeProjectChartImages');
    if (typeof existingImages[index] === 'string') {
      removeImage(existingImages[index] as string);
    }

    existingImages.splice(index, 1);
    setValue('viewingBeforeProjectChartImages', existingImages);
  };

  const handleBeforeProjectImageRemove = (index: number) => {
    const existingImages = getValues('viewingBeforeProjectImages');
    if (typeof existingImages[index] === 'string') {
      removeImage(existingImages[index] as string);
    }

    existingImages.splice(index, 1);
    setValue('viewingBeforeProjectImages', existingImages);
  };

  const handleAfterProjectChartImageRemove = (index: number) => {
    const existingImages = getValues('viewingAfterProjectChartImages');
    if (typeof existingImages[index] === 'string') {
      removeImage(existingImages[index] as string);
    }

    existingImages.splice(index, 1);
    setValue('viewingAfterProjectChartImages', existingImages);
  };

  const handleAfterProjectImageRemove = (index: number) => {
    const existingImages = getValues('viewingAfterProjectImages');
    if (typeof existingImages[index] === 'string') {
      removeImage(existingImages[index] as string);
    }

    existingImages.splice(index, 1);
    setValue('viewingAfterProjectImages', existingImages);
  };

  const removeImage = (url: string) => {
    const attachments = getValues('attachments');
    const deletingAttachments = getValues('deletingAttachments') || [];
    const files = attachments.filter((item) => url.indexOf(item.attachment.fileName) >= 0);
    if (files.length !== 0) {
      deletingAttachments.push(files[0].attachmentId);
    }

    setValue('deletingAttachments', deletingAttachments);
  };

  const [oees, setOees] = useState<Oee[]>([]);

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    (async () => {
      try {
        await getOees();
        await getUsers();

        if (currentProblemSolution) {
          setValue('oeeId', currentProblemSolution.oeeId || -1);
          setValue('headProjectUserId', currentProblemSolution.headProjectUserId || -1);
          setValue('approvedByUserId', currentProblemSolution.approvedByUserId || -1);
        }
      } catch (error) {
        console.log(error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProblemSolution]);

  const getOees = async () => {
    try {
      const response = await axios.get<Oee[]>('/oees/all');
      setOees(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getUsers = async () => {
    try {
      const response = await axios.get<User[]>('/users/all');
      setUsers(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const [deletingTasks, setDeletingTasks] = useState<number[]>([]);

  const onDeleteTask = (taskId?: number) => {
    if (taskId) {
      deletingTasks.push(taskId);
      setDeletingTasks(deletingTasks);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <FormHeader
        heading={!isEdit ? 'Create Problems & Solutions' : 'Edit Problems & Solutions'}
        breadcrumbs={
          <Breadcrumbs
            links={[
              { name: 'Home', href: '/' },
              {
                name: 'Problems & Solutions',
                href: PATH_PROBLEMS_SOLUTIONS.root,
              },
              { name: isEdit ? 'Edit' : 'Create' },
            ]}
          />
        }
        action={
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            startIcon={<Iconify icon="eva:save-fill" />}
          >
            {!isEdit ? 'Create' : 'Save'}
          </LoadingButton>
        }
        cancel={
          <Button variant="contained" component={RouterLink} to={PATH_PROBLEMS_SOLUTIONS.root}>
            Cancel
          </Button>
        }
      />

      <Card sx={{ px: theme.spacing(2), py: theme.spacing(3), mb: theme.spacing(3) }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Grid container spacing={3}>
            <Grid item md={8}>
              <RHFTextField name="name" label="Project Name" />
            </Grid>

            <Grid item md={4}>
              <RHFSelect
                name="status"
                label="Status"
                InputLabelProps={{ shrink: true }}
                SelectProps={{ native: false }}
              >
                {PS_PROCESS_STATUS.map((option) => (
                  <MenuItem
                    key={option}
                    value={option}
                    sx={{
                      mx: 1,
                      my: 0.5,
                      borderRadius: 0.75,
                      typography: 'body2',
                    }}
                  >
                    {getPsProcessStatusText(option)}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Grid>

            <Grid item md={4}>
              <Controller
                name="date"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label="Date"
                    value={field.value}
                    onChange={(newValue: any) => {
                      field.onChange(newValue);
                    }}
                    renderInput={(params: any) => (
                      <TextField {...params} fullWidth error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item md={4}>
              <Controller
                name="startDate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label="Start Date"
                    value={field.value}
                    onChange={(newValue: any) => {
                      field.onChange(newValue);
                    }}
                    renderInput={(params: any) => (
                      <TextField {...params} fullWidth error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item md={4}>
              <Controller
                name="endDate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label="End Date"
                    value={field.value}
                    onChange={(newValue: any) => {
                      field.onChange(newValue);
                    }}
                    renderInput={(params: any) => (
                      <TextField {...params} fullWidth error={!!error} helperText={error?.message} />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item md={4}>
              <RHFSelect
                name="headProjectUserId"
                label="Project Head"
                InputLabelProps={{ shrink: true }}
                SelectProps={{ native: false }}
              >
                <MenuItem
                  value={-1}
                  sx={{
                    mx: 1,
                    borderRadius: 0.75,
                    typography: 'body2',
                    fontStyle: 'italic',
                    color: 'text.secondary',
                  }}
                >
                  None
                </MenuItem>

                <Divider />

                {users.map((user) => (
                  <MenuItem
                    key={user.id}
                    value={user.id}
                    sx={{
                      mx: 1,
                      my: 0.5,
                      borderRadius: 0.75,
                      typography: 'body2',
                      textTransform: 'capitalize',
                    }}
                  >
                    {user.firstName} {user.lastName}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Grid>

            <Grid item md={4}>
              <RHFSelect
                name="approvedByUserId"
                label="Approved By"
                InputLabelProps={{ shrink: true }}
                SelectProps={{ native: false }}
              >
                <MenuItem
                  value={-1}
                  sx={{
                    mx: 1,
                    borderRadius: 0.75,
                    typography: 'body2',
                    fontStyle: 'italic',
                    color: 'text.secondary',
                  }}
                >
                  None
                </MenuItem>

                <Divider />

                {users.map((user) => (
                  <MenuItem
                    key={user.id}
                    value={user.id}
                    sx={{
                      mx: 1,
                      my: 0.5,
                      borderRadius: 0.75,
                      typography: 'body2',
                      textTransform: 'capitalize',
                    }}
                  >
                    {user.firstName} {user.lastName}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Grid>

            <Grid item md={4}>
              <RHFSelect
                name="oeeId"
                label="Production"
                InputLabelProps={{ shrink: true }}
                SelectProps={{ native: false }}
              >
                <MenuItem
                  value={-1}
                  sx={{
                    mx: 1,
                    borderRadius: 0.75,
                    typography: 'body2',
                    fontStyle: 'italic',
                    color: 'text.secondary',
                  }}
                >
                  None
                </MenuItem>

                <Divider />

                {oees.map((oee) => (
                  <MenuItem
                    key={oee.id}
                    value={oee.id}
                    sx={{
                      mx: 1,
                      my: 0.5,
                      borderRadius: 0.75,
                      typography: 'body2',
                      textTransform: 'capitalize',
                    }}
                  >
                    {oee.productionName}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Grid>

            <Grid item md={12}>
              <EditorLabelStyle>Remark</EditorLabelStyle>
              <RHFEditor simple name="remark" />
            </Grid>
          </Grid>

          <ProblemSolutionTaskList users={users} onDeleteTask={onDeleteTask} />

          <Box>
            <EditorLabelStyle>Before - Charts</EditorLabelStyle>
            <RHFGalleryUploadMultiFile
              name="viewingBeforeProjectChartImages"
              accept="image/*"
              maxSize={3145728}
              onDrop={handleBeforeProjectChartImageDrop}
              onRemove={handleBeforeProjectChartImageRemove}
            />
          </Box>

          <Box>
            <EditorLabelStyle>Before - Photos</EditorLabelStyle>
            <RHFGalleryUploadMultiFile
              name="viewingBeforeProjectImages"
              accept="image/*"
              maxSize={3145728}
              onDrop={handleBeforeProjectImageDrop}
              onRemove={handleBeforeProjectImageRemove}
            />
          </Box>

          <Box>
            <EditorLabelStyle>After - Charts</EditorLabelStyle>
            <RHFGalleryUploadMultiFile
              name="viewingAfterProjectChartImages"
              accept="image/*"
              maxSize={3145728}
              onDrop={handleAfterProjectChartImageDrop}
              onRemove={handleAfterProjectChartImageRemove}
            />
          </Box>

          <Box>
            <EditorLabelStyle>After - Photos</EditorLabelStyle>
            <RHFGalleryUploadMultiFile
              name="viewingAfterProjectImages"
              accept="image/*"
              maxSize={3145728}
              onDrop={handleAfterProjectImageDrop}
              onRemove={handleAfterProjectImageRemove}
            />
          </Box>
        </Box>
      </Card>
    </FormProvider>
  );
}
