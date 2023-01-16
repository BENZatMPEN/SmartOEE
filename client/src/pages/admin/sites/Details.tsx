import { Card, CardContent, Container } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Page from '../../../components/Page';
import { emptyCurrentSite, getSite } from '../../../redux/actions/adminSiteAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import { PATH_ADMINISTRATOR } from '../../../routes/paths';
import SiteForm from '../../../sections/admin/sites/details/SiteForm';

export default function SiteDetails() {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const { currentSite, error, isLoading } = useSelector((state: RootState) => state.adminSite);

  const { pathname } = useLocation();

  const { id } = useParams();

  const isEdit = pathname.includes('edit');

  const isDuplicate = pathname.includes('duplicate');

  useEffect(() => {
    (async () => {
      if (isEdit || isDuplicate) {
        await dispatch(getSite(Number(id)));
      }
    })();

    return () => {
      dispatch(emptyCurrentSite());
    };
  }, [dispatch, id, isDuplicate, isEdit]);

  useEffect(() => {
    if (error) {
      if (error instanceof AxiosError) {
        if ('statusCode' in error.response?.data && error.response?.data.statusCode === 404) {
          enqueueSnackbar('Not found', { variant: 'error' });
          navigate(PATH_ADMINISTRATOR.sites.root);
        }
      }
    }
  }, [error, enqueueSnackbar, navigate]);

  return (
    <Page title={`Site Settings: ${currentSite ? 'Edit Site' : 'Create Site'}`}>
      <Container maxWidth={false}>
        {isLoading ? (
          <Card>
            <CardContent>Loading...</CardContent>
          </Card>
        ) : (
          <SiteForm isEdit={isEdit} />
        )}
      </Container>
    </Page>
  );
}
