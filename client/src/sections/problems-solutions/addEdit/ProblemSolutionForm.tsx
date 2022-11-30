import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Box, Button, Card, Divider, Grid, MenuItem, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Oee } from '../../../@types/oee';
import { ProblemSolution, ProblemSolutionTask } from '../../../@types/problemSolution';
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
import { PS_PROCESS_STATUS } from '../../../constants';
import { RootState, useSelector } from '../../../redux/store';
import { PATH_PROBLEMS_SOLUTIONS } from '../../../routes/paths';
import axios from '../../../utils/axios';
import { getPsProcessStatusText } from '../../../utils/formatText';
import ProblemSolutionTaskList from './ProblemSolutionTaskList';

interface FormValuesProps extends Partial<ProblemSolution> {
  beforeProjectChartImages: File[] | string[];
  beforeProjectImages: File[] | string[];
  afterProjectChartImages: File[] | string[];
  afterProjectImages: File[] | string[];
  deletingImages: number[];
}

type Props = {
  isEdit: boolean;
  currentProblemSolution: ProblemSolution | null;
};

export default function ProblemSolutionForm({ isEdit, currentProblemSolution }: Props) {
  const theme = useTheme();

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const { selectedSite } = useSelector((state: RootState) => state.site);

  const NewProblemSolutionSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
  });

  const defaultValues = useMemo(
    () => ({
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
      siteId: currentProblemSolution?.siteId || selectedSite?.id,
      beforeProjectChartImages: (currentProblemSolution?.attachments || [])
        .filter((item) => item.groupName === 'beforeProjectChartImages')
        .map((item) => item.attachment.url),
      beforeProjectImages: (currentProblemSolution?.attachments || [])
        .filter((item) => item.groupName === 'beforeProjectImages')
        .map((item) => item.attachment.url),
      afterProjectChartImages: (currentProblemSolution?.attachments || [])
        .filter((item) => item.groupName === 'afterProjectChartImages')
        .map((item) => item.attachment.url),
      afterProjectImages: (currentProblemSolution?.attachments || [])
        .filter((item) => item.groupName === 'afterProjectImages')
        .map((item) => item.attachment.url),
      deletingImages: [],
      tasks: (currentProblemSolution?.tasks || []).map((task) => {
        return {
          ...task,
          assigneeUserId: task.assigneeUserId || -1,
          attachments: task.attachments || [],
          files: task.attachments.map((attachment) => attachment.attachment.name),
          addingFiles: [],
          deletingFiles: [],
        };
      }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentProblemSolution],
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewProblemSolutionSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (isEdit && currentProblemSolution) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentProblemSolution]);

  const onSubmit = async (data: FormValuesProps) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {
        headProjectUser,
        approvedByUser,
        headProjectUserId,
        approvedByUserId,
        oee,
        oeeId,
        beforeProjectChartImages,
        beforeProjectImages,
        afterProjectChartImages,
        afterProjectImages,
        deletingImages,
        tasks,
        ...other
      } = data;
      let problemSolution: ProblemSolution;
      const dto = {
        ...other,
        headProjectUserId: headProjectUserId === -1 ? null : headProjectUserId,
        approvedByUserId: approvedByUserId === -1 ? null : approvedByUserId,
        oeeId: oeeId === -1 ? null : oeeId,
      };

      if (isEdit && currentProblemSolution) {
        const response = await axios.put<ProblemSolution>(`/problems-solutions/${currentProblemSolution.id}`, dto);
        problemSolution = response.data;
      } else {
        const response = await axios.post<ProblemSolution>(`/problems-solutions`, dto);
        problemSolution = response.data;
      }

      if (beforeProjectChartImages && beforeProjectChartImages.length > 0) {
        await uploadImages(problemSolution.id, 'beforeProjectChartImages', beforeProjectChartImages);
      }

      if (beforeProjectImages && beforeProjectImages.length > 0) {
        await uploadImages(problemSolution.id, 'beforeProjectImages', beforeProjectImages);
      }

      if (afterProjectChartImages && afterProjectChartImages.length > 0) {
        await uploadImages(problemSolution.id, 'afterProjectChartImages', afterProjectChartImages);
      }

      if (afterProjectImages && afterProjectImages.length > 0) {
        await uploadImages(problemSolution.id, 'afterProjectImages', afterProjectImages);
      }

      if (deletingImages.length > 0) {
        await deleteImages(problemSolution.id, deletingImages);
      }

      await createOrUpdateTasks(tasks || [], problemSolution.id);

      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
      navigate(PATH_PROBLEMS_SOLUTIONS.root);
    } catch (error) {
      console.error(error);
    }
  };

  const uploadImages = async (id: number, fieldName: string, images: (File | string)[]): Promise<void> => {
    const formData = new FormData();
    (images || []).forEach((image) => {
      if (image instanceof File) {
        const item = image as File;
        formData.append('images', item, item.name);
      }
    });

    await axios.post(`/problems-solutions/${id}/upload-files`, formData, {
      params: { name: fieldName },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  const deleteImages = async (id: number, imageIds: number[]): Promise<void> => {
    const url = `/problems-solutions/${id}/delete-files`;
    await axios.delete(url, { params: { ids: imageIds } });
  };

  const createOrUpdateTasks = async (tasks: ProblemSolutionTask[], problemSolutionId: number) => {
    for (let task of tasks) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { assigneeUserId, assigneeUser, attachments, files, addingFiles, deletingFiles, ...other } = task;
      console.log(assigneeUserId);
      const dto = {
        ...other,
        problemSolutionId: problemSolutionId,
        assigneeUserId: assigneeUserId === -1 ? null : assigneeUserId,
      };

      let problemSolutionTask: ProblemSolutionTask;

      if (task.id) {
        // update
        const response = await axios.put<ProblemSolutionTask>(`/problems-solution-tasks/${task.id}`, dto, {
          params: { problemSolutionId },
        });
        problemSolutionTask = response.data;
      } else {
        // create
        const response = await axios.post<ProblemSolutionTask>(`/problems-solution-tasks`, dto, {
          params: { problemSolutionId },
        });
        problemSolutionTask = response.data;
      }

      if (addingFiles.length !== 0) {
        await uploadTaskAttachments(problemSolutionTask.id, 'attachments', addingFiles, problemSolutionId);
      }

      if (deletingFiles.length !== 0) {
        await deleteTaskAttachments(problemSolutionTask.id, deletingFiles, problemSolutionId);
      }
    }
  };

  const uploadTaskAttachments = async (
    id: number,
    fieldName: string,
    attachments: File[],
    problemSolutionId: number,
  ): Promise<void> => {
    const formData = new FormData();
    attachments.forEach((image) => {
      formData.append('images', image, image.name);
    });

    const url = `/problems-solution-tasks/${id}/upload-files`;
    await axios.post(url, formData, {
      params: { name: fieldName, problemSolutionId },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  const deleteTaskAttachments = async (
    id: number,
    attachmentIds: number[],
    problemSolutionId: number,
  ): Promise<void> => {
    const url = `/problems-solution-tasks/${id}/delete-files`;
    await axios.delete(url, { params: { ids: attachmentIds, problemSolutionId } });
  };

  const handleBeforeProjectChartImageDrop = useCallback(
    (acceptedFiles) => {
      const existingImages = getValues('beforeProjectChartImages');
      setValue('beforeProjectChartImages', [
        ...existingImages,
        ...acceptedFiles.map((file: Blob | MediaSource) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      ]);
    },
    [setValue],
  );

  const handleBeforeProjectImageDrop = useCallback(
    (acceptedFiles) => {
      const existingImages = getValues('beforeProjectImages');
      setValue('beforeProjectImages', [
        ...existingImages,
        ...acceptedFiles.map((file: Blob | MediaSource) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      ]);
    },
    [setValue],
  );

  const handleAfterProjectChartImageDrop = useCallback(
    (acceptedFiles) => {
      const existingImages = getValues('afterProjectChartImages');
      setValue('afterProjectChartImages', [
        ...existingImages,
        ...acceptedFiles.map((file: Blob | MediaSource) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      ]);
    },
    [setValue],
  );

  const handleAfterProjectImageDrop = useCallback(
    (acceptedFiles) => {
      const existingImages = getValues('afterProjectImages');
      setValue('afterProjectImages', [
        ...existingImages,
        ...acceptedFiles.map((file: Blob | MediaSource) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      ]);
    },
    [setValue],
  );

  const handleBeforeProjectChartImageRemove = (index: number) => {
    const existingImages = values.beforeProjectChartImages as any[];
    if (typeof existingImages[index] === 'string') {
      removeImage(existingImages[index]);
    }

    existingImages.splice(index, 1);
    setValue('beforeProjectChartImages', existingImages);
  };

  const handleBeforeProjectImageRemove = (index: number) => {
    const existingImages = values.beforeProjectImages as any[];
    if (typeof existingImages[index] === 'string') {
      removeImage(existingImages[index]);
    }

    existingImages.splice(index, 1);
    setValue('beforeProjectImages', existingImages);
  };

  const handleAfterProjectChartImageRemove = (index: number) => {
    const existingImages = values.afterProjectChartImages as any[];
    if (typeof existingImages[index] === 'string') {
      removeImage(existingImages[index]);
    }

    existingImages.splice(index, 1);
    setValue('afterProjectChartImages', existingImages);
  };

  const handleAfterProjectImageRemove = (index: number) => {
    const existingImages = values.afterProjectImages as any[];
    if (typeof existingImages[index] === 'string') {
      removeImage(existingImages[index]);
    }

    existingImages.splice(index, 1);
    setValue('afterProjectImages', existingImages);
  };

  const removeImage = (url: string) => {
    const deletingImages = (values.attachments || []).filter((item) => item.attachment.url === url);
    if (deletingImages.length !== 0) {
      values.deletingImages.push(deletingImages[0].attachmentId);
    }
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

          <ProblemSolutionTaskList users={users} />

          <Box>
            <EditorLabelStyle>Before - Charts</EditorLabelStyle>
            <RHFGalleryUploadMultiFile
              name="beforeProjectChartImages"
              accept="image/*"
              maxSize={3145728}
              onDrop={handleBeforeProjectChartImageDrop}
              onRemove={handleBeforeProjectChartImageRemove}
            />
          </Box>

          <Box>
            <EditorLabelStyle>Before - Photos</EditorLabelStyle>
            <RHFGalleryUploadMultiFile
              name="beforeProjectImages"
              accept="image/*"
              maxSize={3145728}
              onDrop={handleBeforeProjectImageDrop}
              onRemove={handleBeforeProjectImageRemove}
            />
          </Box>

          <Box>
            <EditorLabelStyle>After - Charts</EditorLabelStyle>
            <RHFGalleryUploadMultiFile
              name="afterProjectChartImages"
              accept="image/*"
              maxSize={3145728}
              onDrop={handleAfterProjectChartImageDrop}
              onRemove={handleAfterProjectChartImageRemove}
            />
          </Box>

          <Box>
            <EditorLabelStyle>After - Photos</EditorLabelStyle>
            <RHFGalleryUploadMultiFile
              name="afterProjectImages"
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
