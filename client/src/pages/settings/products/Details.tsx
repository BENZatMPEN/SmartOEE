import { Container } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Product } from '../../../@types/product';
import Page from '../../../components/Page';
import { PATH_SETTINGS } from '../../../routes/paths';
import ProductForm from '../../../sections/settings/products/details/ProductForm';
import axios from '../../../utils/axios';

export default function ProductDetails() {
  const { pathname } = useLocation();

  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = pathname.includes('edit');

  const isDuplicate = pathname.includes('duplicate');

  const [model, setModel] = useState<Product | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (isEdit || isDuplicate) {
          const response = await axios.get<Product>(`/products/${id}`);
          const product = response.data;
          setModel(product);
        }
      } catch (error) {
        console.log(error);
        if (error.statusCode === 404) {
          navigate(PATH_SETTINGS.products.root);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Page title={model ? 'Product Settings: Edit Product' : 'Product Settings: Create Product'}>
      <Container maxWidth={false}>
        <ProductForm isEdit={isEdit} currentProduct={model} />
      </Container>
    </Page>
  );
}
