import { Checkbox, MenuItem, TableCell, TableRow } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useContext, useState } from 'react';
import { Faq } from '../../../@types/faq';
import Iconify from '../../../components/Iconify';
import { TableMoreMenu } from '../../../components/table';
import { fCode } from '../../../utils/formatNumber';
import { getFaqProcessStatusText } from '../../../utils/formatText';
import { AbilityContext } from '../../../caslContext';
import { RoleAction, RoleSubject } from '../../../@types/role';

type Props = {
  row: Faq;
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  onDuplicateRow: VoidFunction;
  onDetailsRow: VoidFunction;
};

export default function FaqTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onDuplicateRow,
  onDetailsRow,
}: Props) {
  const theme = useTheme();

  const { id, topic, approvedByUser, createdByUser, status } = row;

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  const ability = useContext(AbilityContext);

  const showMenu =
    ability.can(RoleAction.Read, RoleSubject.Faqs) ||
    ability.can(RoleAction.Create, RoleSubject.Faqs) ||
    ability.can(RoleAction.Update, RoleSubject.Faqs) ||
    ability.can(RoleAction.Delete, RoleSubject.Faqs);

  return (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectRow} />
      </TableCell>

      <TableCell align="left">{fCode(id, 'Q')}</TableCell>

      <TableCell align="left">{topic}</TableCell>

      <TableCell align="left">{createdByUser ? `${createdByUser.firstName} ${createdByUser.lastName}` : '-'}</TableCell>

      <TableCell align="left">
        {approvedByUser ? `${approvedByUser.firstName} ${approvedByUser.lastName}` : '-'}
      </TableCell>

      <TableCell align="center">{getFaqProcessStatusText(status)}</TableCell>

      <TableCell align="right">
        {showMenu && (
          <TableMoreMenu
            open={openMenu}
            onOpen={handleOpenMenu}
            onClose={handleCloseMenu}
            actions={
              <>
                {ability.can(RoleAction.Read, RoleSubject.Faqs) && (
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

                {ability.can(RoleAction.Update, RoleSubject.Faqs) && (
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

                {ability.can(RoleAction.Create, RoleSubject.Faqs) && (
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

                {ability.can(RoleAction.Delete, RoleSubject.Faqs) && (
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
