import { Card, CardContent, Container, Stack } from '@mui/material';
import Page from '../../components/Page';
import AnalyticCriteriaForm from '../../sections/analytics/view/AnalyticCriteriaForm';
import { RootState, useSelector } from '../../redux/store';
import AnalyticChart from '../../sections/analytics/AnalyticChart';
import { useContext } from 'react';
import { AbilityContext } from '../../caslContext';
import { RoleAction, RoleSubject } from '../../@types/role';
import { Navigate } from 'react-router-dom';
import { PATH_PAGES } from '../../routes/paths';

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

  const ability = useContext(AbilityContext);

  if (!ability.can(RoleAction.Read, RoleSubject.Analytics)) {
    return <Navigate to={PATH_PAGES.forbidden} />;
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
