import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Button, Card, CardContent, Divider, Grid, MenuItem, Stack } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { DeviceTag, EditDevice } from '../../../../@types/device';
import { DeviceModel } from '../../../../@types/deviceModel';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import FormHeader from '../../../../components/FormHeader';
import { FormProvider, RHFCheckbox, RHFSelect, RHFTextField } from '../../../../components/hook-form';
import Iconify from '../../../../components/Iconify';
import { createDevice, updateDevice } from '../../../../redux/actions/deviceAction';
import { RootState, useDispatch, useSelector } from '../../../../redux/store';
import { PATH_SETTINGS } from '../../../../routes/paths';
import axios from '../../../../utils/axios';
import DeviceTagList from './DeviceTagList';

interface Props {
  isEdit: boolean;
}

export default function DeviceForm({ isEdit }: Props) {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const { currentDevice, saveError } = useSelector((state: RootState) => state.device);

  const [deviceModels, setDeviceModels] = useState<DeviceModel[]>([]);

  const [formValues, setFormValues] = useState<EditDevice | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const response = await axios.get<DeviceModel[]>(`/device-models/all`);
      setDeviceModels(response.data);
      setFormValues({
        name: currentDevice?.name || '',
        remark: currentDevice?.remark || '',
        deviceId: currentDevice?.deviceId || 0,
        deviceModelId: currentDevice?.deviceModelId || -1,
        address: currentDevice?.address || '',
        port: currentDevice?.port || 0,
        stopped: currentDevice?.stopped || false,
        tags: currentDevice?.tags || [],
      });
    })();

    return () => {
      setDeviceModels([]);
    };
  }, [currentDevice]);

  const NewDeviceSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    deviceId: Yup.number().required('Device ID is required'),
    address: Yup.string().required('Address is required'),
    port: Yup.number().min(0),
    selectedDeviceModelId: Yup.number().min(1),
    tags: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().required('Name is required'),
      }),
    ),
  });

  const methods = useForm<EditDevice>({
    resolver: yupResolver(NewDeviceSchema),
    defaultValues: {
      name: '',
      remark: '',
      deviceId: 0,
      deviceModelId: -1,
      address: '',
      port: 0,
      stopped: false,
      tags: [],
    },
    values: formValues,
  });

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: EditDevice) => {
    data.deviceModelId = data.deviceModelId === -1 ? null : data.deviceModelId;
    const device =
      isEdit && currentDevice
        ? await dispatch(updateDevice(currentDevice.id, data))
        : await dispatch(createDevice(data));

    if (device) {
      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
      navigate(PATH_SETTINGS.devices.root);
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

  const onDeviceModelChanged = async (deviceModelId: number) => {
    setValue('deviceModelId', deviceModelId);
    setValue('tags', []);

    if (deviceModelId === -1) {
      return;
    }

    try {
      const response = await axios.get<DeviceModel>(`/device-models/${deviceModelId}`);
      const { data: deviceModel } = response;
      const tags: DeviceTag[] = [];
      deviceModel.tags.forEach((tag) => {
        tags.push({
          id: 0,
          name: tag.name,
          spLow: 0,
          spHigh: 0,
          updateInterval: '',
          record: false,
          deviceModelTagId: tag.id,
          deviceId: Number(currentDevice?.id),
        });
      });
      setValue('tags', tags);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <FormHeader
        heading={!isEdit ? 'Create Device' : 'Edit Device'}
        breadcrumbs={
          <Breadcrumbs
            links={[
              { name: 'Home', href: '/' },
              {
                name: 'Devices',
                href: PATH_SETTINGS.devices.root,
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
          <Button variant="contained" component={RouterLink} to={PATH_SETTINGS.devices.root}>
            Cancel
          </Button>
        }
      />

      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={4}>
                <RHFTextField name="name" label="Name" />
              </Grid>

              <Grid item xs={4}>
                <RHFTextField name="remark" label="Remark" />
              </Grid>

              <Grid item xs={4}>
                <RHFSelect
                  name="deviceModelId"
                  label="Model"
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{ native: false }}
                  onChange={(event) => onDeviceModelChanged(Number(event.target.value))}
                >
                  <MenuItem
                    value={-1}
                    sx={{
                      mx: 1,
                      borderRadius: 0.75,
                      typography: 'body1',
                      fontStyle: 'italic',
                      color: 'text.secondary',
                    }}
                  >
                    None
                  </MenuItem>

                  <Divider />

                  {deviceModels.map((item) => (
                    <MenuItem
                      key={item.id}
                      value={item.id}
                      sx={{
                        mx: 1,
                        my: 0.5,
                        borderRadius: 0.75,
                        typography: 'body1',
                      }}
                    >
                      {item.name}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              <Grid item xs={4}>
                <RHFTextField name="address" label="Address" />
              </Grid>

              <Grid item xs={2}>
                <RHFTextField name="port" label="Port" />
              </Grid>

              <Grid item xs={2}>
                <RHFTextField name="deviceId" label="Device ID" />
              </Grid>

              <Grid item xs={4}>
                <RHFCheckbox name="stopped" label="Stop" />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <DeviceTagList />
          </CardContent>
        </Card>
      </Stack>
    </FormProvider>
  );
}
