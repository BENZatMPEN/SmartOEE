import { Container } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PlannedDowntime } from '../../../@types/plannedDowntime';
import Page from '../../../components/Page';
import { PATH_SETTINGS } from '../../../routes/paths';
import PlannedDowntimeForm from '../../../sections/settings/planned-downtimes/details/PlannedDowntimeForm';
import axios from '../../../utils/axios';

export default function PlannedDowntimeDetails() {
  const { pathname } = useLocation();

  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = pathname.includes('edit');

  const isDuplicate = pathname.includes('duplicate');

  const [model, setModel] = useState<PlannedDowntime | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (isEdit || isDuplicate) {
          const response = await axios.get<PlannedDowntime>(`/planned-downtimes/${id}`);
          setModel(response.data);
        }
      } catch (error) {
        console.log(error);
        if (error.statusCode === 404) {
          navigate(PATH_SETTINGS.plannedDowntimes.root);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Page title={model ? 'Planned Downtime Settings: Edit Planned Downtime' : 'OEE Settings: Create Planned Downtime'}>
      <Container maxWidth={false}>
        <PlannedDowntimeForm isEdit={isEdit} currentPlannedDowntime={model} />
      </Container>
    </Page>
  );
}
