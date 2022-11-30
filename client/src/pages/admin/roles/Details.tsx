import { Container } from '@mui/material';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Page from '../../../components/Page';
import { emptyCurrentRole, getRole } from '../../../redux/actions/roleAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import { PATH_SETTINGS } from '../../../routes/paths';
import RoleForm from '../../../sections/admin/roles/details/RoleForm';

export default function RoleDetails() {
  const dispatch = useDispatch();

  const { currentRole, detailsError } = useSelector((state: RootState) => state.role);

  const { pathname } = useLocation();

  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = pathname.includes('edit');

  const isDuplicate = pathname.includes('duplicate');

  useEffect(() => {
    (async () => {
      if (isEdit || isDuplicate) {
        await dispatch(getRole(Number(id)));

        if (detailsError && detailsError.statusCode === 404) {
          navigate(PATH_SETTINGS.devices.root);
        }
      }
    })();

    return () => {
      dispatch(emptyCurrentRole());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  return (
    <Page title={currentRole ? 'Role Settings: Edit Role' : 'Role Settings: Create Role'}>
      <Container maxWidth={false}>
        <RoleForm isEdit={isEdit} />
      </Container>
    </Page>
  );
}
