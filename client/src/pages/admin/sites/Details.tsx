import { Container } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Site } from '../../../@types/site';
import Page from '../../../components/Page';
import SiteForm from '../../../sections/admin/sites/details/SiteForm';
import axios from '../../../utils/axios';

export default function SiteDetails() {
  const { pathname } = useLocation();

  const { id } = useParams();

  const isEdit = pathname.includes('edit');

  const isDuplicate = pathname.includes('duplicate');

  const [model, setModel] = useState<Site | undefined>(undefined);

  useEffect(() => {
    if (!id) {
      return;
    }

    (async () => {
      try {
        const response = await axios.get<Site>(`/sites/${id}`);
        const site = response.data;
        if (isDuplicate) {
          site.imageUrl = '';
        }
        setModel(site);
      } catch (error) {
        console.log(error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <Page title="Site Settings">
      <Container maxWidth={false}>
        <SiteForm isEdit={isEdit} currentSite={model} />
      </Container>
    </Page>
  );
}
