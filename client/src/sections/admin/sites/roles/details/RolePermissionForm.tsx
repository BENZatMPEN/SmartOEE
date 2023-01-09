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
import { RoleAction, RoleSetting, RoleSubject } from '../../../../../@types/role';
import { getRoleActionText, getRoleSubjectText } from '../../../../../utils/formatText';

export const roleMaps: RoleSetting[] = [
  {
    subject: RoleSubject.Dashboard,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update],
  },
  {
    subject: RoleSubject.Analytics,
    actions: [RoleAction.Read],
  },
  {
    subject: RoleSubject.ProblemsAndSolutions,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.Faqs,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.Plannings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.OeeSettings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.MachineSettings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.ProductSettings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.DeviceSettings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.ModelSettings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.PlannedDowntimeSettings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.DashboardSettings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.AlarmSettings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.SiteSettings,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.AdminSites,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.AdminUsers,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
  {
    subject: RoleSubject.AdminRoles,
    actions: [RoleAction.Read, RoleAction.Create, RoleAction.Update, RoleAction.Delete],
  },
];

interface IProps {
  roles: RoleSetting[];
  onUpdated: (subject: RoleSubject, action: RoleAction, checked: boolean) => void;
}

export function RolePermissionForm({ roles, onUpdated }: IProps) {
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
              {[...Array(4 - roleMap.actions.length)].map((value, index, array) => (
                <TableCell key={'cell_' + index}></TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
