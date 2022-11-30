import { Container } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Machine } from '../../../@types/machine';
import Page from '../../../components/Page';
import { PATH_SETTINGS } from '../../../routes/paths';
import MachineForm from '../../../sections/settings/machines/details/MachineForm';
import axios from '../../../utils/axios';

export default function MachineDetails() {
  const { pathname } = useLocation();

  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = pathname.includes('edit');

  const isDuplicate = pathname.includes('duplicate');

  const [model, setModel] = useState<Machine | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (isEdit || isDuplicate) {
          const response = await axios.get<Machine>(`/machines/${id}`);
          const machine = response.data;
          if (isDuplicate) {
            machine.imageUrl = '';
          }
          setModel(machine);
        }
      } catch (error) {
        console.log(error);
        if (error.statusCode === 404) {
          navigate(PATH_SETTINGS.machines.root);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Page title={model ? 'Machine Settings: Edit Machine' : 'Machine Settings: Create Machine'}>
      <Container maxWidth={false}>
        <MachineForm isEdit={isEdit} currentMachine={model} />
      </Container>
    </Page>
  );
}
