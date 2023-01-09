import { Container } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Page from '../../../components/Page';
import { emptyCurrentSite, getSite } from '../../../redux/actions/siteAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import { PATH_ADMINISTRATOR } from '../../../routes/paths';
import SiteForm from '../../../sections/admin/sites/details/SiteForm';

export default function SiteDetails() {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const { currentSite } = useSelector((state: RootState) => state.site);

  const { pathname } = useLocation();

  const { id } = useParams();

  const isEdit = pathname.includes('edit');

  const isDuplicate = pathname.includes('duplicate');

  useEffect(() => {
    (async () => {
      try {
        if (isEdit || isDuplicate) {
          await dispatch(getSite(Number(id)));
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          if ('statusCode' in error.response?.data && error.response?.data.statusCode === 404) {
            enqueueSnackbar('Not found.', { variant: 'error' });
          } else {
            enqueueSnackbar(error.response?.data.error, { variant: 'error' });
          }
        }

        navigate(PATH_ADMINISTRATOR.sites.root);
      }
    })();

    return () => {
      dispatch(emptyCurrentSite());
    };
  }, [dispatch, enqueueSnackbar, id, isDuplicate, isEdit, navigate]);

  return (
    <Page title={`Site Settings: ${currentSite ? 'Edit Site' : 'Create Site'}`}>
      <Container maxWidth={false}>
        <SiteForm isEdit={isEdit} />
      </Container>
    </Page>
  );
}
