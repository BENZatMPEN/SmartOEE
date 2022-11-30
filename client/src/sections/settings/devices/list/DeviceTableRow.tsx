import { Checkbox, Divider, MenuItem, TableCell, TableRow } from '@mui/material';
import { useState } from 'react';
import { Device } from '../../../../@types/device';
import Iconify from '../../../../components/Iconify';
import { TableMoreMenu } from '../../../../components/table';
import { getDeviceModelConnectionTypeText, getDeviceModelTypeText } from '../../../../utils/formatText';

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
