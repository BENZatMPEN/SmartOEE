import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, AlertTitle, Button, FormControlLabel, Grid, Switch } from '@mui/material';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { SubmitHandler, useForm, UseFormReturn } from 'react-hook-form';
import { FormProvider } from 'src/components/hook-form';
import { RHFDateTimePicker } from 'src/components/hook-form/RHFDateTimePicker';
import { setFormStreaming } from 'src/redux/actions/oeeAdvancedAction';
import { useDispatch } from 'src/redux/store';
import * as Yup from 'yup'

type Props = {
  
};

interface StreamingForm {
  startDateTime : Date
  endDateTime : Date
  isStreaming : boolean
}

const streamingScheme = Yup.object().shape({
  startDateTime: Yup.string().required('Start date time is required'),
  endDateTime: Yup.string().required('End date time is required'),
  isStreaming : Yup.boolean().optional()
});
const initDateCriteria: StreamingForm = {
  startDateTime: new Date(),
  endDateTime: new Date(),
  isStreaming: false,
};
const StreamingForm = (props: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const methods = useForm({
    resolver: yupResolver(streamingScheme),
    defaultValues: initDateCriteria,
  });
  const {
    watch,
    setValue,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = methods;
  const [streamingMode ,setStreamingMode] = useState<boolean>(false)
  const [checkStreamingMode ,setCheckStreamingMode] = useState<boolean>(false)

  const onSubmit = (values:StreamingForm) => {
    let diffEnd = dayjs(values.endDateTime).diff(values.startDateTime, 'day')
    let diffStart = dayjs(values.startDateTime).diff(values.endDateTime, 'day')
    console.log('diffEnd',diffEnd);
    console.log('diffStart',diffStart);
    if (diffEnd > 2 || diffStart > 2) {
      enqueueSnackbar("Can't select date more than 2 day", { variant: 'error', anchorOrigin:{vertical:'top', horizontal:'center'} });
      return
    }
    const formData = {
      startDateTime : values.startDateTime,
      endDateTime : values.endDateTime,
      isStreaming : streamingMode
    }
    setCheckStreamingMode(formData.isStreaming)
    // console.log('values=>',formData);
    dispatch(setFormStreaming(formData))
  }

  return (
    <>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column', gap: '1.5em', alignItems:"start"}}>
            <FormControlLabel
              label={'Streaming'}
              labelPlacement="start"
              sx={{margin:0}}
              name='isStreaming'
              control={
                <Switch
                  color="info"
                  checked={watch('isStreaming')}
                  onChange={(event) => {
                    // handViewToggle();\
                    
                    setValue('isStreaming',event.target.checked)
                    setStreamingMode(!streamingMode);
                  }}
                />
              }
            />
            <Button variant='outlined' color='primary' fullWidth type='submit'>{ checkStreamingMode ? 'Stop' : 'Start'}</Button>
          </Grid>
          <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column', gap: '1.2em' }}>
            <RHFDateTimePicker key="fromDateStart" name="startDateTime" label="Start Date Time" size="small" />
                {/* <Alert severity="error">
                <AlertTitle>There are rows that cannot import:</AlertTitle>
               
              </Alert> */}
            <RHFDateTimePicker key="fromDateEnd" name="endDateTime" label="End Date Time" size="small" />
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
};

export default StreamingForm;
