import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Box, Button, Card, Divider, Grid, MenuItem, TextField, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { ChangeEvent, useCallback, useContext, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { EditFaq, FaqAttachment } from '../../../@types/faq';
import { RoleAction, RoleSubject } from '../../../@types/role';
import { User } from '../../../@types/user';
import { AbilityContext } from '../../../caslContext';
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
import {
  FAQ_PROCESS_STATUS_APPROVED,
  FAQ_PROCESS_STATUS_COMPLETED,
  FAQ_PROCESS_STATUS_ON_PROCESS,
  FAQ_PROCESS_STATUS_WAITING,
} from '../../../constants';
import { createFaq, updateFaq } from '../../../redux/actions/faqAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import { PATH_FAQS } from '../../../routes/paths';
import axios from '../../../utils/axios';
import { getFaqProcessStatusText } from '../../../utils/formatText';
import { getFileUrl } from '../../../utils/imageHelper';

interface FormValuesProps extends EditFaq {
  attachments: FaqAttachment[];
  viewingImages: (File | string)[];
  viewingFiles: string[];
}

type Props = {
  isEdit: boolean;
};

export default function FaqForm({ isEdit }: Props) {
  const theme = useTheme();

  const ability = useContext(AbilityContext);

  const canApprove = ability.can(RoleAction.Approve, RoleSubject.Faqs);
  const statusOpts = canApprove
    ? [
        FAQ_PROCESS_STATUS_ON_PROCESS,
        FAQ_PROCESS_STATUS_WAITING,
        FAQ_PROCESS_STATUS_COMPLETED,
        FAQ_PROCESS_STATUS_APPROVED,
      ]
    : [FAQ_PROCESS_STATUS_ON_PROCESS, FAQ_PROCESS_STATUS_WAITING, FAQ_PROCESS_STATUS_COMPLETED];

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const { currentFaq, saveError } = useSelector((state: RootState) => state.faq);

  const { enqueueSnackbar } = useSnackbar();

  const [formValues, setFormValues] = useState<FormValuesProps | undefined>(undefined);

  useEffect(() => {
    (async () => {
      await getUsers();

      setFormValues({
        topic: currentFaq?.topic || '',
        description: currentFaq?.description || '',
        status: currentFaq?.status || FAQ_PROCESS_STATUS_ON_PROCESS,
        remark: currentFaq?.remark || '',
        createdByUserId: currentFaq?.createdByUserId || -1,
        approvedByUserId: currentFaq?.approvedByUserId || -1,
        date: currentFaq?.date || new Date(),
        startDate: currentFaq?.startDate || new Date(),
        endDate: currentFaq?.endDate || new Date(),
        attachments: currentFaq?.attachments || [],
        viewingImages: isEdit
          ? (currentFaq?.attachments || [])
              .filter((item) => item.groupName === 'images')
              .map((item) => `${getFileUrl(item.attachment.fileName)}`)
          : [],
        viewingFiles: isEdit
          ? (currentFaq?.attachments || [])
              .filter((item) => item.groupName === 'attachments')
              .map((attachment) => attachment.attachment.name)
          : [],
        images: [],
        files: [],
        deletingAttachments: [],
      });
    })();
    return () => {
      setUsers([]);
    };
  }, [currentFaq]);

  const [users, setUsers] = useState<User[]>([]);

  const getUsers = async () => {
    try {
      const response = await axios.get<User[]>('/users/all');
      setUsers(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const NewFaqSchema = Yup.object().shape({
    topic: Yup.string().required('Topic is required'),
    createdByUserId: Yup.number().min(1),
  });

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewFaqSchema),
    defaultValues: {
      topic: '',
      description: '',
      status: FAQ_PROCESS_STATUS_ON_PROCESS,
      remark: '',
      createdByUserId: -1,
      approvedByUserId: -1,
      date: new Date(),
      startDate: new Date(),
      endDate: new Date(),
      attachments: [],
      viewingImages: [],
      viewingFiles: [],
      images: [],
      files: [],
      deletingAttachments: [],
    },
    values: formValues,
  });

  const {
    watch,
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = async (data: FormValuesProps) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { viewingImages, attachments, viewingFiles, ...dto } = data;
      dto.images = (viewingImages || []).filter((file) => file instanceof File) as File[];

      const faq = isEdit && currentFaq ? await dispatch(updateFaq(currentFaq.id, dto)) : await dispatch(createFaq(dto));

      if (faq) {
        enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
        navigate(PATH_FAQS.root);
      }
      console.log(dto);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (saveError) {
      if (saveError instanceof AxiosError) {
        if ('message' in saveError.response?.data) {
          if (Array.isArray(saveError.response?.data.message)) {
            for (const item of saveError.response?.data.message) {
              enqueueSnackbar(item, { variant: 'error' });
            }
          } else {
            enqueueSnackbar(saveError.response?.data.message, { variant: 'error' });
          }
        }
      } else {
        enqueueSnackbar(saveError.response?.data.error, { variant: 'error' });
      }
    }
  }, [enqueueSnackbar, saveError]);

  const handleImageDrop = useCallback(
    (acceptedFiles) => {
      const viewingImages = getValues('viewingImages');
      setValue('viewingImages', [
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

  const handleImageRemove = (index: number) => {
    const viewingImages = getValues('viewingImages');
    if (typeof viewingImages[index] === 'string') {
      removeImage(viewingImages[index] as string);
    }

    viewingImages.splice(index, 1);
    setValue('viewingImages', viewingImages);
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

  const handleFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event?.target.files) {
      return;
    }

    const viewingFiles = getValues('viewingFiles');
    const addingFiles = getValues('files') || [];

    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      if (addingFiles.filter((addingFile) => addingFile.name === file.name).length === 0) {
        addingFiles.push(file);
        viewingFiles.push(file.name);
      }
    }

    setValue('viewingFiles', viewingFiles);
    setValue('files', addingFiles);
  };

  const handleFileDeleted = (index: number, fileName: string) => {
    const attachments = getValues('attachments');
    const viewingFiles = getValues('viewingFiles');
    const addingFiles = getValues('files') || [];
    const deletingAttachments = getValues('deletingAttachments') || [];

    // filter deleting attachments
    deletingAttachments.push(
      ...attachments.filter((item) => item.attachment.name === fileName).map((item) => item.attachmentId),
    );
    setValue('deletingAttachments', deletingAttachments);
    setValue(
      'attachments',
      attachments.filter((item) => item.attachment.name !== fileName),
    );

    // remove adding files
    setValue(
      'files',
      addingFiles.filter((item) => item.name !== fileName),
    );

    // remove displaying files
    setValue(
      'viewingFiles',
      viewingFiles.filter((item) => item !== fileName),
    );
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
                {statusOpts.map((option) => (
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
                SelectProps={{ native: false, disabled: !canApprove }}
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

            {values.viewingFiles.length !== 0 && (
              <Box sx={{ mb: theme.spacing(2), display: 'flex', gap: theme.spacing(1), flexWrap: 'wrap' }}>
                {values.viewingFiles.map((item, itemIndex) => (
                  <Label
                    key={item}
                    variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                    color={'default'}
                    sx={{ py: 1.8, fontSize: '0.85rem' }}
                  >
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Iconify icon="eva:attach-fill" fontSize={'1rem'} />
                      {item}
                      <Iconify
                        icon="eva:close-fill"
                        fontSize={'1rem'}
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleFileDeleted(itemIndex, item)}
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
              name="viewingImages"
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
