import { Divider, MenuItem, TableCell, TableRow } from '@mui/material';
import { useContext, useState } from 'react';
import { OeeBatch } from '../../../../../@types/oeeBatch';
import Iconify from '../../../../../components/Iconify';
import { TableMoreMenu } from '../../../../../components/table';
import { RootState, useSelector } from '../../../../../redux/store';
import { fDateTime } from '../../../../../utils/formatTime';
import { AbilityContext } from '../../../../../caslContext';
import { RoleAction, RoleSubject } from '../../../../../@types/role';

type Props = {
  row: OeeBatch;
  selected: boolean;
  onDeleteRow: VoidFunction;
  onExportRow: VoidFunction;
};

export default function DashboardHistoryTableRow({ row, selected, onDeleteRow, onExportRow }: Props) {
  const { currentBatch } = useSelector((state: RootState) => state.oeeBatch);

  const { product, lotNumber, batchStoppedDate, batchStartedDate } = row;

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  const ability = useContext(AbilityContext);

  return (
    <TableRow hover>
      <TableCell align="left">{product.name}</TableCell>

      <TableCell align="left">{lotNumber}</TableCell>

      <TableCell align="left">{fDateTime(batchStartedDate)}</TableCell>

      <TableCell align="left">{batchStoppedDate ? fDateTime(batchStoppedDate) : ''}</TableCell>

      <TableCell align="right">
        <TableMoreMenu
          open={openMenu}
          onOpen={handleOpenMenu}
          onClose={handleCloseMenu}
          actions={
            <>
              {currentBatch && currentBatch.id !== row.id && (
                <MenuItem
                  onClick={() => {
                    window.location.href = `/dashboard/${row.oeeId}/operating?batchId=${row.id}`;
                  }}
                >
                  <Iconify icon={'eva:file-text-outline'} />
                  View
                </MenuItem>
              )}

              <MenuItem
                onClick={() => {
                  onExportRow();
                  handleCloseMenu();
                }}
              >
                <Iconify icon={'tabler:file-export'} />
                Export
              </MenuItem>

              {ability.can(RoleAction.Delete, RoleSubject.Dashboard) && batchStoppedDate && (
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
              )}
            </>
          }
        />
      </TableCell>
    </TableRow>
  );
}
