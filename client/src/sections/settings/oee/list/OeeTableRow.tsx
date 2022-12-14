import { Checkbox, Divider, MenuItem, TableCell, TableRow } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { Oee } from '../../../../@types/oee';
import Iconify from '../../../../components/Iconify';
import { TableMoreMenu } from '../../../../components/table';

type Props = {
  row: Oee;
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onDuplicateRow: VoidFunction;
};

export default function OeeTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow, onDuplicateRow }: Props) {
  const theme = useTheme();

  const { id, oeeCode, oeeMachines, location, oeeType } = row;

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  return (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectRow} />
      </TableCell>

      <TableCell align="left">{oeeCode}</TableCell>

      <TableCell align="left">
        <ul style={{ listStyleType: 'none' }}>
          {(oeeMachines ?? []).map((oeeMachine) => (
            <li key={'mc_' + oeeMachine.machine?.id}>{oeeMachine.machine?.code}</li>
          ))}
        </ul>
      </TableCell>

      <TableCell align="left">
        <ul style={{ listStyleType: 'none' }}>
          {(oeeMachines ?? []).map((oeeMachine) => (
            <li key={'mc_' + oeeMachine.machine?.id}>{oeeMachine.machine?.name}</li>
          ))}
        </ul>
      </TableCell>

      <TableCell align="left">{location}</TableCell>

      <TableCell align="left">{oeeType}</TableCell>

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

              <MenuItem
                onClick={() => {
                  onDuplicateRow();
                  handleCloseMenu();
                }}
              >
                <Iconify icon={'eva:copy-fill'} />
                Duplicate
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
  );
}
