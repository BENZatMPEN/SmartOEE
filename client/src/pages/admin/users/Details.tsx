import { Container } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { User } from '../../../@types/user';
import Page from '../../../components/Page';
import UserForm from '../../../sections/admin/users/details/UserForm';
import axios from '../../../utils/axios';

export default function UserDetails() {
  const { pathname } = useLocation();

  const { id } = useParams();

  const isEdit = pathname.includes('edit');

  const isDuplicate = pathname.includes('duplicate');

  const [model, setModel] = useState<User | undefined>(undefined);

  useEffect(() => {
    if (!id) {
      return;
    }

    (async () => {
      try {
        const response = await axios.get<User>(`/users/${id}`);
        const user = response.data;
        if (isDuplicate) {
          user.imageUrl = '';
        }
        setModel(user);
      } catch (error) {
        console.log(error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <Page title="User Settings">
      <Container maxWidth={false}>
        <UserForm isEdit={isEdit} currentUser={model} />
      </Container>
    </Page>
  );
}
