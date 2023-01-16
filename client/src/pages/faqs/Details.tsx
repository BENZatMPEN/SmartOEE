import { Box, Card, CardContent, Container, Grid } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import Page from '../../components/Page';
import { emptyCurrentFaq, getFaq } from '../../redux/actions/faqAction';
import { RootState, useDispatch, useSelector } from '../../redux/store';
import { PATH_FAQS, PATH_SETTINGS } from '../../routes/paths';
import FaqAttachments from '../../sections/faqs/details/FaqAttachments';
import FaqCarousel from '../../sections/faqs/details/FaqCarousel';
import FaqSummary from '../../sections/faqs/details/FaqSummary';
import { getFileUrl } from '../../utils/imageHelper';

export default function FaqDetails() {
  const dispatch = useDispatch();

  const { enqueueSnackbar } = useSnackbar();

  const { currentFaq, error, isLoading } = useSelector((state: RootState) => state.faq);

  const { id } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      await dispatch(getFaq(Number(id)));
    })();

    return () => {
      dispatch(emptyCurrentFaq());
    };
  }, [dispatch, id]);

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

  const getImageUrls = (groupName: string): string[] => {
    return (currentFaq?.attachments || [])
      .filter((item) => item.groupName === groupName)
      .map((item) => getFileUrl(item.attachment.fileName) || '');
  };

  return (
    <Page title="Knowledge & FAQs">
      <Container maxWidth={false}>
        <HeaderBreadcrumbs
          heading={'Knowledge & FAQs - ' + currentFaq?.topic || ''}
          links={[
            { name: 'Home', href: '/' },
            {
              name: 'Knowledge & FAQs',
              href: PATH_FAQS.root,
            },
            { name: currentFaq?.topic || '' },
          ]}
          // action={
          //   <Button
          //     variant="contained"
          //     startIcon={<Iconify icon="eva:plus-fill" />}
          //     component={RouterLink}
          //     to={PATH_FAQS.item.new}
          //   >
          //     New
          //   </Button>
          // }
        />
        {isLoading ? (
          <Card>
            <CardContent>Loading...</CardContent>
          </Card>
        ) : (
          <>
            {currentFaq && (
              <Box>
                <FaqSummary faq={currentFaq} />

                <Grid container spacing={3}>
                  <Grid item xs={12} lg={6}>
                    <FaqCarousel title={'Photos'} images={getImageUrls('images')} />
                  </Grid>

                  <Grid item xs={12} lg={6}>
                    <FaqAttachments faq={currentFaq} />
                  </Grid>
                </Grid>
              </Box>
            )}
          </>
        )}
      </Container>
    </Page>
  );
}
