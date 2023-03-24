import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Button, Card, CardContent, Grid, MenuItem, Stack } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
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
  DEVICE_MODEL_TYPE_OPCUA,
  DEVICE_MODEL_TYPES,
} from '../../../../constants';
import { createDeviceModel, updateDeviceModel } from '../../../../redux/actions/deviceModelAction';
import { RootState, useDispatch, useSelector } from '../../../../redux/store';
import { PATH_SETTINGS } from '../../../../routes/paths';
import { fDeviceModelConnectionTypeText, fDeviceModelTypeText } from '../../../../utils/textHelper';
import DeviceModelTagList from './DeviceModelTagList';

interface Props {
  isEdit: boolean;
}

export default function DeviceModelForm({ isEdit }: Props) {
  const dispatch = useDispatch();

  const { currentDeviceModel, saveError } = useSelector((state: RootState) => state.deviceModel);

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
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = async (data: EditDeviceModel) => {
    const deviceModel =
      isEdit && currentDeviceModel
        ? await dispatch(updateDeviceModel(currentDeviceModel.id, data))
        : await dispatch(createDeviceModel(data));

    if (deviceModel) {
      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
      navigate(PATH_SETTINGS.deviceModels.root);
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
                          {fDeviceModelTypeText(option)}
                        </MenuItem>
                      ))}
                    </RHFSelect>
                  </Grid>

                  <Grid item xs={4}>
                    <RHFSelect
                      name="connectionType"
                      label="Connection Type"
                      disabled={values.modelType === DEVICE_MODEL_TYPE_OPCUA}
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
                          {fDeviceModelConnectionTypeText(option)}
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
