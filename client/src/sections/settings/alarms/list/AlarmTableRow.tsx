import { Checkbox, Divider, MenuItem, TableCell, TableRow } from '@mui/material';
import { useContext, useState } from 'react';
import { Alarm } from '../../../../@types/alarm';
import Iconify from '../../../../components/Iconify';
import { TableMoreMenu } from '../../../../components/table';
import { fAlarmTypeText } from '../../../../utils/textHelper';
import { RoleAction, RoleSubject } from '../../../../@types/role';
import { AbilityContext } from '../../../../caslContext';

type Props = {
  row: Alarm;
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onDuplicateRow: VoidFunction;
};

export default function AlarmTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow, onDuplicateRow }: Props) {
  const { name, type, notify } = row;

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  const ability = useContext(AbilityContext);

  const showMenu =
    ability.can(RoleAction.Create, RoleSubject.AlarmSettings) ||
    ability.can(RoleAction.Update, RoleSubject.AlarmSettings) ||
    ability.can(RoleAction.Delete, RoleSubject.AlarmSettings);

  return (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectRow} />
      </TableCell>

      <TableCell align="left">{name}</TableCell>

      <TableCell align="left">{fAlarmTypeText(type)}</TableCell>

      <TableCell padding="checkbox">
        <Checkbox checked={notify} />
      </TableCell>

      <TableCell align="right">
        {showMenu && (
          <TableMoreMenu
            open={openMenu}
            onOpen={handleOpenMenu}
            onClose={handleCloseMenu}
            actions={
              <>
                {ability.can(RoleAction.Update, RoleSubject.AlarmSettings) && (
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

                {ability.can(RoleAction.Create, RoleSubject.AlarmSettings) && (
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

                {ability.can(RoleAction.Delete, RoleSubject.AlarmSettings) && (
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
