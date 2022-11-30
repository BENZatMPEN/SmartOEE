import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Checkbox, Dialog, Divider, FormControlLabel, MenuItem, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Device } from 'src/@types/device';
import * as Yup from 'yup';
import { MachineParameter } from '../../../../@types/machine';
import { FormProvider, RHFSelect, RHFTextField } from '../../../../components/hook-form';
import Iconify from '../../../../components/Iconify';
import axios from '../../../../utils/axios';

type FormValuesProps = {
  name: string;
  oeeType: string;
  deviceId: number;
  tagId: number;
  manual: boolean;
};

type Props = {
  open: boolean;
  onClose: VoidFunction;
  onSelect: (selected: MachineParameter) => void;
  editingParam: { param: MachineParameter | null; type: string };
};

export default function MachineParameterDialog({ open, onClose, onSelect, editingParam }: Props) {
  const machineParamSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    deviceId: Yup.number().when('manual', { is: false, then: Yup.number().min(1, 'Device must be selected') }),
    tagId: Yup.number().when('manual', { is: false, then: Yup.number().min(1, 'Tag must be selected') }),
  });

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(machineParamSchema),
    defaultValues: {
      name: '',
      oeeType: editingParam.type,
      manual: true,
      deviceId: -1,
      tagId: -1,
    },
  });

  const { reset, watch, setValue, control, handleSubmit } = methods;

  const values = watch();

  const [devices, setDevices] = useState<Device[]>([]);

  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async (data: FormValuesProps) => {
    if (editingParam.param) {
      onSelect({
        ...editingParam.param,
        name: data.name,
        deviceId: data.manual ? null : data.deviceId,
        tagId: data.manual ? null : data.tagId,
      });
    } else {
      onSelect({
        id: 0,
        name: data.name,
        deviceId: data.manual ? null : data.deviceId,
        tagId: data.manual ? null : data.tagId,
        oeeType: editingParam.type,
      });
    }
    onClose();
  };

  const getDevices = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/devices/all');
      const devices = response.data as Device[];
      setDevices(devices);
      setIsLoading(false);
    } catch {
      setIsLoading(false);
    }
  };

  const getDevice = async (deviceId: number) => {
    setIsLoading(true);
    try {
      const response = await axios.get<Device>(`/devices/${deviceId}`);
      setSelectedDevice(response.data);
      setIsLoading(false);
    } catch {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      (async () => {
        reset();
        setDevices([]);
        setSelectedDevice(null);
        await getDevices();

        const { param } = editingParam;

        if (param) {
          setValue('name', param.name);
          setValue('manual', param.tagId === null);

          if (param.deviceId) {
            await getDevice(param.deviceId);
            setValue('deviceId', param.deviceId);
            setValue('tagId', param.tagId ? param.tagId : -1);
          }
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleDeviceChanged = async (deviceId: number) => {
    setValue('tagId', -1);
    await getDevice(deviceId);
  };

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 2.5, px: 3 }}>
          <Typography variant="h6"> Select tag </Typography>

          <Button
            type="submit"
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="eva:plus-fill" />}
            sx={{ alignSelf: 'flex-end' }}
          >
            Save
          </Button>
        </Stack>
        <Stack sx={{ p: 1.5, pt: 0, pb: 3 }} spacing={3}>
          <RHFTextField name="name" label="Name" size="small" InputLabelProps={{ shrink: true }} />

          <FormControlLabel
            label="Manual"
            control={
              <Controller
                name="manual"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    {...field}
                    checked={field.value}
                    onChange={(event) => {
                      setValue('manual', event.target.checked);
                    }}
                  />
                )}
              />
            }
          />

          <Stack sx={{ display: values.manual ? 'none' : 'block' }} spacing={3}>
            <RHFSelect
              name="deviceId"
              label="Device"
              size="small"
              InputLabelProps={{ shrink: true }}
              SelectProps={{ native: false }}
              onChange={async (event) => {
                const selectedId = Number(event.target.value);
                setValue('deviceId', selectedId);
                await handleDeviceChanged(selectedId);
              }}
            >
              <MenuItem
                value={-1}
                sx={{
                  mx: 1,
                  borderRadius: 0.75,
                  typography: 'body2',
                  fontStyle: 'italic',
                  color: 'text.secondary',
                }}
              >
                None
              </MenuItem>

              <Divider />

              {devices.map((device) => (
                <MenuItem
                  key={device.id}
                  value={device.id}
                  sx={{
                    mx: 1,
                    my: 0.5,
                    borderRadius: 0.75,
                    typography: 'body2',
                  }}
                >
                  {device.name}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFSelect
              name="tagId"
              label="Tag"
              size="small"
              InputLabelProps={{ shrink: true }}
              SelectProps={{ native: false }}
            >
              <MenuItem
                value={-1}
                sx={{
                  mx: 1,
                  borderRadius: 0.75,
                  typography: 'body2',
                  fontStyle: 'italic',
                  color: 'text.secondary',
                }}
              >
                None
              </MenuItem>

              <Divider />

              {(selectedDevice?.tags || []).map((tag) => (
                <MenuItem
                  key={tag.id}
                  value={tag.id}
                  sx={{
                    mx: 1,
                    my: 0.5,
                    borderRadius: 0.75,
                    typography: 'body2',
                  }}
                >
                  {tag.name}
                </MenuItem>
              ))}
            </RHFSelect>
          </Stack>
        </Stack>
      </FormProvider>
    </Dialog>
  );
}
