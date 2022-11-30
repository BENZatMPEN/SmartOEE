import { Box, Divider, Grid, IconButton, MenuItem, TableCell, TableRow, Typography } from '@mui/material';
import { useState } from 'react';
import { OEE_TYPE_A, OEE_TYPE_P, OEE_TYPE_Q } from '../../../../constants';
import { MachineParameter } from '../../../../@types/machine';
import { OeeMachine } from '../../../../@types/oee';
import Iconify from '../../../../components/Iconify';
import { TableMoreMenu } from '../../../../components/table';

type Props = {
  row: OeeMachine;
  onEditRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function OeeMachineTableRow({ row, onEditRow, onDeleteRow }: Props) {
  const { machine } = row;

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

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
