import {
  Box,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  TableCell, TableRow, Typography, Stack,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { OEE_TYPE_A, OEE_TYPE_P, OEE_TYPE_Q } from '../../../../constants';
import { MachineParameter } from '../../../../@types/machine';
import { MachinePlanDownTime, OeeMachine } from '../../../../@types/oee';
import Iconify from '../../../../components/Iconify';
import { TableMoreMenu } from '../../../../components/table';
import { RHFTimePicker, RHFTimePickerCustom } from '../../../../components/hook-form/RHFDateTimePicker';
import { RHFSelect, RHFCheckbox, RHFCheckboxCustom } from '../../../../components/hook-form';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import axios from '../../../../utils/axios';
import { PlannedDowntime } from '../../../../@types/plannedDowntime';
import { OptionItem } from 'src/@types/option';

type Props = {
  row: OeeMachine;
  onEditRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onAddPlanDowntime: VoidFunction;
  onDeletePlanDowntime: (index: number, indexPlan: number) => void;
  onFixTimeChange: (indexPlan: number) => void;
};

export default function OeeMachineTableRow({ row, onEditRow, onDeleteRow, onAddPlanDowntime, onDeletePlanDowntime, onFixTimeChange }: Props) {
  const { machine, oeeMachinePlannedDowntime } = row;
  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  const [plannedDowntimes, setPlannedDowntimes] = useState<OptionItem[]>([]);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  const [open, setOpen] = useState(false);

  const toggleRow = () => {
    setOpen(!open);
  };

  const aParams = machine?.parameters.filter((item) => item.oeeType === OEE_TYPE_A) || ([] as MachineParameter[]);
  const pParams = machine?.parameters.filter((item) => item.oeeType === OEE_TYPE_P) || ([] as MachineParameter[]);
  const qParams = machine?.parameters.filter((item) => item.oeeType === OEE_TYPE_Q) || ([] as MachineParameter[]);

  const getDowntimes = async () => {
    try {
      const response = await axios.get<PlannedDowntime[]>('/planned-downtimes/all');
      const items = response.data;
      if (items.length === 0) {
        return;
      }
      setPlannedDowntimes(items.map((item: any) => {
        return {
          id: item.id,
          name: item.name
        }
      }));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      await getDowntimes();
    })();
  }, []);

  return (
    <>
      <TableRow hover>
        <TableCell align="center">
          <IconButton onClick={toggleRow}>
            <Iconify
              icon={open ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
              width={16}
              height={16}
            />
          </IconButton>
        </TableCell>

        <TableCell align="left">{machine?.code}</TableCell>

        <TableCell align="left">{machine?.name}</TableCell>

        <TableCell align="right">
          <TableMoreMenu
            open={openMenu}
            onOpen={handleOpenMenu}
            onClose={handleCloseMenu}
            actions={
              <>
                <MenuItem
                  onClick={() => {
                    onEditRow();
                    handleCloseMenu();
                  }}
                >
                  <Iconify icon={'eva:edit-fill'} />
                  Edit
                </MenuItem>

                <Divider sx={{ borderStyle: 'dashed' }} />

                <MenuItem
                  onClick={() => {
                    onDeleteRow();
                    handleCloseMenu();
                  }}
                  sx={{ color: 'error.main' }}
                >
                  <Iconify icon={'eva:trash-2-outline'} />
                  Delete
                </MenuItem>
              </>
            }
          />
        </TableCell>
      </TableRow>

      <TableRow sx={{ display: open ? 'table-row' : 'none' }}>
        <TableCell align="center">&nbsp;</TableCell>
        <TableCell align="left" colSpan={3}>
          <Typography variant={'h6'} sx={{ py: 1 }}>
            Planned Downtime
          </Typography>
          <Stack
            sx={{ mb: 3 }}
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={2}
          >
            <p>Fix Time</p>
            <p>planned downtime</p>
          </Stack>
          {oeeMachinePlannedDowntime?.map((plan, index) => (
            <Stack spacing={2} direction="row" sx={{ mb: 3 }} key={`oeeMachinePlannedDowntime-${index}`}>
              {/* <div>index: {index}</div>
              <div>plan: {plan.plannedDownTimeId}</div> */}
              <RHFCheckboxCustom name={`oeeMachines[0].oeeMachinePlannedDowntime[${index}].fixTime`} value={plan.fixTime} label='' onClick={() => onFixTimeChange(index)} />
              <RHFSelect
                name={`oeeMachines[0].oeeMachinePlannedDowntime[${index}].plannedDownTimeId`}
                label="Type"
                size="small"
                value={plan.plannedDownTimeId}
                InputLabelProps={{ shrink: true }}
                SelectProps={{ native: false, suppressHydrationWarning: true }}
              >
                {plannedDowntimes.map((plannedDowntime, planIndex) => (
                  <MenuItem
                    key={`plan-downtime-${planIndex}`}
                    value={plannedDowntime.id}
                    sx={{
                      mx: 1,
                      my: 0.5,
                      borderRadius: 0.75,
                      typography: 'body2',
                    }}
                  >
                    {plannedDowntime.name}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFTimePickerCustom key={`batchStartDateTimePicker-${index}`} name={`oeeMachines[0].oeeMachinePlannedDowntime[${index}].startDate`} label="Start Date" size="small" value={plan.startDate} />
              <RHFTimePickerCustom key={`batchEndDateTimePicker-${index}`} name={`oeeMachines[0].oeeMachinePlannedDowntime[${index}].endDate`} label="End Date" size="small" value={plan.endDate}/>
              {index === 0 && oeeMachinePlannedDowntime.length === 1 ? <></> :
                (<div>
                  <RemoveCircleIcon color="error" sx={{ mt: 1 }} onClick={() => onDeletePlanDowntime(0, index)} />
                </div>)
              }
              {index === oeeMachinePlannedDowntime.length - 1 ? (
                <div>
                  <AddCircleIcon color="success" sx={{ mt: 1 }} onClick={onAddPlanDowntime} />
                </div>) : <></>}
            </Stack>
          ))}

          {aParams.length !== 0 && (
            <Box>
              <Typography variant={'h6'} sx={{ py: 1 }}>
                OEE Parameter - Availability (A)
              </Typography>
              <Grid container spacing={1}>
                {aParams.map((item, index) => (
                  <Grid item key={item.id} xs={6}>
                    <Typography variant={'body2'}>{item.name}</Typography>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {pParams.length !== 0 && (
            <Box>
              <Typography variant={'h6'} sx={{ py: 1 }}>
                OEE Parameter - Performance (P)
              </Typography>
              <Grid container spacing={1}>
                {pParams.map((item, index) => (
                  <Grid item key={item.id} xs={6}>
                    <Typography variant={'body2'}>{item.name}</Typography>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {qParams.length !== 0 && (
            <Box>
              <Typography variant={'h6'} sx={{ py: 1 }}>
                OEE Parameter - Quality (Q)
              </Typography>
              <Grid container spacing={1}>
                {qParams.map((item, index) => (
                  <Grid item key={item.id} xs={6}>
                    <Typography variant={'body2'}>{item.name}</Typography>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </TableCell>
      </TableRow>
    </>
  );
}
