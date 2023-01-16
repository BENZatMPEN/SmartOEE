import {
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import { RoleAction, RoleSetting, RoleSubject } from '../../../../@types/role';
import { initialRoles } from '../../../../constants';
import { getRoleActionText, getRoleSubjectText } from '../../../../utils/formatText';

export const roleMaps: RoleSetting[] = initialRoles;

interface Props {
  roles: RoleSetting[];
  onUpdated: (subject: RoleSubject, action: RoleAction, checked: boolean) => void;
}

export function RolePermissionForm({ roles, onUpdated }: Props) {
  const handleSettingChange = (subject: RoleSubject, action: RoleAction, checked: boolean) => {
    onUpdated(subject, action, checked);
  };

  const containRole = (subject: RoleSubject, action: RoleAction): boolean => {
    return roles.findIndex((role) => role.subject === subject && role.actions.indexOf(action) > -1) > -1;
  };

  return (
    <TableContainer>
      <Table size={'small'}>
        <TableBody>
          {roleMaps.map((roleMap) => (
            <TableRow key={roleMap.subject} hover>
              <TableCell>
                <Typography variant={'subtitle1'}>{getRoleSubjectText(roleMap.subject)}</Typography>
              </TableCell>
              {roleMap.actions.map((action) => (
                <TableCell key={action}>
                  <FormControlLabel
                    label={getRoleActionText(action)}
                    control={
                      <Checkbox
                        checked={containRole(roleMap.subject, action)}
                        onChange={(event) => {
                          handleSettingChange(roleMap.subject, action, event.target.checked);
                        }}
                      />
                    }
                  />
                </TableCell>
              ))}
              {[...Array(5 - roleMap.actions.length)].map((value, index, array) => (
                <TableCell key={'cell_' + index}></TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
