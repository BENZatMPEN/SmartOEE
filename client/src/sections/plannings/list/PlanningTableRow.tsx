import { Checkbox, Divider, MenuItem, TableCell, TableRow } from '@mui/material';
import { useState } from 'react';
import { Planning } from '../../../@types/planning';
import Iconify from '../../../components/Iconify';
import { TableMoreMenu } from '../../../components/table';
import { fDateTime } from '../../../utils/formatTime';

type Props = {
  row: Planning;
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onDuplicateRow: VoidFunction;
};

export default function PlanningTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onDuplicateRow,
}: Props) {
  const { id, startDate, endDate, title, plannedQuantity, oee, product, user } = row;

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

      <TableCell align="left">{fDateTime(startDate)}</TableCell>

      <TableCell align="left">{fDateTime(endDate)}</TableCell>

      <TableCell align="left">{title}</TableCell>

      <TableCell align="left">{oee.productionName}</TableCell>

      <TableCell align="left">{product.name}</TableCell>

      <TableCell align="left">{user.firstName}</TableCell>

      <TableCell align="center">{plannedQuantity}</TableCell>

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
