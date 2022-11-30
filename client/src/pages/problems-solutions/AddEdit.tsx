import { Container } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ProblemSolution } from '../../@types/problemSolution';
import Page from '../../components/Page';
import { PATH_PROBLEMS_SOLUTIONS } from '../../routes/paths';
import ProblemSolutionForm from '../../sections/problems-solutions/addEdit/ProblemSolutionForm';
import axios from '../../utils/axios';

export default function ProblemSolutionAddEdit() {
  const { pathname } = useLocation();

  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = pathname.includes('edit');

  const isDuplicate = pathname.includes('duplicate');

  const [model, setModel] = useState<ProblemSolution | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (isEdit || isDuplicate) {
          const response = await axios.get<ProblemSolution>(`/problems-solutions/${id}`);
          const problemSolution = response.data;
          if (isDuplicate) {
            problemSolution.attachments = [];
          }
          setModel(problemSolution);
        }
      } catch (error) {
        console.log(error);
        if (error.statusCode === 404) {
          navigate(PATH_PROBLEMS_SOLUTIONS.root);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Page
      title={
        model ? 'Problems & Solutions: Edit Problems & Solutions' : 'Problems & Solutions: Create Problems & Solutions'
      }
    >
      <Container maxWidth={false}>
        <ProblemSolutionForm isEdit={isEdit} currentProblemSolution={model} />
      </Container>
    </Page>
  );
}
