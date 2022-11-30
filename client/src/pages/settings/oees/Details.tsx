import { Container } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Oee } from '../../../@types/oee';
import Page from '../../../components/Page';
import { PATH_SETTINGS } from '../../../routes/paths';
import OeeForm from '../../../sections/settings/oee/details/OeeForm';
import axios from '../../../utils/axios';

export default function OEEDetails() {
  const { pathname } = useLocation();

  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = pathname.includes('edit');

  const isDuplicate = pathname.includes('duplicate');

  const [model, setModel] = useState<Oee | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (isEdit || isDuplicate) {
          const response = await axios.get<Oee>(`/oees/${id}`);
          const oee = response.data;
          if (isDuplicate) {
            oee.imageUrl = '';
          }
          setModel(oee);
        }
      } catch (error) {
        console.log(error);
        if (error.statusCode === 404) {
          navigate(PATH_SETTINGS.oees.root);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Page title={model ? 'OEE Settings: Edit OEE' : 'OEE Settings: Create OEE'}>
      <Container maxWidth={false}>
        <OeeForm isEdit={isEdit} currentOee={model} />
      </Container>
    </Page>
  );
}
