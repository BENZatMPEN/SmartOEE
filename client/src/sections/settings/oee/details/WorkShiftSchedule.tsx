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
  workShift: DayData[];
  onToggleDay: (index: number) => void;
  onEditWorkShiftName: () => void;
  onToggleWorkShift: (index: number, shift: ShiftKey) => void;
  title: string;
  open: boolean;
  onClose: VoidFunction;
};

const WorkShiftSchedule = ({ workShift, onToggleDay, onEditWorkShiftName, onToggleWorkShift, title, open, onClose }: Props) => {
  const [ shiftName, setShiftName ] = useState<Shift | null>(null)
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
        <Accordion key={row.day}>
          <AccordionSummary expandIcon={<ExpandLess />}>
            <Typography variant="h6">{row.day}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} key={index + 1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <FormControlLabel
                    sx={{ margin: 0 }}
                    labelPlacement="start"
                    label={<Typography>{row.day}</Typography>}
                    control={<Switch checked={row.active} onClick={() => onToggleDay(index)} />}
                  />
                </Box>
              </Grid>
              {shiftKeys.map((shift) => (
                <Grid key={shift} item xs={12} md={4} sx={{ display: 'grid', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" >
                      {row.shifts[shift].name}
                    </Typography>
                    <Button size="small" variant="text" onClick={() => {onEditWorkShiftName(); setShiftName(row.shifts[shift])}}>
                      <Iconify icon="eva:edit-2-outline" fontSize={20} />
                    </Button>
                  </Box>
                  <FormControlLabel
                    name={`workShifts[${index}].shifts.${shift}.active`}
                    control={
                      <Checkbox checked={row.shifts[shift].active} onChange={() => onToggleWorkShift(index, shift)} />
                    }
                    label="Activate"
                  />
                  
                  <RHFTimePickerCustom
                    label="Start Time"
                    name={`workShifts[${index}].shifts.${shift}.start`}
                    key={`start-${row.day}-${shift}-${row.shifts[shift].name}`}
                    size="small"
                    value={row.shifts[shift].start}
                  />
                  <RHFTimePickerCustom
                    label="End Time"
                    name={`workShifts[${index}].shifts.${shift}.end`}
                    key={`end-${row.day}-${shift}-${row.shifts[shift].name}`}
                    size="small"
                    value={row.shifts[shift].end}
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
