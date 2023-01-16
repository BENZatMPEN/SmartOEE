import { Card, CardContent, Container } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Page from '../../components/Page';
import { emptyCurrentProblemSolution, getProblemSolution } from '../../redux/actions/problemSolutionAction';
import { RootState, useDispatch, useSelector } from '../../redux/store';
import { PATH_SETTINGS } from '../../routes/paths';
import ProblemSolutionForm from '../../sections/problems-solutions/addEdit/ProblemSolutionForm';

export default function ProblemSolutionAddEdit() {
  const dispatch = useDispatch();

  const { enqueueSnackbar } = useSnackbar();

  const { currentProblemSolution, error, isLoading } = useSelector((state: RootState) => state.problemSolution);

  const { pathname } = useLocation();

  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = pathname.includes('edit');

  const isDuplicate = pathname.includes('duplicate');

  useEffect(() => {
    (async () => {
      if (isEdit || isDuplicate) {
        await dispatch(getProblemSolution(Number(id)));
      }
    })();

    return () => {
      dispatch(emptyCurrentProblemSolution());
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
    <Page
      title={`Problems & Solutions: ${
        currentProblemSolution ? 'Edit Problems & Solutions' : 'Create Problems & Solutions'
      }`}
    >
      <Container maxWidth={false}>
        {isLoading ? (
          <Card>
            <CardContent>Loading...</CardContent>
          </Card>
        ) : (
          <ProblemSolutionForm isEdit={isEdit} />
        )}
      </Container>
    </Page>
  );
}
