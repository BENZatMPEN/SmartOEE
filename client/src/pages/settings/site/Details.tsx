import { Card, CardContent, Container } from '@mui/material';
import { useEffect } from 'react';
import Page from '../../../components/Page';
import { emptyCurrentSite, getSite } from '../../../redux/actions/siteAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import SiteForm from '../../../sections/settings/site/details/SiteForm';

export default function SiteDetails() {
  const dispatch = useDispatch();

  const { selectedSite } = useSelector((state: RootState) => state.userSite);

  const { isLoading } = useSelector((state: RootState) => state.site);

  useEffect(() => {
    (async () => {
      if (!selectedSite) {
        return;
      }

      await dispatch(getSite(selectedSite.id));

      return () => {
        dispatch(emptyCurrentSite());
      };
    })();
  }, [dispatch, selectedSite]);

  return (
    <Page title="Site Settings">
      <Container maxWidth={false}>
        {isLoading ? (
          <Card>
            <CardContent>Loading...</CardContent>
          </Card>
        ) : (
          <SiteForm />
        )}
      </Container>
    </Page>
  );
}
