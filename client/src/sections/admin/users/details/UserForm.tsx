import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Box, Button, Card, CardContent, Checkbox, Grid, MenuItem, Stack } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { OptionItem } from '../../../../@types/option';
import { EditAdminUser, EditUserPassword } from '../../../../@types/user';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import FormHeader from '../../../../components/FormHeader';
import {
  FormProvider,
  RHFSelect,
  RHFSwitch,
  RHFTextField,
  RHFUploadSingleFile,
} from '../../../../components/hook-form';
import Iconify from '../../../../components/Iconify';
import { createUser, updateUser } from '../../../../redux/actions/adminUserAction';
import { RootState, useDispatch, useSelector } from '../../../../redux/store';
import { PATH_ADMINISTRATOR } from '../../../../routes/paths';
import axios from '../../../../utils/axios';
import { getFileUrl } from '../../../../utils/imageHelper';

type UserProps = EditAdminUser & EditUserPassword;

interface FormValuesProps extends UserProps {
  isNew: boolean; // use for validation
}

type Props = {
  isEdit: boolean;
};

export default function UserForm({ isEdit }: Props) {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { currentUser, saveError } = useSelector((state: RootState) => state.adminUser);

  const { enqueueSnackbar } = useSnackbar();

  const [siteOptions, setSiteOptions] = useState<OptionItem[]>([]);

  useEffect(() => {
    axios
      .get<OptionItem[]>(`/admin/sites/options`)
      .then((response) => {
        const { data } = response;
        setSiteOptions(data);
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      setSiteOptions([]);
    };
  }, []);

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
    roleId: Yup.number().min(1, 'Role must be selected'),
  });

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewUserSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      isNew: false,
      image: null,
      isAdmin: false,
      siteIds: [],
    },
    values: {
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
      email: currentUser?.email || '',
      password: '',
      confirmPassword: '',
      isNew: !isEdit,
      image: null,
      isAdmin: currentUser?.isAdmin || false,
      siteIds: (currentUser?.sites || []).map((site) => site.id),
    },
  });

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = async (data: FormValuesProps) => {
    const user =
      isEdit && currentUser ? await dispatch(updateUser(currentUser.id, data)) : await dispatch(createUser(data));

    if (user) {
      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
      navigate(PATH_ADMINISTRATOR.users.root);
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

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <RHFUploadSingleFile
                name="image"
                accept="image/*"
                maxSize={3145728}
                onDrop={handleDrop}
                currentFile={isEdit ? getFileUrl(currentUser?.imageName) : ''}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={8}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'end' }}>
                      <RHFSwitch name="isAdmin" label="Administrator" />
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="firstName" label="First Name" />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="lastName" label="Last Name" />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="email" label="Email" />
                  </Grid>

                  <Grid item xs={12}>
                    <RHFSelect
                      name="siteIds"
                      label="Sites"
                      fullWidth
                      SelectProps={{
                        native: false,
                        multiple: true,
                        value: values.siteIds,
                        renderValue: (selected: any) => (
                          <>
                            {siteOptions
                              .filter((item) => selected.indexOf(item.id) > -1)
                              .map((item) => item.name)
                              .join(', ')}
                          </>
                        ),
                      }}
                    >
                      {siteOptions.map((item) => (
                        <MenuItem
                          key={item.id}
                          value={item.id}
                          sx={{
                            mx: 1,
                            my: 0.5,
                            borderRadius: 0.75,
                            typography: 'body2',
                          }}
                        >
                          <Checkbox checked={values.siteIds.indexOf(item.id) > -1} />
                          {item.name}
                        </MenuItem>
                      ))}
                    </RHFSelect>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {!isEdit && (
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
            )}
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
