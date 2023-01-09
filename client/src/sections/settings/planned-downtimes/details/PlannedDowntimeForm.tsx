import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Button, Card, Grid, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { PlannedDowntime } from '../../../../@types/plannedDowntime';
import FormHeader from '../../../../components/FormHeader';
import { FormProvider, RHFSelect, RHFTextField } from '../../../../components/hook-form';
import Iconify from '../../../../components/Iconify';
import { DOWNTIME_TIMINGS, DOWNTIME_TYPES } from '../../../../constants';
import { RootState, useSelector } from '../../../../redux/store';
import { PATH_SETTINGS } from '../../../../routes/paths';
import axios from '../../../../utils/axios';

interface FormValuesProps extends Partial<PlannedDowntime> {
  minutes: number;
}

type Props = {
  isEdit: boolean;
  currentPlannedDowntime: PlannedDowntime | null;
};

export default function PlannedDowntimeForm({ isEdit, currentPlannedDowntime }: Props) {
  const theme = useTheme();

  const navigate = useNavigate();

  const { selectedSite } = useSelector((state: RootState) => state.userSite);

  const { enqueueSnackbar } = useSnackbar();

  const NewPlannedDowntimeSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentPlannedDowntime?.name || '',
      type: currentPlannedDowntime?.type || DOWNTIME_TYPES[0],
      timing: currentPlannedDowntime?.timing || DOWNTIME_TIMINGS[0],
      seconds: currentPlannedDowntime?.seconds || 0,
      minutes: currentPlannedDowntime ? (currentPlannedDowntime?.seconds || 0) / 60 : 0,
      siteId: currentPlannedDowntime?.siteId || selectedSite?.id,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentPlannedDowntime],
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewPlannedDowntimeSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (isEdit && currentPlannedDowntime) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentPlannedDowntime]);

  const onSubmit = async (data: FormValuesProps) => {
    try {
      const { minutes, ...dto } = data;
      const seconds = minutes * 60;

      if (isEdit && currentPlannedDowntime) {
        await axios.put<PlannedDowntime>(`/planned-downtimes/${currentPlannedDowntime.id}`, {
          ...dto,
          seconds,
        });
      } else {
        await axios.post<PlannedDowntime>(`/planned-downtimes`, {
          ...dto,
          seconds,
        });
      }

      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
      navigate(PATH_SETTINGS.plannedDowntimes.root);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <FormHeader
        heading={!isEdit ? 'Create Downtime' : 'Edit Downtime'}
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
          <Button variant="contained" component={RouterLink} to={PATH_SETTINGS.plannedDowntimes.root}>
            Cancel
          </Button>
        }
      />

      <Card sx={{ px: theme.spacing(2), py: theme.spacing(3), mb: theme.spacing(3) }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={8}>
            <RHFTextField name="name" label="Name" />
          </Grid>

          <Grid item xs={12} sm={4}>
            <RHFSelect name="type" label="Type" InputLabelProps={{ shrink: true }} SelectProps={{ native: false }}>
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
                  {option}
                </MenuItem>
              ))}
            </RHFSelect>
          </Grid>

          <Grid item xs={12} sm={4}>
            <RHFSelect name="timing" label="Timing" InputLabelProps={{ shrink: true }} SelectProps={{ native: false }}>
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
                  {option}
                </MenuItem>
              ))}
            </RHFSelect>
          </Grid>

          <Grid item xs={12} sm={4}>
            <RHFTextField name="minutes" type="number" label="Minutes" />
          </Grid>
        </Grid>
      </Card>
    </FormProvider>
  );
}
