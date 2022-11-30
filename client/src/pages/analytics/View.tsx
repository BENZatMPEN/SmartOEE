import { Card, CardContent, Container, Stack } from '@mui/material';
import dayjs from 'dayjs';
import { useState } from 'react';
import { AnalyticCriteria } from '../../@types/analytic';
import Page from '../../components/Page';
import AnalyticChart from '../../sections/analytics/AnalyticChart';
import AnalyticCriteriaForm from '../../sections/analytics/view/AnalyticCriteriaForm';

export default function AnalyticSingle() {
  const [criteria, setCriteria] = useState<AnalyticCriteria | null>();

  const handleRefresh = (data: AnalyticCriteria) => {
    setCriteria(data);
  };

  return (
    <Page title="Analytics">
      <Container maxWidth={false}>
        <Stack spacing={3}>
          <AnalyticCriteriaForm onRefresh={handleRefresh} />

          {criteria ? (
            <Card>
              <CardContent>
                <AnalyticChart criteria={criteria} />
              </CardContent>
            </Card>
          ) : (
            <></>
          )}
        </Stack>
      </Container>
    </Page>
  );
}
