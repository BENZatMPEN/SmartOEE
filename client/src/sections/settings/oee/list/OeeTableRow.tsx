import { Checkbox, MenuItem, TableCell, TableRow } from '@mui/material';
import { useContext, useState } from 'react';
import { Oee } from '../../../../@types/oee';
import Iconify from '../../../../components/Iconify';
import { TableMoreMenu } from '../../../../components/table';
import { RoleAction, RoleSubject } from '../../../../@types/role';
import { AbilityContext } from '../../../../caslContext';
import { fOeeTypeText } from '../../../../utils/textHelper';

type Props = {
  row: Oee;
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onDuplicateRow: VoidFunction;
};

export default function OeeTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow, onDuplicateRow }: Props) {
  const { id, oeeCode, oeeMachines, location, oeeType } = row;

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  const ability = useContext(AbilityContext);

  const showMenu =
    ability.can(RoleAction.Create, RoleSubject.OeeSettings) ||
    ability.can(RoleAction.Update, RoleSubject.OeeSettings) ||
    ability.can(RoleAction.Delete, RoleSubject.OeeSettings);

  return (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectRow} />
      </TableCell>

      <TableCell align="left">{oeeCode}</TableCell>

      <TableCell align="left">
        <ul style={{ listStyleType: 'none' }}>
          {(oeeMachines ?? []).map((oeeMachine) => (
            <li key={'mc_' + oeeMachine.machine?.id}>{oeeMachine.machine?.code}</li>
          ))}
        </ul>
      </TableCell>

      <TableCell align="left">
        <ul style={{ listStyleType: 'none' }}>
          {(oeeMachines ?? []).map((oeeMachine) => (
            <li key={'mc_' + oeeMachine.machine?.id}>{oeeMachine.machine?.name}</li>
          ))}
        </ul>
      </TableCell>

      <TableCell align="left">{location}</TableCell>

      <TableCell align="left">{fOeeTypeText(oeeType)}</TableCell>

      <TableCell align="right">
        {showMenu && (
          <TableMoreMenu
            open={openMenu}
            onOpen={handleOpenMenu}
            onClose={handleCloseMenu}
            actions={
              <>
                {ability.can(RoleAction.Update, RoleSubject.OeeSettings) && (
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

                {ability.can(RoleAction.Create, RoleSubject.OeeSettings) && (
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

                {ability.can(RoleAction.Delete, RoleSubject.OeeSettings) && (
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
