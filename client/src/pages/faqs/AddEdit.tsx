import { Container } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Faq } from '../../@types/faq';
import Page from '../../components/Page';
import { PATH_FAQS } from '../../routes/paths';
import FaqForm from '../../sections/faqs/addEdit/FaqForm';
import axios from '../../utils/axios';

export default function FaqAddEdit() {
  const { pathname } = useLocation();

  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = pathname.includes('edit');

  const isDuplicate = pathname.includes('duplicate');

  const [model, setModel] = useState<Faq | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (isEdit || isDuplicate) {
          const response = await axios.get<Faq>(`/faqs/${id}`);
          const faq = response.data;
          if (isDuplicate) {
            faq.attachments = [];
          }
          setModel(faq);
        }
      } catch (error) {
        console.log(error);
        if (error.statusCode === 404) {
          navigate(PATH_FAQS.root);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Page
      title={model ? 'Knowledge and FAQs: Edit Knowledge and FAQs' : 'Knowledge and FAQs: Create Knowledge and FAQs'}
    >
      <Container maxWidth={false}>
        <FaqForm isEdit={isEdit} currentFaq={model} />
      </Container>
    </Page>
  );
}
