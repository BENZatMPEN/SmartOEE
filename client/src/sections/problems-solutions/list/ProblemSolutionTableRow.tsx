import { Checkbox, Divider, MenuItem, TableCell, TableRow } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { ProblemSolution } from '../../../@types/problemSolution';
import Iconify from '../../../components/Iconify';
import { TableMoreMenu } from '../../../components/table';
import { fCode } from '../../../utils/formatNumber';
import { getPsProcessStatusText } from '../../../utils/formatText';
import { fShortDate } from '../../../utils/formatTime';

type Props = {
  row: ProblemSolution;
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onDuplicateRow: VoidFunction;
  onDetailsRow: VoidFunction;
};

export default function ProblemSolutionTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onDuplicateRow,
  onDetailsRow,
}: Props) {
  const theme = useTheme();

  const { id, name, headProjectUserId, approvedByUserId, startDate, endDate, status, headProjectUser, approvedByUser } =
    row;

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

      <TableCell align="left">{fCode(id, 'P')}</TableCell>

      <TableCell align="left">{name}</TableCell>

      <TableCell align="left">
        {headProjectUser ? `${headProjectUser.firstName} ${headProjectUser.lastName}` : '-'}
      </TableCell>

      <TableCell align="left">
        {approvedByUser ? `${approvedByUser.firstName} ${approvedByUser.lastName}` : '-'}
      </TableCell>

      <TableCell align="left">
        {fShortDate(startDate)} - {fShortDate(endDate)}
      </TableCell>

      <TableCell align="center">{getPsProcessStatusText(status)}</TableCell>

      <TableCell align="right">
        <TableMoreMenu
          open={openMenu}
          onOpen={handleOpenMenu}
          onClose={handleCloseMenu}
          actions={
            <>
              <MenuItem
                onClick={() => {
                  onDetailsRow();
                  handleCloseMenu();
                }}
              >
                <Iconify icon={'eva:file-text-outline'} />
                Details
              </MenuItem>

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
