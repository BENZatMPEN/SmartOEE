import { Card, CardContent, Container } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useContext, useEffect } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import Page from '../../../components/Page';
import { emptyCurrentOee, getOee } from '../../../redux/actions/oeeAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import { PATH_PAGES, PATH_SETTINGS } from '../../../routes/paths';
import OeeForm from '../../../sections/settings/oee/details/OeeForm';
import { AbilityContext } from '../../../caslContext';
import { RoleAction, RoleSubject } from '../../../@types/role';

export default function OEEDetails() {
  const dispatch = useDispatch();

  const { enqueueSnackbar } = useSnackbar();

  const { currentOee, error, isLoading } = useSelector((state: RootState) => state.oee);

  const { pathname } = useLocation();

  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = pathname.includes('edit');

  const isDuplicate = pathname.includes('duplicate');

  useEffect(() => {
    (async () => {
      if (isEdit || isDuplicate) {
        await dispatch(getOee(Number(id)));
      }
    })();

    return () => {
      dispatch(emptyCurrentOee());
    };
  }, [dispatch, id, isDuplicate, isEdit]);

  useEffect(() => {
    if (error) {
      if (error instanceof AxiosError) {
        if ('statusCode' in error.response?.data && error.response?.data.statusCode === 404) {
          enqueueSnackbar('Not found', { variant: 'error' });
          navigate(PATH_SETTINGS.oees.root);
        }
      }
    }
  }, [error, enqueueSnackbar, navigate]);

  const ability = useContext(AbilityContext);

  if (!isEdit && !ability.can(RoleAction.Create, RoleSubject.OeeSettings)) {
    return <Navigate to={PATH_PAGES.forbidden} />;
  }

  if (isEdit && !ability.can(RoleAction.Update, RoleSubject.OeeSettings)) {
    return <Navigate to={PATH_PAGES.forbidden} />;
  }

  return (
    <Page title={`OEE Settings: ${currentOee ? 'Edit OEE' : 'Create OEE'}`}>
      <Container maxWidth={false}>
        {isLoading ? (
          <Card>
            <CardContent>Loading...</CardContent>
          </Card>
        ) : (
          <OeeForm isEdit={isEdit} />
        )}
      </Container>
    </Page>
  );
}
