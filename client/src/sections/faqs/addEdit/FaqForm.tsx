import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Box, Button, Card, Divider, Grid, MenuItem, TextField, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { useSnackbar } from 'notistack';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Faq } from '../../../@types/faq';
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
import Label from '../../../components/Label';
import { FAQ_PROCESS_STATUS } from '../../../constants';
import { RootState, useSelector } from '../../../redux/store';
import { PATH_FAQS } from '../../../routes/paths';
import axios from '../../../utils/axios';
import { getFaqProcessStatusText } from '../../../utils/formatText';

interface FormValuesProps extends Partial<Faq> {
  images: (File | string)[];
  files: string[];
  addingFiles: File[];
  deletingFiles: number[];
}

type Props = {
  isEdit: boolean;
  currentFaq: Faq | null;
};

export default function FaqForm({ isEdit, currentFaq }: Props) {
  const theme = useTheme();

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const { selectedSite } = useSelector((state: RootState) => state.site);

  const NewFaqSchema = Yup.object().shape({
    topic: Yup.string().required('Topic is required'),
  });

  const defaultValues = useMemo(
    () => ({
      topic: currentFaq?.topic || '',
      description: currentFaq?.description || '',
      status: currentFaq?.status || FAQ_PROCESS_STATUS[0],
      remark: currentFaq?.remark || '',
      createdByUserId: currentFaq?.createdByUserId || -1,
      approvedByUserId: currentFaq?.approvedByUserId || -1,
      date: currentFaq?.date || new Date(),
      startDate: currentFaq?.startDate || new Date(),
      endDate: currentFaq?.endDate || new Date(),
      attachments: currentFaq?.attachments || [],
      siteId: currentFaq?.siteId || selectedSite?.id,
      images: (currentFaq?.attachments || [])
        .filter((item) => item.groupName === 'images')
        .map((item) => item.attachment.url),
      files: (currentFaq?.attachments || [])
        .filter((item) => item.groupName === 'attachments')
        .map((attachment) => attachment.attachment.name),
      addingFiles: [],
      deletingFiles: [],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentFaq],
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewFaqSchema),
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
    if (isEdit && currentFaq) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentFaq]);

  const onSubmit = async (data: FormValuesProps) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {
        createdByUser,
        approvedByUser,
        createdByUserId,
        approvedByUserId,
        images,
        files,
        addingFiles,
        deletingFiles,
        ...other
      } = data;
      let faq: Faq;

      const dto = {
        ...other,
        createdByUserId: createdByUserId === -1 ? null : createdByUserId,
        approvedByUserId: approvedByUserId === -1 ? null : approvedByUserId,
      };

      if (isEdit && currentFaq) {
        const response = await axios.put<Faq>(`/faqs/${currentFaq.id}`, dto);
        faq = response.data;
      } else {
        const response = await axios.post(`/faqs`, dto);
        faq = response.data;
      }

      await uploadFiles(faq.id, 'images', images);
      await uploadFiles(faq.id, 'attachments', addingFiles);

      if (deletingFiles.length > 0) {
        await deleteFiles(faq.id, deletingFiles);
      }

      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
      navigate(PATH_FAQS.root);
    } catch (error) {
      console.error(error);
    }
  };

  const uploadFiles = async (id: number, fieldName: string, files: (File | string)[]): Promise<void> => {
    const formData = new FormData();
    (files || []).forEach((image) => {
      if (image instanceof File) {
        const item = image as File;
        formData.append('images', item, item.name);
      }
    });

    await axios.post(`/faqs/${id}/upload-files`, formData, {
      params: { name: fieldName },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  const deleteFiles = async (id: number, fileIds: number[]): Promise<void> => {
    const url = `/faqs/${id}/delete-files`;
    await axios.delete(url, { params: { ids: fileIds } });
  };

  const handleImageDrop = useCallback(
    (acceptedFiles) => {
      const existingImages = getValues('images');
      setValue('images', [
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

  const handleImageRemove = (index: number) => {
    const existingImages = getValues('images');
    if (typeof existingImages[index] === 'string') {
      removeImage(existingImages[index] as string);
    }

    existingImages.splice(index, 1);
    setValue('images', existingImages);
  };

  const removeImage = (url: string) => {
    const attachments = getValues('attachments') || [];
    const deletingFiles = getValues('deletingFiles');
    const files = attachments.filter((item) => item.attachment.url === url);
    if (files.length !== 0) {
      deletingFiles.push(files[0].attachmentId);
    }

    setValue('deletingFiles', deletingFiles);
  };

  const handleFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event?.target.files) {
      return;
    }

    const files = getValues('files');
    const addingFiles = getValues('addingFiles');

    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      if (addingFiles.filter((addingFile) => addingFile.name === file.name).length === 0) {
        addingFiles.push(file);
        files.push(file.name);
      }
    }

    setValue('files', files);
    setValue('addingFiles', addingFiles);
  };

  const handleFileDeleted = (index: number, fileName: string) => {
    const attachments = getValues('attachments') || [];
    const files = getValues('files');
    const addingFiles = getValues('addingFiles');
    const deletingFiles = getValues('deletingFiles');

    // filter deleting attachments
    const deletingAttachments = attachments.filter((item) => item.attachment.name === fileName);
    setValue(
      'attachments',
      attachments.filter((item) => item.attachment.name !== fileName),
    );

    setValue('deletingFiles', [...deletingFiles, ...deletingAttachments.map((item) => item.attachmentId)]);

    // remove adding files
    setValue(
      'addingFiles',
      addingFiles.filter((item) => item.name !== fileName),
    );

    // remove displaying files
    setValue(
      'files',
      files.filter((item) => item !== fileName),
    );
  };

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    (async () => {
      try {
        await getUsers();

        if (currentFaq) {
          setValue('createdByUserId', currentFaq.createdByUserId || -1);
          setValue('approvedByUserId', currentFaq.approvedByUserId || -1);
        }
      } catch (error) {
        console.log(error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFaq]);

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
        heading={!isEdit ? 'Create FAQ' : 'Edit FAQ'}
        breadcrumbs={
          <Breadcrumbs
            links={[
              { name: 'Home', href: '/' },
              {
                name: 'Knowledge & FAQs',
                href: PATH_FAQS.root,
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
          <Button variant="contained" component={RouterLink} to={PATH_FAQS.root}>
            Cancel
          </Button>
        }
      />

      <Card sx={{ px: theme.spacing(2), py: theme.spacing(3), mb: theme.spacing(3) }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Grid container spacing={3}>
            <Grid item md={8}>
              <RHFTextField name="topic" label="Topic" />
            </Grid>

            <Grid item md={4}>
              <RHFSelect
                name="status"
                label="Status"
                InputLabelProps={{ shrink: true }}
                SelectProps={{ native: false }}
              >
                {FAQ_PROCESS_STATUS.map((option) => (
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
                    {getFaqProcessStatusText(option)}
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
                name="createdByUserId"
                label="Created By"
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

            <Grid item md={12}>
              <EditorLabelStyle>Description</EditorLabelStyle>
              <RHFEditor simple name="description" />
            </Grid>

            <Grid item md={12}>
              <EditorLabelStyle>Remark</EditorLabelStyle>
              <RHFEditor simple name="remark" />
            </Grid>
          </Grid>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" paragraph sx={{ color: 'text.disabled' }}>
                  Attachments
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box sx={{ flexShrink: 0 }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      fontWeight: '700',
                      fontSize: '0.875rem',
                      backgroundColor: 'transparent',
                      padding: '4px 5px',
                      cursor: 'pointer',
                      borderRadius: '8px',
                    }}
                  >
                    <Iconify icon="eva:attach-2-fill" fontSize={'18px'} sx={{ marginRight: '6px' }} />
                    <input
                      type="file"
                      multiple
                      accept="image/*,.xlsx,.xls,.doc,.docx,.ppt,.pptx,.txt,.pdf"
                      onChange={(event) => handleFilesSelected(event)}
                      style={{ display: 'none' }}
                    />
                    Add Attachments
                  </label>
                </Box>
              </Box>
            </Box>

            {values.files.length !== 0 && (
              <Box sx={{ mb: theme.spacing(2), display: 'flex', gap: theme.spacing(1), flexWrap: 'wrap' }}>
                {values.files.map((file, fileIndex) => (
                  <Label
                    key={file}
                    variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                    color={'default'}
                    sx={{ py: 1.8, fontSize: '0.85rem' }}
                  >
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Iconify icon="eva:attach-fill" fontSize={'1rem'} />
                      {file}
                      <Iconify
                        icon="eva:close-fill"
                        fontSize={'1rem'}
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleFileDeleted(fileIndex, file)}
                      />
                    </Box>
                  </Label>
                ))}
              </Box>
            )}
          </Box>

          <Box>
            <Typography variant="h6" paragraph sx={{ color: 'text.disabled' }}>
              Photos
            </Typography>

            <RHFGalleryUploadMultiFile
              name="images"
              accept="image/*"
              maxSize={3145728}
              onDrop={handleImageDrop}
              onRemove={handleImageRemove}
            />
          </Box>
        </Box>
      </Card>
    </FormProvider>
  );
}
