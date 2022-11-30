import { Button, Dialog, Divider, MenuItem, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Device } from '../../@types/device';
import { ImageWidgetProps } from '../../@types/imageWidget';
import { Widget } from '../../@types/widget';
import axios from '../../utils/axios';
import { FormProvider, RHFSelect } from '../hook-form';
import Iconify from '../Iconify';
import ImageWidgetMappingList from './ImageWidgetMappingList';
import * as fs from 'fs';

type Props = {
  widgetProps: ImageWidgetProps;
  open: boolean;
  onClose: VoidFunction;
  onSave: (props: ImageWidgetProps) => void;
};

export default function ImageWidgetDialog({ widgetProps, open, onClose, onSave }: Props) {
  const theme = useTheme();

  const [devices, setDevices] = useState<Device[]>([]);

  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const methods = useForm<ImageWidgetProps>({
    defaultValues: {
      deviceId: -1,
      tagId: -1,
      imageValues: [],
    },
  });

  const {
    reset,
    setValue,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = async (data: ImageWidgetProps) => {
    onSave(data);
  };

  const getDevices = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<Device[]>('/devices/all');
      setDevices(response.data);
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

        const { deviceId, tagId, imageValues } = widgetProps;
        setValue('imageValues', imageValues);

        if (deviceId) {
          await getDevice(deviceId);
          setValue('deviceId', deviceId);
          setValue('tagId', tagId ? tagId : -1);
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
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={theme.spacing(3)} sx={{ m: theme.spacing(3) }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Set Image Widget</Typography>

            <Button
              type="submit"
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="eva:save-fill" />}
              sx={{ alignSelf: 'flex-end' }}
            >
              Save
            </Button>
          </Stack>
          <Stack spacing={theme.spacing(3)}>
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

            <ImageWidgetMappingList />
          </Stack>
        </Stack>
      </FormProvider>
    </Dialog>
  );
}
