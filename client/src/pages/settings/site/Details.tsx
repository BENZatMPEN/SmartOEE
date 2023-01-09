import { Card, CardContent, Container } from '@mui/material';
import { useEffect, useState } from 'react';
import { Site } from '../../../@types/site';
import Page from '../../../components/Page';
import { RootState, useSelector } from '../../../redux/store';
import SiteForm from '../../../sections/settings/site/details/SiteForm';
import axios from '../../../utils/axios';

export default function SiteDetails() {
  const { selectedSite } = useSelector((state: RootState) => state.userSite);

  const [model, setModel] = useState<Site | null>(null);

  useEffect(() => {
    (async () => {
      if (!selectedSite) {
        setModel(null);
        return;
      }

      try {
        const response = await axios.get<Site>(`/sites/${selectedSite.id}`);
        setModel(response.data);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [selectedSite]);

  return (
    <Page title="Site Settings">
      <Container maxWidth={false}>
        {model ? (
          <SiteForm currentSite={model} />
        ) : (
          <Card>
            <CardContent>Not found</CardContent>
          </Card>
        )}
      </Container>
    </Page>
  );
}
