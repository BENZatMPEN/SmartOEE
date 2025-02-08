import { ExpandLess } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { RHFTimePickerCustom } from 'src/components/hook-form/RHFDateTimePicker';
import Iconify from 'src/components/Iconify';
import OeeWorkScheduleDialog from './OeeWorkScheduleDialog';
import useToggle from 'src/hooks/useToggle';
import OeeWorkScheduleExportDialog from './OeeWorkScheduleExportDialog';
import { ShiftWork, WorkShiftsDetail } from 'src/@types/oee';


type ShiftKey = 'day' | 'ot' | 'night';
const shiftKeys: ShiftKey[] = ['day', 'ot', 'night'];
type Shift = {
  name : string;
  active: boolean;
  start: Date; // e.g., "08:00"
  end: Date; // e.g., "17:00"
};
// day : Record<string, Shift>
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
  workShift: WorkShiftsDetail[];
  onToggleDay: (index: number) => void;
  onEditWorkShiftName: () => void;
  onToggleWorkShift: (index: number, shift: number) => void;
  title: string;
  open: boolean;
  onClose: VoidFunction;
};

const WorkShiftSchedule = ({ workShift, onToggleDay, onEditWorkShiftName, onToggleWorkShift, title, open, onClose }: Props) => {
  const [ shiftName, setShiftName ] = useState<ShiftWork | null>(null)
  const { toggle: openWorkScheduleExport, onOpen: onOpenWorkScheduleExport, onClose: onCloseWorkScheduleExport } = useToggle();

  return (
    <>
      <Box sx={{display:'flex', justifyContent : 'space-between', mb:2}}>
        <Typography variant="h6" sx={{ color: 'text.disabled' }} gutterBottom>
          Work Schedule
        </Typography>
        <Button startIcon={<Iconify icon="eva:cloud-upload-outline" fontSize={20} />} onClick={() => {onOpenWorkScheduleExport()}}  > Export </Button>
      </Box>
      {workShift.map((row, index) => (
        <Accordion key={row?.dayOfWeek || index}>
          <AccordionSummary expandIcon={<ExpandLess />}>
            <Typography variant="h6">{row?.dayOfWeek}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} key={index}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <FormControlLabel
                    sx={{ margin: 0 }}
                    labelPlacement="start"
                    label={<Typography>{row?.dayOfWeek}</Typography>}
                    control={<Switch checked={row?.isDayActive} onClick={() => onToggleDay(index)} />}
                  />
                </Box>
              </Grid>
              
              {row?.shifts.map((item,shiftIndex) => (
                <Grid key={item.shiftName} item xs={12} md={4} sx={{ display: 'grid', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" >
                      {row.shifts[shiftIndex].shiftName}
                    </Typography>
                    <Button size="small" variant="text" onClick={() => {onEditWorkShiftName(); setShiftName(row.shifts[shiftIndex])}}>
                      <Iconify icon="eva:edit-2-outline" fontSize={20} />
                    </Button>
                  </Box>
                  <FormControlLabel
                    name={`workShifts[${index}].shifts.${shiftIndex}.active`}
                    control={
                      <Checkbox checked={row.shifts[shiftIndex].isShiftActive} onChange={() => onToggleWorkShift(index, shiftIndex)} />
                    }
                    label="Activate"
                  />
                 
                  <RHFTimePickerCustom
                    label="Start Time"
                    name={`workShifts[${index}].shifts.${shiftIndex}.startTime`}
                    key={`start-${row.dayOfWeek}-${shiftIndex}-${row.shifts[shiftIndex].shiftName}`}
                    size="small"
                    value={row.shifts[shiftIndex].startTime as Date}
                  />
                  <RHFTimePickerCustom
                    label="End Time"
                    name={`workShifts[${index}].shifts.${shiftIndex}.endTime`}
                    key={`end-${row.dayOfWeek}-${shiftIndex}-${row.shifts[shiftIndex].shiftName}`}
                    size="small"
                    value={row.shifts[shiftIndex].endTime as Date}
                  />
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      <OeeWorkScheduleDialog
        title={title}
        open={open}
        onClose={onClose}
        shiftName={shiftName && shiftName}
      />
      <OeeWorkScheduleExportDialog
        title={'Export to Another OEE'}
        open={openWorkScheduleExport}
        onClose={onCloseWorkScheduleExport}
        workShift={workShift}
      />
    </>
  );
};

export default WorkShiftSchedule;
