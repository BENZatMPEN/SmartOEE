import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Button, Card, CardContent, Grid, MenuItem, Stack } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { EditDeviceModel } from '../../../../@types/deviceModel';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import FormHeader from '../../../../components/FormHeader';
import { FormProvider, RHFSelect, RHFTextField } from '../../../../components/hook-form';
import Iconify from '../../../../components/Iconify';
import {
  DEVICE_MODEL_CONNECTION_TYPE_TCP,
  DEVICE_MODEL_CONNECTION_TYPES,
  DEVICE_MODEL_TYPE_MODBUS,
  DEVICE_MODEL_TYPES,
} from '../../../../constants';
import { createDeviceModel, updateDeviceModel } from '../../../../redux/actions/deviceModelAction';
import { RootState, useDispatch, useSelector } from '../../../../redux/store';
import { PATH_SETTINGS } from '../../../../routes/paths';
import { getDeviceModelConnectionTypeText, getDeviceModelTypeText } from '../../../../utils/formatText';
import DeviceModelTagList from './DeviceModelTagList';

type Props = {
  isEdit: boolean;
};

export default function DeviceModelForm({ isEdit }: Props) {
  const dispatch = useDispatch();

  const { currentDeviceModel } = useSelector((state: RootState) => state.deviceModel);

  const { selectedSite } = useSelector((state: RootState) => state.userSite);

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const NewDeviceModelSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    connectionType: Yup.string().required('Connection Type is required'),
    modelType: Yup.string().required('Model Type is required'),
    tags: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().required('Name is required'),
        factor: Yup.number().min(1, 'Factor min 1'),
      }),
    ),
  });

  const methods = useForm<EditDeviceModel>({
    resolver: yupResolver(NewDeviceModelSchema),
    defaultValues: {
      name: '',
      remark: '',
      connectionType: DEVICE_MODEL_CONNECTION_TYPE_TCP,
      modelType: DEVICE_MODEL_TYPE_MODBUS,
      tags: [],
    },
    values: {
      name: currentDeviceModel?.name || '',
      remark: currentDeviceModel?.remark || '',
      connectionType: currentDeviceModel?.connectionType || DEVICE_MODEL_CONNECTION_TYPE_TCP,
      modelType: currentDeviceModel?.modelType || DEVICE_MODEL_TYPE_MODBUS,
      tags: currentDeviceModel?.tags || [],
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: EditDeviceModel) => {
    try {
      if (isEdit && currentDeviceModel) {
        await dispatch(updateDeviceModel(currentDeviceModel.id, data));
      } else {
        await dispatch(createDeviceModel({ ...data, siteId: selectedSite?.id }));
      }

      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
      navigate(PATH_SETTINGS.deviceModels.root);
    } catch (error) {
      if (error instanceof AxiosError) {
        if ('message' in error.response?.data) {
          if (Array.isArray(error.response?.data.message)) {
            for (const item of error.response?.data.message) {
              enqueueSnackbar(item, { variant: 'error' });
            }
          } else {
            enqueueSnackbar(error.response?.data.message, { variant: 'error' });
          }
          return;
        }
        enqueueSnackbar(error.response?.data.error, { variant: 'error' });
      }
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <FormHeader
        heading={!isEdit ? 'Create Model' : 'Edit Model'}
        breadcrumbs={
          <Breadcrumbs
            links={[
              { name: 'Home', href: '/' },
              {
                name: 'Models',
                href: PATH_SETTINGS.deviceModels.root,
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
          <Button variant="contained" component={RouterLink} to={PATH_SETTINGS.deviceModels.root}>
            Cancel
          </Button>
        }
      />

      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Grid container spacing={3}>
                  <Grid item xs={4}>
                    <RHFTextField name="name" label="Name" />
                  </Grid>

                  <Grid item xs={4}>
                    <RHFTextField name="remark" label="Remark" />
                  </Grid>

                  <Grid item xs={4}>
                    <RHFSelect
                      name="modelType"
                      label="Model Type"
                      InputLabelProps={{ shrink: true }}
                      SelectProps={{ native: false }}
                    >
                      {DEVICE_MODEL_TYPES.map((option) => (
                        <MenuItem
                          key={option}
                          value={option}
                          sx={{
                            mx: 1,
                            my: 0.5,
                            borderRadius: 0.75,
                            typography: 'body1',
                          }}
                        >
                          {getDeviceModelTypeText(option)}
                        </MenuItem>
                      ))}
                    </RHFSelect>
                  </Grid>

                  <Grid item xs={4}>
                    <RHFSelect
                      name="connectionType"
                      label="Connection Type"
                      InputLabelProps={{ shrink: true }}
                      SelectProps={{ native: false }}
                    >
                      {DEVICE_MODEL_CONNECTION_TYPES.map((option) => (
                        <MenuItem
                          key={option}
                          value={option}
                          sx={{
                            mx: 1,
                            my: 0.5,
                            borderRadius: 0.75,
                            typography: 'body1',
                          }}
                        >
                          {getDeviceModelConnectionTypeText(option)}
                        </MenuItem>
                      ))}
                    </RHFSelect>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <DeviceModelTagList />
          </CardContent>
        </Card>
      </Stack>
    </FormProvider>
  );
}
