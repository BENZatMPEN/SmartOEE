import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Button, Card, Grid, MenuItem } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { EditPlannedDowntime } from '../../../../@types/plannedDowntime';
import FormHeader from '../../../../components/FormHeader';
import { FormProvider, RHFSelect, RHFTextField } from '../../../../components/hook-form';
import Iconify from '../../../../components/Iconify';
import { DOWNTIME_TIMINGS, DOWNTIME_TYPES } from '../../../../constants';
import { createPlannedDowntime, updatePlannedDowntime } from '../../../../redux/actions/plannedDowntimeAction';
import { RootState, useDispatch, useSelector } from '../../../../redux/store';
import { PATH_SETTINGS } from '../../../../routes/paths';

interface FormValuesProps extends EditPlannedDowntime {
  minutes: number;
}

interface Props {
  isEdit: boolean;
}

export default function PlannedDowntimeForm({ isEdit }: Props) {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { currentPlannedDowntime, saveError } = useSelector((state: RootState) => state.plannedDowntime);

  const { enqueueSnackbar } = useSnackbar();

  const NewPlannedDowntimeSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
  });

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewPlannedDowntimeSchema),
    defaultValues: {
      name: '',
      type: DOWNTIME_TYPES[0],
      timing: DOWNTIME_TIMINGS[0],
      seconds: 0,
      minutes: 0,
    },
    values: {
      name: currentPlannedDowntime?.name || '',
      type: currentPlannedDowntime?.type || DOWNTIME_TYPES[0],
      timing: currentPlannedDowntime?.timing || DOWNTIME_TIMINGS[0],
      seconds: currentPlannedDowntime?.seconds || 0,
      minutes: currentPlannedDowntime ? (currentPlannedDowntime?.seconds || 0) / 60 : 0,
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    try {
      const { minutes, ...dto } = data;
      dto.seconds = minutes * 60;

      const plannedDowntime =
        isEdit && currentPlannedDowntime
          ? await dispatch(updatePlannedDowntime(currentPlannedDowntime.id, dto))
          : await dispatch(createPlannedDowntime(dto));

      if (plannedDowntime) {
        enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
        navigate(PATH_SETTINGS.plannedDowntimes.root);
      }
    } catch (error) {
      console.error(error);
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

      <Card sx={{ px: 2, py: 3, mb: 3 }}>
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
