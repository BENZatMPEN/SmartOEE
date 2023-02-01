import { Container } from '@mui/material';
import Page from '../../components/Page';
import UserProfileForm from '../../sections/account/UserProfileForm';

export default function UserDetails() {
  return (
    <Page title={`Edit Profile`}>
      <Container maxWidth={false}>
        <UserProfileForm />
      </Container>
    </Page>
  );
}
