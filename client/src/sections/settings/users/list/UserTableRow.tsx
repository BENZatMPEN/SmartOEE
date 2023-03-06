import { Checkbox, MenuItem, TableCell, TableRow } from '@mui/material';
import { useContext, useState } from 'react';
import { User } from '../../../../@types/user';
import Iconify from '../../../../components/Iconify';
import { TableMoreMenu } from '../../../../components/table';
import { fDateTime } from '../../../../utils/formatTime';
import { AbilityContext } from '../../../../caslContext';
import { RoleAction, RoleSubject } from '../../../../@types/role';

type Props = {
  row: User;
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onDuplicateRow: VoidFunction;
  onChangePasswordRow: VoidFunction;
};

export default function UserTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onDuplicateRow,
  onChangePasswordRow,
}: Props) {
  const { email, firstName, lastName, createdAt } = row;

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  const ability = useContext(AbilityContext);

  const showMenu =
    ability.can(RoleAction.Create, RoleSubject.UserSettings) ||
    ability.can(RoleAction.Update, RoleSubject.UserSettings) ||
    ability.can(RoleAction.Delete, RoleSubject.UserSettings);

  return (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectRow} />
      </TableCell>

      <TableCell align="left">{firstName}</TableCell>

      <TableCell align="left">{lastName}</TableCell>

      <TableCell align="left">{email}</TableCell>

      <TableCell align="left">{fDateTime(createdAt)}</TableCell>

      <TableCell align="right">
        {showMenu && (
          <TableMoreMenu
            open={openMenu}
            onOpen={handleOpenMenu}
            onClose={handleCloseMenu}
            actions={
              <>
                {ability.can(RoleAction.Update, RoleSubject.UserSettings) && (
                  <>
                    <MenuItem
                      onClick={() => {
                        onChangePasswordRow();
                        handleCloseMenu();
                      }}
                    >
                      <Iconify icon={'eva:credit-card-outline'} />
                      Change Password
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
                  </>
                )}

                {ability.can(RoleAction.Create, RoleSubject.UserSettings) && (
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

                {ability.can(RoleAction.Delete, RoleSubject.UserSettings) && (
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
