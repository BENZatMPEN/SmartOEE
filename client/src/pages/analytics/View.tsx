import { Card, CardContent, Container, Stack } from '@mui/material';
import Page from '../../components/Page';
import AnalyticCriteriaForm from '../../sections/analytics/view/AnalyticCriteriaForm';
import { RootState, useSelector } from '../../redux/store';
import AnalyticChart from '../../sections/analytics/AnalyticChart';

export default function AnalyticSingle() {
  const { currentCriteria: criteria } = useSelector((state: RootState) => state.analytic);

  function genKey() {
    if (!criteria) {
      return '';
    }

    const { oees, products, batches } = criteria;
    const ids = [...oees, ...products, ...batches];
    if (ids.length === 0) {
      return '';
    }

    return `_${ids.join('_')}`;
  }

  return (
    <Page title="Analytics">
      <Container maxWidth={false}>
        <Stack spacing={3}>
          <AnalyticCriteriaForm />

          {criteria && (
            <Card>
              <CardContent>
                <AnalyticChart
                  criteria={criteria}
                  key={`${criteria.viewType}_${criteria.chartType}_${criteria.chartSubType}${genKey()}`}
                />
              </CardContent>
            </Card>
          )}
        </Stack>
      </Container>
    </Page>
  );
}
