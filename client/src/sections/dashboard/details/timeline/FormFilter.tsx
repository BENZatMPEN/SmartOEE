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
}

const timelineScheme = Yup.object().shape({
  startDateTime: Yup.string().required('Start date time is required'),
  endDateTime: Yup.string().required('End date time is required'),
});
const initForm: StreamingForm = {
  startDateTime: new Date(),
  endDateTime: new Date(),
};



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
        <Grid item xs={12} sm={12} sx={{ display: 'flex', flexDirection: 'row', gap: '1.2em', alignItems: 'end'  }}>
          <RHFDateTimePicker key="fromDateStart" name="startDateTime" label="Start Date Time" size="small" />

          <RHFDateTimePicker key="fromDateEnd" name="endDateTime" label="End Date Time" size="small" />
        </Grid>
     
      </Grid>
    </FormProvider>
  );
};

export default FormFilter;
