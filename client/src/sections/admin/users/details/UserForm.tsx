import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Box, Button, Card, CardContent, Grid, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { EditUser, User } from '../../../../@types/user';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import FormHeader from '../../../../components/FormHeader';
import { FormProvider, RHFTextField, RHFUploadSingleFile } from '../../../../components/hook-form';
import Iconify from '../../../../components/Iconify';
import { RootState, useSelector } from '../../../../redux/store';
import { PATH_ADMINISTRATOR } from '../../../../routes/paths';
import axios from '../../../../utils/axios';

interface FormValuesProps extends Partial<EditUser> {
  confirmPassword: string;
  image: File;
  isNew: boolean;
}

type Props = {
  isEdit: boolean;
  currentUser: User | undefined;
};

export default function UserForm({ isEdit, currentUser }: Props) {
  const theme = useTheme();

  const navigate = useNavigate();

  const { selectedSite } = useSelector((state: RootState) => state.site);

  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    isNew: Yup.boolean(),
    firstName: Yup.string().required('First Name is required'),
    email: Yup.string().email().required('Email is required'),
    password: Yup.string().when('isNew', { is: true, then: Yup.string().required('Password is required') }),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .when('isNew', {
        is: true,
        then: Yup.string().required('ConfirmPassword is required'),
      }),
  });

  const defaultValues = useMemo(
    () => ({
      email: currentUser?.email || '',
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
      password: '',
      confirmPassword: '',
      siteId: selectedSite?.id,
      isNew: !isEdit,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser],
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (isEdit && currentUser) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentUser]);

  const onSubmit = async (data: FormValuesProps) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { image, isNew, confirmPassword, ...dto } = data;
      let user: User;
      if (isEdit && currentUser) {
        const response = await axios.put<User>(`/users/${currentUser?.id}`, dto);
        user = response.data;
      } else {
        const response = await axios.post<User>(`/users`, dto);
        user = response.data;
      }

      if (image) {
        await axios.post(
          `/users/${user.id}/upload`,
          { image },
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );
      }

      enqueueSnackbar(!isNew ? 'Create success!' : 'Update success!');
      navigate(PATH_ADMINISTRATOR.users.root);
    } catch (error) {
      console.error(error);
    }
  };

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
        heading={!isEdit ? 'Create User' : 'Edit User'}
        breadcrumbs={
          <Breadcrumbs
            links={[
              { name: 'Home', href: '/' },
              {
                name: 'Users',
                href: PATH_ADMINISTRATOR.users.root,
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
          <Button variant="contained" component={RouterLink} to={PATH_ADMINISTRATOR.users.root}>
            Cancel
          </Button>
        }
      />

      <Grid container spacing={theme.spacing(3)}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <RHFUploadSingleFile
                name="image"
                accept="image/*"
                maxSize={3145728}
                onDrop={handleDrop}
                currentFile={currentUser?.imageUrl}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Stack spacing={theme.spacing(3)}>
                <Box>
                  <Grid container spacing={theme.spacing(3)}>
                    <Grid item xs={12} md={6}>
                      <RHFTextField name="firstName" label="First Name" />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <RHFTextField name="lastName" label="Last Name" />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <RHFTextField name="email" label="Email" />
                    </Grid>
                  </Grid>
                </Box>

                {!isEdit && (
                  <Box>
                    <Grid container spacing={theme.spacing(3)}>
                      <Grid item xs={12} md={6}>
                        <RHFTextField name="password" label="Password" />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <RHFTextField name="confirmPassword" label="Confirm Password" />
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
