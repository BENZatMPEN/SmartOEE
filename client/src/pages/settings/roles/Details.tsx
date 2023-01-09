import { Container } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Page from '../../../components/Page';
import { emptyCurrentRole, getRole } from '../../../redux/actions/roleAction';
import { emptyCurrentSite, getSite } from '../../../redux/actions/siteAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import { PATH_SETTINGS } from '../../../routes/paths';
import RoleForm from '../../../sections/admin/sites/roles/details/RoleForm';

export default function RoleDetails() {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const { currentRole } = useSelector((state: RootState) => state.role);

  const { pathname } = useLocation();

  const { siteId, id } = useParams();

  const isEdit = pathname.includes('edit');

  const isDuplicate = pathname.includes('duplicate');

  useEffect(() => {
    (async () => {
      await dispatch(getSite(Number(siteId)));

      try {
        if (isEdit || isDuplicate) {
          await dispatch(getRole(Number(id)));
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          if ('statusCode' in error.response?.data && error.response?.data.statusCode === 404) {
            enqueueSnackbar('Not found.', { variant: 'error' });
          } else {
            enqueueSnackbar(error.response?.data.error, { variant: 'error' });
          }
        }

        navigate(PATH_SETTINGS.devices.root);
      }
    })();

    return () => {
      dispatch(emptyCurrentRole());
      dispatch(emptyCurrentSite());
    };
  }, [dispatch, enqueueSnackbar, id, isDuplicate, isEdit, navigate, siteId]);

  return (
    <Page title={`Role Settings: ${currentRole ? 'Edit Role' : 'Create Role'}`}>
      <Container maxWidth={false}>
        <RoleForm isEdit={isEdit} />
      </Container>
    </Page>
  );
}
