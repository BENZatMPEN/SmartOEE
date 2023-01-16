import { Card, CardContent, Container } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Page from '../../components/Page';
import { emptyCurrentFaq, getFaq } from '../../redux/actions/faqAction';
import { RootState, useDispatch, useSelector } from '../../redux/store';
import { PATH_SETTINGS } from '../../routes/paths';
import FaqForm from '../../sections/faqs/addEdit/FaqForm';

export default function FaqAddEdit() {
  const dispatch = useDispatch();

  const { enqueueSnackbar } = useSnackbar();

  const { currentFaq, error, isLoading } = useSelector((state: RootState) => state.faq);

  const { pathname } = useLocation();

  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = pathname.includes('edit');

  const isDuplicate = pathname.includes('duplicate');

  useEffect(() => {
    (async () => {
      if (isEdit || isDuplicate) {
        await dispatch(getFaq(Number(id)));
      }
    })();

    return () => {
      dispatch(emptyCurrentFaq());
    };
  }, [dispatch, id, isDuplicate, isEdit]);

  useEffect(() => {
    if (error) {
      if (error instanceof AxiosError) {
        if ('statusCode' in error.response?.data && error.response?.data.statusCode === 404) {
          enqueueSnackbar('Not found', { variant: 'error' });
          navigate(PATH_SETTINGS.products.root);
        }
      }
    }
  }, [error, enqueueSnackbar, navigate]);

  return (
    <Page title={`Knowledge and FAQs: ${currentFaq ? 'Edit Knowledge and FAQs' : 'Create Knowledge and FAQs'}`}>
      <Container maxWidth={false}>
        {isLoading ? (
          <Card>
            <CardContent>Loading...</CardContent>
          </Card>
        ) : (
          <FaqForm isEdit={isEdit} />
        )}
      </Container>
    </Page>
  );
}
