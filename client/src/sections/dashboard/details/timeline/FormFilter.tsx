import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Divider, FormControlLabel, Grid, MenuItem, Switch } from '@mui/material';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { start } from 'nprogress';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormProvider, RHFSelect } from 'src/components/hook-form';
import { RHFDateTimePicker } from 'src/components/hook-form/RHFDateTimePicker';
import { setFormStreaming } from 'src/redux/actions/oeeAdvancedAction';
import { setFormTimeline } from 'src/redux/actions/oeeDashboardAction';
import { RootState, useDispatch, useSelector } from 'src/redux/store';
import * as Yup from 'yup';

type Props = {};
interface StreamingForm {
  startDateTime: Date;
  endDateTime: Date;
  periodTime: number;
}

const timelineScheme = Yup.object().shape({
  startDateTime: Yup.string().required('Start date time is required'),
  endDateTime: Yup.string().required('End date time is required'),
  periodTime: Yup.number().optional(),
});
const initForm: StreamingForm = {
  startDateTime: new Date(),
  endDateTime: new Date(),
  periodTime: 0,
};

const periodTime = [
  {
    name: '15 Sec',
    key: '1',
  },
  {
    name: '30 Sec',
    key: '2',
  },
  {
    name: '1 min',
    key: '3',
  },
];

const FormFilter = (props: Props) => {
  const { formTimeline } = useSelector((state: RootState) => state.oeeDashboard);
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const methods = useForm({
    resolver: yupResolver(timelineScheme),
    defaultValues: initForm,
  });
  const {
    watch,
    setValue,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = methods;
  const values = watch();
  const onSubmit = (values: StreamingForm) => {
    // let diffMinutes = dayjs(values.endDateTime).diff(values.startDateTime, 'minutes');
    // const formData = {
    //   startDateTime: values.startDateTime,
    //   endDateTime: values.endDateTime,
    //   isStreaming: streamingMode,
    // };
    // if (streamingMode) {
    //   formData.endDateTime = new Date();
    // }
    // let diffFormData = dayjs(formData.endDateTime).diff(formData.startDateTime, 'minutes');
    // if (Math.abs(diffFormData) > 48 * 60) {
    //   enqueueSnackbar("Can't select date more than 48 hours", {
    //     variant: 'error',
    //     anchorOrigin: { vertical: 'top', horizontal: 'center' },
    //   });
    //   return;
    // }
    // setCheckStreamingMode(formData.isStreaming);
    // dispatch(setFormStreaming(formData));
  };
  const onPeriodChange = (val: string) => {
    setValue('periodTime', Number(val));
    dispatch(setFormTimeline({ ...formTimeline, periodTime: val }));
  };
  useEffect(() => {
    if (values.startDateTime) {
      dispatch(setFormTimeline({ ...formTimeline, start: values.startDateTime }));
    }
    if (values.endDateTime) {
      dispatch(setFormTimeline({ ...formTimeline, start: values.endDateTime }));
    }
  }, [values.startDateTime, values.endDateTime]);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column', gap: '1.2em' }}>
          <RHFDateTimePicker key="fromDateStart" name="startDateTime" label="Start Date Time" size="small" />

          <RHFDateTimePicker key="fromDateEnd" name="endDateTime" label="End Date Time" size="small" />
        </Grid>
        <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column', gap: '1.5em', alignItems: 'start' }}>
          <RHFSelect
            name="periodTime"
            label="Period Time"
            InputLabelProps={{ shrink: true }}
            SelectProps={{ native: false }}
            size="small"
            onChange={(event) => onPeriodChange(event.target.value)}
          >
            <MenuItem
              value={0}
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
            {periodTime.map((item) => (
              <MenuItem
                key={item.key}
                value={item.key}
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
      </Grid>
    </FormProvider>
  );
};

export default FormFilter;
