import { Container, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import Page from '../../components/Page';
import { PATH_ANALYTICS } from '../../routes/paths';
import ButtonWidget from '../../sections/home/ButtonWidget';

export default function AnalyticHome() {
  return (
    <Page title="Analytics">
      <Container maxWidth={false}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item md={4}>
            <Link to={PATH_ANALYTICS.view}>
              <ButtonWidget title="Analytics" icon={'icon-park:data-sheet'} />
            </Link>
          </Grid>

          <Grid item md={4}>
            <Link to={PATH_ANALYTICS.group.root}>
              <ButtonWidget title="Group Analytics" icon={'icon-park:chart-graph'} />
            </Link>
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
