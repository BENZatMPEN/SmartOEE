import { Checkbox, Divider, MenuItem, TableCell, TableRow } from '@mui/material';
import parse from 'html-react-parser';
import { useContext, useState } from 'react';
import { DeviceModel } from '../../../../@types/deviceModel';
import Iconify from '../../../../components/Iconify';
import { TableMoreMenu } from '../../../../components/table';
import { getDeviceModelConnectionTypeText, getDeviceModelTypeText } from '../../../../utils/formatText';
import { AbilityContext } from '../../../../caslContext';
import { RoleAction, RoleSubject } from '../../../../@types/role';

type Props = {
  row: DeviceModel;
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onDuplicateRow: VoidFunction;
};

export default function DeviceModelTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onDuplicateRow,
}: Props) {
  const { name, remark, connectionType, modelType } = row;

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };
  const ability = useContext(AbilityContext);

  const showMenu =
    ability.can(RoleAction.Create, RoleSubject.ModelSettings) ||
    ability.can(RoleAction.Update, RoleSubject.ModelSettings) ||
    ability.can(RoleAction.Delete, RoleSubject.ModelSettings);

  return (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectRow} />
      </TableCell>

      <TableCell align="left">{name}</TableCell>

      <TableCell align="left">{remark ? parse(remark) : ''}</TableCell>

      <TableCell align="left">{getDeviceModelTypeText(modelType)}</TableCell>

      <TableCell align="left">{getDeviceModelConnectionTypeText(connectionType)}</TableCell>

      <TableCell align="right">
        {showMenu && (
          <TableMoreMenu
            open={openMenu}
            onOpen={handleOpenMenu}
            onClose={handleCloseMenu}
            actions={
              <>
                {ability.can(RoleAction.Update, RoleSubject.ModelSettings) && (
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

                {ability.can(RoleAction.Create, RoleSubject.ModelSettings) && (
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

                {ability.can(RoleAction.Delete, RoleSubject.ModelSettings) && (
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
