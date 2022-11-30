import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Button, Card, CardContent, Grid, Stack } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Role, RoleAction, RoleSubject } from '../../../../@types/role';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import FormHeader from '../../../../components/FormHeader';
import { FormProvider, RHFTextField } from '../../../../components/hook-form';
import Iconify from '../../../../components/Iconify';
import { initialRoles } from '../../../../constants';
import { createRole, updateRole } from '../../../../redux/actions/roleAction';
import { RootState, useDispatch, useSelector } from '../../../../redux/store';
import { PATH_ADMINISTRATOR } from '../../../../routes/paths';
import { RolePermissionForm } from './RolePermissionForm';

interface FormValuesProps extends Partial<Role> {}

type Props = {
  isEdit: boolean;
};

export default function RoleForm({ isEdit }: Props) {
  const dispatch = useDispatch();

  const { currentRole } = useSelector((state: RootState) => state.role);

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const NewRoleSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentRole?.name || '',
      remark: currentRole?.remark || '',
      roles: currentRole?.roles ? currentRole.roles : initialRoles,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentRole],
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewRoleSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    getValues,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (isEdit && currentRole) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentRole]);

  const onSubmit = async (data: FormValuesProps) => {
    try {
      if (isEdit && currentRole) {
        await dispatch(
          updateRole(currentRole.id, {
            id: currentRole.id,
            name: data.name,
            remark: data.remark,
            roles: data.roles,
          }),
        );
      } else {
        await dispatch(
          createRole({
            name: data.name,
            remark: data.remark,
            roles: data.roles,
          }),
        );
      }

      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
      navigate(PATH_ADMINISTRATOR.roles.root);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRulesUpdated = (subject: RoleSubject, action: RoleAction, checked: boolean): void => {
    const roles = getValues('roles') || initialRoles;
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
                href: PATH_ADMINISTRATOR.roles.root,
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
          <Button variant="contained" component={RouterLink} to={PATH_ADMINISTRATOR.roles.root}>
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
            <RolePermissionForm roles={values.roles || initialRoles} onUpdated={handleRulesUpdated} />
          </CardContent>
        </Card>
      </Stack>
    </FormProvider>
  );
}
