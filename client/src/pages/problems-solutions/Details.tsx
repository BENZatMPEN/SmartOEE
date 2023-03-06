import { Box, Card, CardContent, Container, Grid } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useContext, useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import Page from '../../components/Page';
import { emptyCurrentProblemSolution, getProblemSolution } from '../../redux/actions/problemSolutionAction';
import { RootState, useDispatch, useSelector } from '../../redux/store';
import { PATH_PAGES, PATH_PROBLEMS_SOLUTIONS, PATH_SETTINGS } from '../../routes/paths';
import ProblemSolutionCarousel from '../../sections/problems-solutions/details/ProblemSolutionCarousel';
import ProblemSolutionSummary from '../../sections/problems-solutions/details/ProblemSolutionSummary';
import { getFileUrl } from '../../utils/imageHelper';
import { RoleAction, RoleSubject } from '../../@types/role';
import { AbilityContext } from '../../caslContext';

export default function ProblemSolutionDetails() {
  const dispatch = useDispatch();

  const { enqueueSnackbar } = useSnackbar();

  const { currentProblemSolution, error, isLoading } = useSelector((state: RootState) => state.problemSolution);

  const { id } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      await dispatch(getProblemSolution(Number(id)));
    })();

    return () => {
      dispatch(emptyCurrentProblemSolution());
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
    return (currentProblemSolution?.attachments || [])
      .filter((item) => item.groupName === groupName)
      .map((item) => getFileUrl(item.attachment.fileName) || '');
  };

  const ability = useContext(AbilityContext);

  if (!ability.can(RoleAction.Read, RoleSubject.ProblemsAndSolutions)) {
    return <Navigate to={PATH_PAGES.forbidden} />;
  }

  return (
    <Page title="Problems & Solutions">
      <Container maxWidth={false}>
        <HeaderBreadcrumbs
          heading={'Problems & Solutions - ' + currentProblemSolution?.name || ''}
          links={[
            { name: 'Home', href: '/' },
            {
              name: 'Problems & Solutions',
              href: PATH_PROBLEMS_SOLUTIONS.root,
            },
            { name: currentProblemSolution?.name || '' },
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
            {currentProblemSolution && (
              <Box>
                <ProblemSolutionSummary problemSolution={currentProblemSolution} />

                <Grid container spacing={3}>
                  <Grid item xs={12} lg={6}>
                    <ProblemSolutionCarousel
                      title={'Before - Charts'}
                      images={getImageUrls('beforeProjectChartImages')}
                    />
                  </Grid>

                  <Grid item xs={12} lg={6}>
                    <ProblemSolutionCarousel title={'Before - Photos'} images={getImageUrls('beforeProjectImages')} />
                  </Grid>

                  <Grid item xs={12} lg={6}>
                    <ProblemSolutionCarousel
                      title={'After - Charts'}
                      images={getImageUrls('afterProjectChartImages')}
                    />
                  </Grid>

                  <Grid item xs={12} lg={6}>
                    <ProblemSolutionCarousel title={'After - Photos'} images={getImageUrls('afterProjectImages')} />
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
