import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Button, Card, CardContent, Grid, Stack } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { EditRole, RoleAction, RoleSubject } from '../../../../@types/role';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import FormHeader from '../../../../components/FormHeader';
import { FormProvider, RHFTextField } from '../../../../components/hook-form';
import Iconify from '../../../../components/Iconify';
import { initialRoles } from '../../../../constants';
import { createRole, updateRole } from '../../../../redux/actions/roleAction';
import { RootState, useDispatch, useSelector } from '../../../../redux/store';
import { PATH_SETTINGS } from '../../../../routes/paths';
import { RolePermissionForm } from './RolePermissionForm';

type Props = {
  isEdit: boolean;
};

export default function RoleForm({ isEdit }: Props) {
  const dispatch = useDispatch();

  const { currentRole, saveError } = useSelector((state: RootState) => state.role);

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const NewRoleSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
  });

  const methods = useForm<EditRole>({
    resolver: yupResolver(NewRoleSchema),
    defaultValues: {
      name: '',
      remark: '',
      roles: initialRoles,
    },
    values: {
      name: currentRole?.name || '',
      remark: currentRole?.remark || '',
      roles: currentRole?.roles ? currentRole.roles : initialRoles,
    },
  });

  const {
    watch,
    getValues,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = async (data: EditRole) => {
    const role =
      isEdit && currentRole ? await dispatch(updateRole(currentRole.id, data)) : await dispatch(createRole(data));

    if (role) {
      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
      navigate(PATH_SETTINGS.roles.root);
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

  const handleRulesUpdated = (subject: RoleSubject, action: RoleAction, checked: boolean): void => {
    const roles = getValues('roles');
    const subjectIndex = roles.findIndex((role) => role.subject === subject);

    if (checked) {
      roles[subjectIndex].actions.push(action);
    } else {
      const actionIndex = roles[subjectIndex].actions.indexOf(action);
      roles[subjectIndex].actions.splice(actionIndex, 1);
    }

    setValue('roles', roles);
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <FormHeader
        heading={!isEdit ? 'Create Role' : 'Edit Role'}
        breadcrumbs={
          <Breadcrumbs
            links={[
              { name: 'Home', href: '/' },
              {
                name: 'Roles',
                href: PATH_SETTINGS.roles.root,
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
          <Button variant="contained" component={RouterLink} to={PATH_SETTINGS.roles.root}>
            Cancel
          </Button>
        }
      />

      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <RHFTextField name="name" label="Name" />
              </Grid>

              <Grid item xs={12} md={8}>
                <RHFTextField name="remark" label="Remark" />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <RolePermissionForm roles={values.roles} onUpdated={handleRulesUpdated} />
          </CardContent>
        </Card>
      </Stack>
    </FormProvider>
  );
}
