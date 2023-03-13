import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { LoadingButton } from '@mui/lab';
import { Dialog, Divider, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { OeeBatch } from '../../../@types/oeeBatch';
import { OeeBatchPlannedDowntime } from '../../../@types/oeeBatchPlannedDowntime';
import { PlannedDowntime } from '../../../@types/plannedDowntime';
import { FormProvider, RHFSelect, RHFTextField } from '../../../components/hook-form';
import Iconify from '../../../components/Iconify';
import { DOWNTIME_TIMING_TIMER, DOWNTIME_TIMINGS, DOWNTIME_TYPES } from '../../../constants';
import axios from '../../../utils/axios';
import { fDowntimeTimingText, fDowntimeTypeText } from '../../../utils/textHelper';

type FormValuesProps = {
  name: string;
  type: string;
  timing: string;
  minutes: number;
  oeeBatchId: number;
};

type Props = {
  open: boolean;
  onClose: VoidFunction;
  oeeBatch: OeeBatch;
};

export default function DashboardDetailsPlannedDowntimeDialog({ oeeBatch, open, onClose }: Props) {
  const theme = useTheme();

  const { enqueueSnackbar } = useSnackbar();

  const [selectedPlannedDowntime, setSelectedPlannedDowntime] = useState<PlannedDowntime | null>(null);

  const NewPlannedDowntimeSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    minutes: Yup.number().when('timing', { is: 'timer', then: Yup.number().min(1) }),
  });

  const defaultValues = useMemo(
    () => ({
      name: selectedPlannedDowntime?.name || '',
      type: selectedPlannedDowntime?.type || DOWNTIME_TYPES[0],
      timing: selectedPlannedDowntime?.timing || DOWNTIME_TIMINGS[0],
      minutes: selectedPlannedDowntime ? selectedPlannedDowntime.seconds / 60 : 0,
      oeeBatchId: oeeBatch.id,
    }),
    [selectedPlannedDowntime],
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewPlannedDowntimeSchema),
    defaultValues,
  });

  const {
    watch,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = async (data: FormValuesProps) => {
    try {
      const { minutes, ...formData } = data;
      const seconds = minutes * 60;
      await axios.put<OeeBatchPlannedDowntime>(`/oee-batches/${oeeBatch.id}/set-planned-downtime`, {
        ...formData,
        seconds,
      });
      enqueueSnackbar('Planned Downtime has been set!');
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlannedDowntime]);

  const [plannedDowntimes, setPlannedDowntimes] = useState<PlannedDowntime[]>([]);

  const getDowntimes = async () => {
    try {
      const response = await axios.get<PlannedDowntime[]>('/planned-downtimes/all');
      const items = response.data;
      if (items.length === 0) {
        return;
      }

      setPlannedDowntimes(items);
      setSelectedPlannedDowntime(items[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    (async () => {
      await getDowntimes();
    })();

    return () => {
      setPlannedDowntimes([]);
      // setSelectItems([]);
      setSelectedPlannedDowntime(null);
    };
  }, [open]);

  const handleSelectPlannedDowntime = (id: number) => {
    const filtered = plannedDowntimes.filter((item) => item.id === id);
    setSelectedPlannedDowntime(filtered[0]);
  };

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack sx={{ p: theme.spacing(3) }} spacing={theme.spacing(3)}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Select Planned Downtime</Typography>

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

          {plannedDowntimes.length > 0 && (
            <TextField
              size="small"
              label="Type"
              select
              defaultValue={plannedDowntimes[0].id}
              InputLabelProps={{ shrink: true }}
              SelectProps={{ native: false }}
              onChange={(event) => {
                handleSelectPlannedDowntime(Number(event.target.value));
              }}
            >
              {plannedDowntimes.map((downtime) => (
                <MenuItem
                  key={downtime.id}
                  value={downtime.id}
                  sx={{
                    mx: 1,
                    my: 0.5,
                    borderRadius: 0.75,
                    typography: 'body2',
                  }}
                >
                  {downtime.name}
                </MenuItem>
              ))}
            </TextField>
          )}

          <Divider />

          <Stack spacing={theme.spacing(3)}>
            <RHFTextField
              name="name"
              size="small"
              InputProps={{ readOnly: true }}
              InputLabelProps={{ shrink: true }}
              label="Name"
            />

            <RHFSelect
              name="type"
              size="small"
              label="Type"
              InputLabelProps={{ shrink: true }}
              SelectProps={{ native: false }}
            >
              {DOWNTIME_TYPES.map((option) => (
                <MenuItem
                  key={option}
                  value={option}
                  sx={{
                    mx: 1,
                    my: 0.5,
                    borderRadius: 0.75,
                    typography: 'body2',
                  }}
                >
                  {fDowntimeTypeText(option)}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFSelect
              name="timing"
              size="small"
              label="Timing"
              InputLabelProps={{ shrink: true }}
              SelectProps={{ native: false }}
            >
              {DOWNTIME_TIMINGS.map((option) => (
                <MenuItem
                  key={option}
                  value={option}
                  sx={{
                    mx: 1,
                    my: 0.5,
                    borderRadius: 0.75,
                    typography: 'body2',
                  }}
                >
                  {fDowntimeTimingText(option)}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFTextField
              name="minutes"
              type="number"
              size="small"
              disabled={values.timing !== DOWNTIME_TIMING_TIMER}
              InputLabelProps={{ shrink: true }}
              label="Minutes"
            />
          </Stack>
        </Stack>
      </FormProvider>
    </Dialog>
  );
}
