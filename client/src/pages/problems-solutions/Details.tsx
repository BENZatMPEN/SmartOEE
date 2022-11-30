import { Box, Container, Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProblemSolution } from '../../@types/problemSolution';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import Page from '../../components/Page';
import { PATH_PROBLEMS_SOLUTIONS } from '../../routes/paths';
import ProblemSolutionCarousel from '../../sections/problems-solutions/details/ProblemSolutionCarousel';
import ProblemSolutionSummary from '../../sections/problems-solutions/details/ProblemSolutionSummary';
import axios from '../../utils/axios';

export default function ProblemSolutionDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [model, setModel] = useState<ProblemSolution | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get<ProblemSolution>(`/problems-solutions/${id}`);
        setModel(response.data);
      } catch (error) {
        console.log(error);
        if (error.statusCode === 404) {
          navigate(PATH_PROBLEMS_SOLUTIONS.root);
        }
      }
    })();
  }, []);

  const getImageUrls = (groupName: string): string[] => {
    return (model?.attachments || []).filter((item) => item.groupName === groupName).map((item) => item.attachment.url);
  };

  return (
    <Page title="Problems & Solutions">
      <Container maxWidth={false}>
        <HeaderBreadcrumbs
          heading={'Problems & Solutions - ' + model?.name || ''}
          links={[
            { name: 'Home', href: '/' },
            {
              name: 'Problems & Solutions',
              href: PATH_PROBLEMS_SOLUTIONS.root,
            },
            { name: model?.name || '' },
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
            <ProblemSolutionSummary problemSolution={model} />

            <Grid container spacing={3}>
              <Grid item xs={12} lg={6}>
                <ProblemSolutionCarousel title={'Before - Charts'} images={getImageUrls('beforeProjectChartImages')} />
              </Grid>

              <Grid item xs={12} lg={6}>
                <ProblemSolutionCarousel title={'Before - Photos'} images={getImageUrls('beforeProjectImages')} />
              </Grid>

              <Grid item xs={12} lg={6}>
                <ProblemSolutionCarousel title={'After - Charts'} images={getImageUrls('afterProjectChartImages')} />
              </Grid>

              <Grid item xs={12} lg={6}>
                <ProblemSolutionCarousel title={'After - Photos'} images={getImageUrls('afterProjectImages')} />
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>
    </Page>
  );
}
