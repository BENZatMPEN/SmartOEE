import { Card, CardContent, Container } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useContext, useEffect } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import Page from '../../components/Page';
import { emptyCurrentProblemSolution, getProblemSolution } from '../../redux/actions/problemSolutionAction';
import { RootState, useDispatch, useSelector } from '../../redux/store';
import { PATH_PAGES, PATH_SETTINGS } from '../../routes/paths';
import ProblemSolutionForm from '../../sections/problems-solutions/addEdit/ProblemSolutionForm';
import { AbilityContext } from '../../caslContext';
import { RoleAction, RoleSubject } from '../../@types/role';

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

  const ability = useContext(AbilityContext);

  if (!isEdit && !ability.can(RoleAction.Create, RoleSubject.ProblemsAndSolutions)) {
    return <Navigate to={PATH_PAGES.forbidden} />;
  }

  if (isEdit && !ability.can(RoleAction.Update, RoleSubject.ProblemsAndSolutions)) {
    return <Navigate to={PATH_PAGES.forbidden} />;
  }

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
