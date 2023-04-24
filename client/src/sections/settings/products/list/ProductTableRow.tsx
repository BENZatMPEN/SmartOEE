import { Checkbox, Divider, MenuItem, TableCell, TableRow } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useContext, useState } from 'react';
import { Product } from '../../../../@types/product';
import Iconify from '../../../../components/Iconify';
import { TableMoreMenu } from '../../../../components/table';
import { RoleAction, RoleSubject } from '../../../../@types/role';
import { AbilityContext } from '../../../../caslContext';
import { fShortDate, fShortDateTime } from '../../../../utils/formatTime';

type Props = {
  row: Product;
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onDuplicateRow: VoidFunction;
};

export default function ProductTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow, onDuplicateRow }: Props) {
  const theme = useTheme();

  const { name, sku, createdAt } = row;

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  const ability = useContext(AbilityContext);

  const showMenu =
    ability.can(RoleAction.Create, RoleSubject.ProductSettings) ||
    ability.can(RoleAction.Update, RoleSubject.ProductSettings) ||
    ability.can(RoleAction.Delete, RoleSubject.ProductSettings);

  return (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectRow} />
      </TableCell>

      <TableCell align="left">{sku}</TableCell>

      <TableCell align="left">{name}</TableCell>

      <TableCell align="left">{fShortDateTime(createdAt)}</TableCell>

      <TableCell align="right">
        {showMenu && (
          <TableMoreMenu
            open={openMenu}
            onOpen={handleOpenMenu}
            onClose={handleCloseMenu}
            actions={
              <>
                {ability.can(RoleAction.Update, RoleSubject.ProductSettings) && (
                  <MenuItem
                    onClick={() => {
                      onEditRow();
                      handleCloseMenu();
                    }}
                  >
                    <Iconify icon={'eva:edit-fill'} />
                    Edit
                  </MenuItem>
                )}

                {ability.can(RoleAction.Create, RoleSubject.ProductSettings) && (
                  <MenuItem
                    onClick={() => {
                      onDuplicateRow();
                      handleCloseMenu();
                    }}
                  >
                    <Iconify icon={'eva:copy-fill'} />
                    Duplicate
                  </MenuItem>
                )}

                {ability.can(RoleAction.Delete, RoleSubject.ProductSettings) && (
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
        )}
      </TableCell>
    </TableRow>
  );
}
