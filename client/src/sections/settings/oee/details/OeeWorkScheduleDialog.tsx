import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Box, Dialog, Divider, Grid, MenuItem, Stack, TextField, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import * as Yup from 'yup';
import { OeeTag } from '../../../../@types/oee';
import { FormProvider, RHFSelect, RHFTextField } from '../../../../components/hook-form';
import Iconify from '../../../../components/Iconify';

interface FormValuesProps {
  workName: string;
}
type Shift = {
  name: string;
  active: boolean;
  start: Date; // e.g., "08:00"
  end: Date; // e.g., "17:00"
};

// Type for a single day's data
type DayData = {
  day: string; // e.g., "Monday"
  active: boolean; // Whether the entire day is active
  shifts: {
    day: Shift; // Day shift
    ot: Shift; // OT shift
    night: Shift; // Night shift
  };
};
type Props = {
  title: string;
  open: boolean;
  onClose: VoidFunction;
  shiftName: Shift | null;
};

export default function OeeWorkScheduleDialog({ title, open, onClose, shiftName }: Props) {
  const theme = useTheme();

  const tagSchema = Yup.object({
    workName: Yup.string().optional(),
    // deviceId: Yup.number().min(1, 'Device must be selected'),
    // tagId: Yup.number().min(1, 'Tag must be selected'),
  });

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(tagSchema),
    defaultValues: {
      workName: '',
    },
  });

  const {
    reset,
    setValue,
    getValues,
    watch,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async () => {
    const getValue = getValues('workName')
  
    if (shiftName) {
      shiftName.name = getValue;
    }
    onClose();
  };

  useEffect(() => {
    setValue('workName', shiftName?.name || '');
  },[shiftName])

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <form>
        <Stack spacing={theme.spacing(3)} sx={{ m: theme.spacing(3) }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">{title}</Typography>

            <LoadingButton
             
              size="small"
              variant="outlined"
              loading={isSubmitting}
              startIcon={<Iconify icon="eva:save-fill" />}
              sx={{ alignSelf: 'flex-end' }}
              onClick={() => onSubmit?.()}
            >
              Save
            </LoadingButton>
          </Stack>
          <Stack spacing={theme.spacing(2)}>
            <Grid container spacing={theme.spacing(2)}>
              <Grid item xs={12}>
                <Controller
                  control={control}
                  name="workName"
                  render={({ field: { onChange, value, name } }) => {
                    return (
                      <TextField
                        type="text"
                        fullWidth
                        label="Work Name"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        value={value}
                        onChange={onChange}
                        // onChange={(event) => {
                      
                          // handleDataChange(event.target.value);
                        // }}
                      />
                    );
                  }}
                />
              </Grid>
            </Grid>
          </Stack>
        </Stack>
      </form>
    </Dialog>
  );
}
