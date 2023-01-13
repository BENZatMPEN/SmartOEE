import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Button, Card, CardContent, Grid, Stack } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { EditDashboard } from '../../../../@types/dashboard';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import FormHeader from '../../../../components/FormHeader';
import { FormProvider, RHFTextField } from '../../../../components/hook-form';
import Iconify from '../../../../components/Iconify';
import { createDashboard, updateDashboard } from '../../../../redux/actions/dashboardAction';
import { getAllDashboard } from '../../../../redux/actions/userSiteAction';
import { RootState, useDispatch, useSelector } from '../../../../redux/store';
import { PATH_SETTINGS } from '../../../../routes/paths';

type Props = {
  isEdit: boolean;
};

export default function DashboardForm({ isEdit }: Props) {
  const dispatch = useDispatch();

  const { currentDashboard, saveError } = useSelector((state: RootState) => state.dashboard);

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const NewDashboardSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    link: Yup.string().required('Link is required'),
  });

  const methods = useForm<EditDashboard>({
    resolver: yupResolver(NewDashboardSchema),
    defaultValues: {
      title: '',
      link: '',
    },
    values: {
      title: currentDashboard?.title || '',
      link: currentDashboard?.link || '',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: EditDashboard) => {
    const dashboard =
      isEdit && currentDashboard
        ? await dispatch(updateDashboard(currentDashboard.id, data))
        : await dispatch(createDashboard(data));

    if (dashboard) {
      await dispatch(getAllDashboard());

      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
      navigate(PATH_SETTINGS.dashboard.root);
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

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <FormHeader
        heading={!isEdit ? 'Create Dashboard' : 'Edit Dashboard'}
        breadcrumbs={
          <Breadcrumbs
            links={[
              { name: 'Home', href: '/' },
              {
                name: 'Dashboards',
                href: PATH_SETTINGS.dashboard.root,
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
          <Button variant="contained" component={RouterLink} to={PATH_SETTINGS.dashboard.root}>
            Cancel
          </Button>
        }
      />

      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={4}>
                <RHFTextField name="title" label="Title" />
              </Grid>

              <Grid item xs={8}>
                <RHFTextField name="link" label="Link" />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Stack>
    </FormProvider>
  );
}
