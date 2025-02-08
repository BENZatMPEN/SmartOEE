import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import {
  Autocomplete,
  Box,
  Dialog,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import * as Yup from 'yup';
import { ExportToAnotherOee, FilterOee, OeeTag, WorkShiftsDetail } from '../../../../@types/oee';
import Iconify from '../../../../components/Iconify';
import { OptionItem } from '../../../../@types/option';
import { RootState, useDispatch, useSelector } from '../../../../redux/store';
import { exportWorkShiftToAnotherOee, getOeePagedList, getOeePagedList2 } from 'src/redux/actions/oeeAction';
import { fCode } from 'src/utils/formatNumber';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';

interface FormValuesProps {
  oeeId: number[];
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
    day : Shift
    ot :  Shift
    night :  Shift
  };
};
type Props = {
  title: string;
  open: boolean;
  onClose: VoidFunction;
  workShift: WorkShiftsDetail[];
};

export default function OeeWorkScheduleExportDialog({ title, open, onClose, workShift }: Props) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { pagedList, isLoading } = useSelector((state: RootState) => state.oee);
  const tagSchema = Yup.object({
    oeeId: Yup.array(Yup.string().required('Oee must be selected')).min(1, 'Oee must be selected'),
    // deviceId: Yup.number().min(1, 'Device must be selected'),
    // tagId: Yup.number().min(1, 'Tag must be selected'),
  });

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(tagSchema),
    defaultValues: {
      oeeId: [],
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

  const onSubmit = async () => {
    const getValue = getValues('oeeId');
  
    
    const mapSchedule = workShift.map((work) => {
      return {
        dayOfWeek : work.dayOfWeek,
        isDayActive : work.isDayActive,
        shifts : work.shifts.map((shift) => {
          return {
            shiftNumber : shift.shiftNumber,
            shiftName: shift.shiftName,
            startTime: dayjs(shift.startTime).format('HH:mm') as string,
            endTime: dayjs(shift.endTime).format('HH:mm') as string,
            isShiftActive: shift.isShiftActive
          }
        })
      }
    }) || []

    // const transformed = workShift.flatMap(({ day, active, shifts }) =>
    //   shiftMapping.map(({ key, shiftNumber, shiftName, startTime, endTime }) => ({
    //     dayOfWeek: day,
    //     shiftNumber,
    //     shiftName: shifts[key]?.name,
    //     startTime: dayjs(shifts[key]?.start).format('HH:mm'),
    //     endTime: dayjs(shifts[key]?.end).format('HH:mm'),
    //     isDayActive: active,
    //     isShiftActive: shifts[key]?.active ?? false,
    //   })),
    // );
      const params:ExportToAnotherOee = {
        workShifts : mapSchedule,
        oeeIds : getValue
      }

      
      const callExport = await dispatch(exportWorkShiftToAnotherOee(params))
      console.log(callExport);
      if (callExport) {
        enqueueSnackbar('Export to Another OEE success!');
        onClose();
      }
     
      reset();
    
  
  };

  const refreshData = async () => {
    const filter: FilterOee = {
      search: '',
      order: 'asc',
      orderBy: 'oeeCode',
      page: 0,
      rowsPerPage: 1000,
    };
    await dispatch(getOeePagedList2(filter));
  };
  const oeeOptions = useMemo(() => {
    const result = pagedList.list.map((item) => {
      return {
        id: item.id,
        name: item.oeeCode,
      };
    });
    return result;
  }, [pagedList]);
  useEffect(() => {
    refreshData();
  }, []);

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
                  name="oeeId"
                  render={({ field: { onChange, value, name } }) => {
                    return (
                      <Autocomplete
                        key={`oeeOpts_multi_${1}`}
                        multiple
                        limitTags={3}
                        options={oeeOptions}
                        // value={value}
                        // value={(values.oees || []).reduce((arr: OptionItem[], id: number) => {
                        //   const filtered = (oeeOpts || []).filter((item) => item.id === id);
                        //   if (filtered.length > 0) {
                        //     arr.push(filtered[0]);
                        //   }
                        //   return arr;
                        // }, [])}
                        getOptionLabel={(option) => `${option.name} (${fCode(option.id, '#')})`}
                        renderInput={(params) => <TextField {...params} label="Oee" />}
                        onChange={(ev, value) => {
                          onChange((value || []).map((item) => item.id));
                        }}
                        // onChange={(event, value) => {
                        // handleOEEsSelected((value || []).map((item) => item.id));
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
