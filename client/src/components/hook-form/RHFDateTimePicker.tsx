import { TextField } from '@mui/material';
import { TextFieldPropsSizeOverrides } from '@mui/material/TextField/TextField';
import { OverridableStringUnion } from '@mui/types';
import { DatePicker, DateTimePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { CalendarOrClockPickerView, CalendarPickerView } from '@mui/x-date-pickers/internals/models';
import thLocale from 'dayjs/locale/th';
import { Controller, useFormContext } from 'react-hook-form';

interface DateTimePickerProps {
  name: string;
  label: string;
  size?: OverridableStringUnion<'small' | 'medium', TextFieldPropsSizeOverrides>;
  minDate?: Date;
  minTime?: Date;
}

interface RHFDateTimePickerProps extends DateTimePickerProps {
  views?: readonly CalendarOrClockPickerView[];
}

interface RHFDatePickerProps extends DateTimePickerProps {
  views?: readonly CalendarPickerView[];
}

export function RHFDateTimePicker({ name, label, size, ...others }: RHFDateTimePickerProps) {
  const { control } = useFormContext();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={thLocale}>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <DateTimePicker
            {...others}
            label={label}
            value={field.value}
            onChange={(newValue: any) => {
              if (newValue) {
                field.onChange(newValue.toDate());
              }
            }}
            renderInput={(params: any) => (
              <TextField {...params} size={size} fullWidth error={!!error} helperText={error?.message} />
            )}
          />
        )}
      />
    </LocalizationProvider>
  );
}

export function RHFDatePicker({ name, label, size, ...others }: RHFDatePickerProps) {
  const { control } = useFormContext();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={thLocale}>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <DatePicker
            {...others}
            label={label}
            value={field.value}
            onChange={(newValue: any) => {
              if (newValue) {
                field.onChange(newValue.toDate());
              }
            }}
            renderInput={(params: any) => (
              <TextField {...params} size={size} fullWidth error={!!error} helperText={error?.message} />
            )}
          />
        )}
      />
    </LocalizationProvider>
  );
}

export function RHFTimePicker({ name, label, size }: DateTimePickerProps) {
  const { control } = useFormContext();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={thLocale}>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <TimePicker
            label={label}
            value={field.value}
            onChange={(newValue: any) => {
              if (newValue) {
                field.onChange(newValue.year(2000).startOf('y').toDate());
              }
            }}
            renderInput={(params: any) => (
              <TextField {...params} size={size} fullWidth error={!!error} helperText={error?.message} />
            )}
          />
        )}
      />
    </LocalizationProvider>
  );
}
