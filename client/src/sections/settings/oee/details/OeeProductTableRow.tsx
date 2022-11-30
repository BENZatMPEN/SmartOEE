import { Divider, MenuItem, TableCell, TableRow } from '@mui/material';
import { useState } from 'react';
import { OeeProduct } from '../../../../@types/oee';
import Iconify from '../../../../components/Iconify';
import { TableMoreMenu } from '../../../../components/table';

type Props = {
  row: OeeProduct;
  onEditRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function OeeProductTableRow({ row, onEditRow, onDeleteRow }: Props) {
  const { product, standardSpeedSeconds } = row;

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  return (
    <TableRow hover>
      <TableCell align="left">{product?.sku}</TableCell>

      <TableCell align="left">{product?.name}</TableCell>

      <TableCell align="left">{standardSpeedSeconds}</TableCell>

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
  );
}
