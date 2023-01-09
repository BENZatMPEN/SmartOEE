import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Box, Dialog, Divider, Grid, MenuItem, Stack, TextField, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Device } from 'src/@types/device';
import * as Yup from 'yup';
import { OeeTag } from '../../../../@types/oee';
import { FormProvider, RHFSelect } from '../../../../components/hook-form';
import Iconify from '../../../../components/Iconify';
import { OEE_TAG_MC_STATE, OEE_TAG_OUT_BATCH_STATUS, OEE_TAG_OUT_RESET } from '../../../../constants';
import axios from '../../../../utils/axios';

type FormValuesProps = {
  deviceId: number;
  tagId: number;
  data: any;
};

type Props = {
  open: boolean;
  onClose: VoidFunction;
  onSave: (oeeTag: OeeTag) => void;
  editingTag: OeeTag | null;
};

export default function OeeTagDialog({ open, onClose, onSave, editingTag }: Props) {
  const theme = useTheme();

  const tagSchema = Yup.object().shape({
    deviceId: Yup.number().min(1, 'Device must be selected'),
    tagId: Yup.number().min(1, 'Tag must be selected'),
  });

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(tagSchema),
    defaultValues: {
      deviceId: -1,
      tagId: -1,
      data: null,
    },
  });

  const {
    reset,
    setValue,
    getValues,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const [devices, setDevices] = useState<Device[]>([]);

  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async (data: FormValuesProps) => {
    if (editingTag) {
      onSave({
        ...editingTag,
        ...data,
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
    if (!open) {
      return;
    }

    reset();
    setDevices([]);
    setSelectedDevice(null);

    (async () => {
      await getDevices();

      if (editingTag) {
        const { deviceId, tagId, data } = editingTag;
        setValue('data', data);

        if (deviceId > -1) {
          await getDevice(deviceId);
          setValue('deviceId', deviceId);
          setValue('tagId', tagId);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleDeviceChange = async (deviceId: number) => {
    setValue('tagId', -1);
    await getDevice(deviceId);
  };

  const handleDataChange = (dataVal: any) => {
    const data = getValues('data');
    setValue('data', {
      ...data,
      ...dataVal,
    });
  };

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={theme.spacing(3)} sx={{ m: theme.spacing(3) }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Set Image Widget</Typography>

            <LoadingButton
              type="submit"
              size="small"
              variant="outlined"
              loading={isSubmitting}
              startIcon={<Iconify icon="eva:save-fill" />}
              sx={{ alignSelf: 'flex-end' }}
            >
              Save
            </LoadingButton>
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
                await handleDeviceChange(selectedId);
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

            {editingTag && editingTag.key === OEE_TAG_MC_STATE && (
              <Box>
                <Grid container spacing={theme.spacing(3)}>
                  <Grid item xs={6} sm={4}>
                    <TextField
                      type="number"
                      fullWidth
                      label="Running"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      defaultValue={editingTag.data.running}
                      onChange={(event) => {
                        handleDataChange({ running: event.target.value });
                      }}
                    />
                  </Grid>

                  <Grid item xs={6} sm={4}>
                    <TextField
                      type="number"
                      fullWidth
                      label="Standby"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      defaultValue={editingTag.data.standby}
                      onChange={(event) => {
                        handleDataChange({ standby: event.target.value });
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {editingTag && editingTag.key === OEE_TAG_OUT_BATCH_STATUS && (
              <Box>
                <Grid container spacing={theme.spacing(3)}>
                  <Grid item xs={6} sm={4}>
                    <TextField
                      type="number"
                      fullWidth
                      label="Running"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      defaultValue={editingTag.data.running}
                      onChange={(event) => {
                        handleDataChange({ running: event.target.value });
                      }}
                    />
                  </Grid>

                  <Grid item xs={6} sm={4}>
                    <TextField
                      type="number"
                      fullWidth
                      label="Standby"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      defaultValue={editingTag.data.standby}
                      onChange={(event) => {
                        handleDataChange({ standby: event.target.value });
                      }}
                    />
                  </Grid>

                  <Grid item xs={6} sm={4}>
                    <TextField
                      type="number"
                      fullWidth
                      label="Breakdown"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      defaultValue={editingTag.data.breakdown}
                      onChange={(event) => {
                        handleDataChange({ breakdown: event.target.value });
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <TextField
                      type="number"
                      fullWidth
                      label="P/D"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      defaultValue={editingTag.data.plannedDowntime}
                      onChange={(event) => {
                        handleDataChange({ plannedDowntime: event.target.value });
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <TextField
                      type="number"
                      fullWidth
                      label="M/C Setup"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      defaultValue={editingTag.data.mcSetup}
                      onChange={(event) => {
                        handleDataChange({ mcSetup: event.target.value });
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {editingTag && editingTag.key === OEE_TAG_OUT_RESET && (
              <Box>
                <Grid container spacing={theme.spacing(3)}>
                  <Grid item xs={6} sm={4}>
                    <TextField
                      type="number"
                      fullWidth
                      label="Reset"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      defaultValue={editingTag.data.reset}
                      onChange={(event) => {
                        handleDataChange({ reset: event.target.value });
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </Stack>
        </Stack>
      </FormProvider>
    </Dialog>
  );
}
