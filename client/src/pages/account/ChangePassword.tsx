import { Container } from '@mui/material';
import Page from '../../components/Page';
import ChangePasswordForm from '../../sections/account/ChangePasswordForm';

export default function ChangePassword() {
  return (
    <Page title={`Change Password`}>
      <Container maxWidth={false}>
        <ChangePasswordForm />
      </Container>
    </Page>
  );
}
