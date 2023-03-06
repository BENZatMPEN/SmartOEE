import { Card, CardContent, Container } from '@mui/material';
import { useContext, useEffect } from 'react';
import Page from '../../../components/Page';
import { emptyCurrentSite, getSite } from '../../../redux/actions/siteAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import SiteForm from '../../../sections/settings/site/details/SiteForm';
import { AbilityContext } from '../../../caslContext';
import { RoleAction, RoleSubject } from '../../../@types/role';
import { Navigate } from 'react-router-dom';
import { PATH_PAGES } from '../../../routes/paths';

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

  const ability = useContext(AbilityContext);

  if (!ability.can(RoleAction.Read, RoleSubject.SiteSettings)) {
    return <Navigate to={PATH_PAGES.forbidden} />;
  }

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
