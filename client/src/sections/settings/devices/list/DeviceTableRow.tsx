import { Checkbox, Divider, MenuItem, TableCell, TableRow } from '@mui/material';
import { useContext, useState } from 'react';
import { Device } from '../../../../@types/device';
import Iconify from '../../../../components/Iconify';
import { TableMoreMenu } from '../../../../components/table';
import { getDeviceModelConnectionTypeText, getDeviceModelTypeText } from '../../../../utils/formatText';
import { AbilityContext } from '../../../../caslContext';
import { RoleAction, RoleSubject } from '../../../../@types/role';

type Props = {
  row: Device;
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onDuplicateRow: VoidFunction;
  onDetailsRow: VoidFunction;
};

export default function DeviceTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onDuplicateRow,
  onDetailsRow,
}: Props) {
  const { deviceId, name, remark, address, port, deviceModel, stopped } = row;

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  const ability = useContext(AbilityContext);

  const showMenu =
    ability.can(RoleAction.Read, RoleSubject.DeviceSettings) ||
    ability.can(RoleAction.Create, RoleSubject.DeviceSettings) ||
    ability.can(RoleAction.Update, RoleSubject.DeviceSettings) ||
    ability.can(RoleAction.Delete, RoleSubject.DeviceSettings);

  return (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectRow} />
      </TableCell>

      <TableCell align="left">{name}</TableCell>

      <TableCell align="left">{address}</TableCell>

      <TableCell align="left">{port}</TableCell>

      <TableCell align="left">{deviceId}</TableCell>

      <TableCell align="left">{deviceModel?.modelType ? getDeviceModelTypeText(deviceModel.modelType) : ''}</TableCell>

      <TableCell align="left">
        {deviceModel?.connectionType ? getDeviceModelConnectionTypeText(deviceModel.connectionType) : ''}
      </TableCell>

      <TableCell align="center">
        <Checkbox checked={stopped} />
      </TableCell>

      <TableCell align="left">{remark}</TableCell>

      <TableCell align="right">
        {showMenu && (
          <TableMoreMenu
            open={openMenu}
            onOpen={handleOpenMenu}
            onClose={handleCloseMenu}
            actions={
              <>
                {ability.can(RoleAction.Read, RoleSubject.DeviceSettings) && (
                  <MenuItem
                    onClick={() => {
                      onDetailsRow();
                      handleCloseMenu();
                    }}
                  >
                    <Iconify icon={'eva:file-text-outline'} />
                    Details
                  </MenuItem>
                )}

                {ability.can(RoleAction.Update, RoleSubject.DeviceSettings) && (
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

                {ability.can(RoleAction.Create, RoleSubject.DeviceSettings) && (
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

                {ability.can(RoleAction.Delete, RoleSubject.DeviceSettings) && (
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
