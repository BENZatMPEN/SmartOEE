import { Card, CardContent, Container } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Page from '../../../components/Page';
import { emptyCurrentOee, getOee } from '../../../redux/actions/oeeAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import { PATH_SETTINGS } from '../../../routes/paths';
import OeeForm from '../../../sections/settings/oee/details/OeeForm';

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
