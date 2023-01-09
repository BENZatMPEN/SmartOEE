import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Box, Button, Card, CardContent, Grid, Stack } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { OptionItem } from '../../../../@types/option';
import { EditUser, EditUserPassword } from '../../../../@types/user';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import FormHeader from '../../../../components/FormHeader';
import { FormProvider, RHFTextField, RHFUploadSingleFile } from '../../../../components/hook-form';
import Iconify from '../../../../components/Iconify';
import { PS_PROCESS_STATUS_ON_PROCESS } from '../../../../constants';
import { emptyRoleOptions } from '../../../../redux/actions/roleAction';
import { emptySiteOptions, getSiteOptions } from '../../../../redux/actions/siteAction';
import { createUser, updateUser } from '../../../../redux/actions/userAction';
import { RootState, useDispatch, useSelector } from '../../../../redux/store';
import { PATH_ADMINISTRATOR } from '../../../../routes/paths';
import { getFileUrl } from '../../../../utils/imageHelper';
import UserSiteRoleList from './UserSiteRoleList';

type UserProps = EditUser & EditUserPassword;

interface FormValuesProps extends UserProps {
  isNew: boolean; // use for validation
  siteRoles: { site: OptionItem; role: OptionItem }[];
}

type Props = {
  isEdit: boolean;
};

export default function UserForm({ isEdit }: Props) {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { currentUser } = useSelector((state: RootState) => state.user);

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
      roleId: -1,
      siteRoles: [],
    },
    values: {
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
      email: currentUser?.email || '',
      password: '',
      confirmPassword: '',
      isNew: !isEdit,
      image: null,
      roleId: currentUser?.roleId || -1,
      siteRoles: [],
    },
  });

  const {
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'siteRoles',
  });

  const onSubmit = async (data: FormValuesProps) => {
    try {
      if (isEdit && currentUser) {
        await dispatch(updateUser(currentUser.id, data));
      } else {
        await dispatch(createUser(data));
      }

      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
      navigate(PATH_ADMINISTRATOR.users.root);
    } catch (error) {
      if (error instanceof AxiosError) {
        if ('message' in error.response?.data) {
          for (const item of error.response?.data.message) {
            enqueueSnackbar(item, { variant: 'error' });
          }
          return;
        }
        enqueueSnackbar(error.response?.data.error, { variant: 'error' });
      }
    }
  };

  // const handleAdd = () => {
  //   append({
  //     // title: '',
  //     // assigneeUserId: -1,
  //     // startDate: new Date(),
  //     // endDate: new Date(),
  //     // status: PS_PROCESS_STATUS_ON_PROCESS,
  //     // comment: '',
  //     // attachments: [],
  //     // files: [],
  //     // addingFiles: [],
  //     // deletingFiles: [],
  //   });
  // };

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
        <Grid item xs={12} md={4}>
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

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <RHFTextField name="firstName" label="First Name" />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <RHFTextField name="lastName" label="Last Name" />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <RHFTextField name="email" label="Email" />
                    </Grid>

                    {/*<Grid item xs={12} md={6}>*/}
                    {/*  <RHFSelect*/}
                    {/*    name="roleId"*/}
                    {/*    label="Role"*/}
                    {/*    InputLabelProps={{ shrink: true }}*/}
                    {/*    SelectProps={{ native: false }}*/}
                    {/*    // onChange={(event) => onDeviceModelChanged(Number(event.target.value))}*/}
                    {/*  >*/}
                    {/*    <MenuItem*/}
                    {/*      value={-1}*/}
                    {/*      sx={{*/}
                    {/*        mx: 1,*/}
                    {/*        borderRadius: 0.75,*/}
                    {/*        typography: 'body1',*/}
                    {/*        fontStyle: 'italic',*/}
                    {/*        color: 'text.secondary',*/}
                    {/*      }}*/}
                    {/*    >*/}
                    {/*      None*/}
                    {/*    </MenuItem>*/}

                    {/*    <Divider />*/}

                    {/*    {(roleOptions || []).map((item) => (*/}
                    {/*      <MenuItem*/}
                    {/*        key={item.id}*/}
                    {/*        value={item.id}*/}
                    {/*        sx={{*/}
                    {/*          mx: 1,*/}
                    {/*          my: 0.5,*/}
                    {/*          borderRadius: 0.75,*/}
                    {/*          typography: 'body1',*/}
                    {/*        }}*/}
                    {/*      >*/}
                    {/*        {item.name}*/}
                    {/*      </MenuItem>*/}
                    {/*    ))}*/}
                    {/*  </RHFSelect>*/}
                    {/*</Grid>*/}
                  </Grid>
                </Box>

                {!isEdit && (
                  <Box>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <RHFTextField type="password" name="password" label="Password" />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <RHFTextField type="password" name="confirmPassword" label="Confirm Password" />
                      </Grid>
                    </Grid>
                  </Box>
                )}

                <Box>
                  <UserSiteRoleList />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
