import { Container } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Alarm } from '../../../@types/alarm';
import Page from '../../../components/Page';
import { PATH_SETTINGS } from '../../../routes/paths';
import AlarmForm from '../../../sections/settings/alarms/details/AlarmForm';
import axios from '../../../utils/axios';

export default function ProductDetails() {
  const { pathname } = useLocation();

  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = pathname.includes('edit');

  const isDuplicate = pathname.includes('duplicate');

  const [model, setModel] = useState<Alarm | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (isEdit || isDuplicate) {
          const response = await axios.get<Alarm>(`/alarms/${id}`);
          setModel(response.data);
        }
      } catch (error) {
        console.log(error);
        if (error.statusCode === 404) {
          navigate(PATH_SETTINGS.alarms.root);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Page title={model ? 'Alarm Settings: Edit Alarm' : 'Alarm Settings: Create Alarm'}>
      <Container maxWidth={false}>
        <AlarmForm isEdit={isEdit} currentAlarm={model} />
      </Container>
    </Page>
  );
}
