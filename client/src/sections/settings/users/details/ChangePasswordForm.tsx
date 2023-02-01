import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Button, Card, CardContent, Grid, Stack } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { EditUserPassword } from '../../../../@types/user';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import FormHeader from '../../../../components/FormHeader';
import { FormProvider, RHFTextField } from '../../../../components/hook-form';
import Iconify from '../../../../components/Iconify';
import { changeUserPassword } from '../../../../redux/actions/userAction';
import { RootState, useDispatch, useSelector } from '../../../../redux/store';
import { PATH_SETTINGS } from '../../../../routes/paths';

export default function ChangePasswordForm() {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { currentUser, saveError } = useSelector((state: RootState) => state.user);

  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    password: Yup.string().when('isNew', { is: true, then: Yup.string().required('Password is required') }),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .when('isNew', {
        is: true,
        then: Yup.string().required('ConfirmPassword is required'),
      }),
  });

  const methods = useForm<EditUserPassword>({
    resolver: yupResolver(NewUserSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: EditUserPassword) => {
    if (currentUser) {
      await dispatch(changeUserPassword(currentUser.id, data));
    }

    enqueueSnackbar('Change password success!');
    navigate(PATH_SETTINGS.users.root);
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

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <FormHeader
        heading={'Change User Password'}
        breadcrumbs={
          <Breadcrumbs
            links={[
              { name: 'Home', href: '/' },
              {
                name: 'Users',
                href: PATH_SETTINGS.users.root,
              },
              { name: 'Change User Password' },
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
            Change Password
          </LoadingButton>
        }
        cancel={
          <Button variant="contained" component={RouterLink} to={PATH_SETTINGS.users.root}>
            Cancel
          </Button>
        }
      />

      <Grid container spacing={3}>
        <Grid item xs={12} sm={12}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField type="password" name="password" label="Password" />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <RHFTextField type="password" name="confirmPassword" label="Confirm Password" />
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
