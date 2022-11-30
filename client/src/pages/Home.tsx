// @mui
import { Container, Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import {
  PATH_ANALYTICS,
  PATH_DASHBOARD,
  PATH_FAQS,
  PATH_PLANNINGS,
  PATH_PROBLEMS_SOLUTIONS,
  PATH_SETTINGS,
} from 'src/routes/paths';
// components
import Page from '../components/Page';
// hooks
import useSettings from '../hooks/useSettings';
import ButtonWidget from '../sections/home/ButtonWidget';

// ----------------------------------------------------------------------

export default function Home() {
  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

  return (
    <Page title="Home">
      <Container maxWidth={false}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item md={4} sm={6}>
            <Link to={PATH_DASHBOARD.root}>
              <ButtonWidget title="OEE Dashboard" icon={'icon-park:dashboard'} />
            </Link>
          </Grid>

          <Grid item md={4} sm={6}>
            <Link to={PATH_PLANNINGS.root}>
              <ButtonWidget title="Shift Planning" icon={'icon-park:calendar'} />
            </Link>
          </Grid>

          <Grid item md={4} sm={6}>
            <Link to={PATH_ANALYTICS.root}>
              <ButtonWidget title="Analytics" icon={'icon-park:data-sheet'} />
            </Link>
          </Grid>

          <Grid item md={4} sm={6}>
            <Link to={PATH_PROBLEMS_SOLUTIONS.root}>
              <ButtonWidget title="Problems & Solutions" icon={'icon-park:brain'} />
            </Link>
          </Grid>

          <Grid item md={4} sm={6}>
            <Link to={PATH_FAQS.root}>
              <ButtonWidget title="FAQs" icon={'icon-park:comments'} />
            </Link>
          </Grid>

          <Grid item md={4} sm={6}>
            <Link to={PATH_SETTINGS.root}>
              <ButtonWidget title="Settings" icon={'icon-park:setting-config'} />
            </Link>
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
