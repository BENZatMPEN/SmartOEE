import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Box, Card, CardContent, Grid, Stack } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { EditProfile } from '../../@types/user';
import Breadcrumbs from '../../components/Breadcrumbs';
import FormHeader from '../../components/FormHeader';
import { FormProvider, RHFSwitch, RHFTextField, RHFUploadSingleFile } from '../../components/hook-form';
import Iconify from '../../components/Iconify';
import { RootState, useDispatch, useSelector } from '../../redux/store';
import { getFileUrl } from '../../utils/imageHelper';
import { updateProfile } from '../../redux/actions/authAction';

export default function UserProfileForm() {
  const dispatch = useDispatch();

  const { userProfile, saveError } = useSelector((state: RootState) => state.auth);

  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    email: Yup.string().email().required('Email is required'),
  });

  const methods = useForm<EditProfile>({
    resolver: yupResolver(NewUserSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      image: null,
    },
    values: {
      firstName: userProfile?.firstName || '',
      lastName: userProfile?.lastName || '',
      email: userProfile?.email || '',
      image: null,
    },
  });

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: EditProfile) => {
    const user = await dispatch(updateProfile(data));

    if (user) {
      enqueueSnackbar('Update success!');
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

  const handleDrop = useCallback(
    (acceptedFiles) => {
      setValue(
        'image',
        Object.assign(acceptedFiles[0], {
          preview: URL.createObjectURL(acceptedFiles[0]),
        }),
      );
    },
    [setValue],
  );

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <FormHeader
        heading={'Edit Profile'}
        breadcrumbs={<Breadcrumbs links={[{ name: 'Home', href: '/' }, { name: 'Edit Profile' }]} />}
        action={
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            startIcon={<Iconify icon="eva:save-fill" />}
          >
            Save
          </LoadingButton>
        }
      />

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <RHFUploadSingleFile
                name="image"
                accept="image/*"
                maxSize={3145728}
                onDrop={handleDrop}
                currentFile={userProfile?.imageName ? getFileUrl(userProfile?.imageName) : ''}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={8}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="firstName" label="First Name" />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="lastName" label="Last Name" />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="email" label="Email" />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
