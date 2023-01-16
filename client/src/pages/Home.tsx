import { Container, Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  PATH_ANALYTICS,
  PATH_DASHBOARD,
  PATH_FAQS,
  PATH_PLANNINGS,
  PATH_PROBLEMS_SOLUTIONS,
  PATH_SETTINGS,
} from 'src/routes/paths';
import { RoleAction, RoleSubject } from '../@types/role';
import { AbilityContext } from '../caslContext';
import Page from '../components/Page';
import ButtonWidget from '../sections/home/ButtonWidget';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export default function Home() {
  const ability = useContext(AbilityContext);

  const hasSettings =
    ability.can(RoleAction.Read, RoleSubject.OeeSettings) ||
    ability.can(RoleAction.Read, RoleSubject.MachineSettings) ||
    ability.can(RoleAction.Read, RoleSubject.ProductSettings) ||
    ability.can(RoleAction.Read, RoleSubject.DeviceSettings) ||
    ability.can(RoleAction.Read, RoleSubject.ModelSettings) ||
    ability.can(RoleAction.Read, RoleSubject.PlannedDowntimeSettings) ||
    ability.can(RoleAction.Read, RoleSubject.DashboardSettings) ||
    ability.can(RoleAction.Read, RoleSubject.AlarmSettings) ||
    ability.can(RoleAction.Read, RoleSubject.SiteSettings) ||
    ability.can(RoleAction.Read, RoleSubject.UserSettings) ||
    ability.can(RoleAction.Read, RoleSubject.RoleSettings);

  return (
    <Page title="Home">
      <Container maxWidth={false}>
        <Grid container spacing={3} justifyContent="center">
          {ability.can(RoleAction.Read, RoleSubject.Dashboard) ? (
            <Grid item xs={12} sm={4}>
              <Link to={PATH_DASHBOARD.root}>
                <ButtonWidget title="OEE Dashboard" icon={'icon-park:dashboard'} />
              </Link>
            </Grid>
          ) : (
            <></>
          )}

          {ability.can(RoleAction.Read, RoleSubject.Plannings) ? (
            <Grid item xs={12} sm={4}>
              <Link to={PATH_PLANNINGS.root}>
                <ButtonWidget title="Shift Planning" icon={'icon-park:calendar'} />
              </Link>
            </Grid>
          ) : (
            <></>
          )}

          {ability.can(RoleAction.Read, RoleSubject.Analytics) ? (
            <Grid item xs={12} sm={4}>
              <Link to={PATH_ANALYTICS.root}>
                <ButtonWidget title="Analytics" icon={'icon-park:data-sheet'} />
              </Link>
            </Grid>
          ) : (
            <></>
          )}

          {ability.can(RoleAction.Read, RoleSubject.ProblemsAndSolutions) ? (
            <Grid item xs={12} sm={4}>
              <Link to={PATH_PROBLEMS_SOLUTIONS.root}>
                <ButtonWidget title="Problems & Solutions" icon={'icon-park:brain'} />
              </Link>
            </Grid>
          ) : (
            <></>
          )}

          {ability.can(RoleAction.Read, RoleSubject.Faqs) ? (
            <Grid item xs={12} sm={4}>
              <Link to={PATH_FAQS.root}>
                <ButtonWidget title="FAQs" icon={'icon-park:comments'} />
              </Link>
            </Grid>
          ) : (
            <></>
          )}

          {hasSettings ? (
            <Grid item xs={12} sm={4}>
              <Link to={PATH_SETTINGS.root}>
                <ButtonWidget title="Settings" icon={'icon-park:setting-config'} />
              </Link>
            </Grid>
          ) : (
            <></>
          )}
        </Grid>
      </Container>
    </Page>
  );
}
