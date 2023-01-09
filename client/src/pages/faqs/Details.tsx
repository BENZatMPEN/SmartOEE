import { Box, Button, Container, Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { Faq } from '../../@types/faq';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import Iconify from '../../components/Iconify';
import Page from '../../components/Page';
import { PATH_FAQS, PATH_PROBLEMS_SOLUTIONS } from '../../routes/paths';
import FaqAttachments from '../../sections/faqs/details/FaqAttachments';
import FaqCarousel from '../../sections/faqs/details/FaqCarousel';
import FaqSummary from '../../sections/faqs/details/FaqSummary';
import axios from '../../utils/axios';
import { getFileUrl } from '../../utils/imageHelper';

export default function FaqDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [model, setModel] = useState<Faq | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get<Faq>(`/faqs/${id}`);
        setModel(response.data);
      } catch (error) {
        console.log(error);
        if (error.statusCode === 404) {
          navigate(PATH_FAQS.root);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getImageUrls = (groupName: string): string[] => {
    return (model?.attachments || [])
      .filter((item) => item.groupName === groupName)
      .map((item) => getFileUrl(item.attachment.fileName) || '');
  };

  return (
    <Page title="Knowledge & FAQs">
      <Container maxWidth={false}>
        <HeaderBreadcrumbs
          heading={'Knowledge & FAQs - ' + model?.topic || ''}
          links={[
            { name: 'Home', href: '/' },
            {
              name: 'Knowledge & FAQs',
              href: PATH_FAQS.root,
            },
            { name: model?.topic || '' },
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

        {model && (
          <Box>
            <FaqSummary faq={model} />

            <Grid container spacing={3}>
              <Grid item xs={12} lg={6}>
                <FaqCarousel title={'Photos'} images={getImageUrls('images')} />
              </Grid>

              <Grid item xs={12} lg={6}>
                <FaqAttachments faq={model} />
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>
    </Page>
  );
}
