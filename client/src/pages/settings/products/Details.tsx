import { Container } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Page from '../../../components/Page';
import { emptyCurrentProduct, getProduct } from '../../../redux/actions/productAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import { PATH_SETTINGS } from '../../../routes/paths';
import ProductForm from '../../../sections/settings/products/details/ProductForm';

export default function ProductDetails() {
  const dispatch = useDispatch();

  const { enqueueSnackbar } = useSnackbar();

  const { currentProduct, error } = useSelector((state: RootState) => state.product);

  const { pathname } = useLocation();

  const { id } = useParams();

  const navigate = useNavigate();

  const isEdit = pathname.includes('edit');

  const isDuplicate = pathname.includes('duplicate');

  useEffect(() => {
    (async () => {
      if (isEdit || isDuplicate) {
        await dispatch(getProduct(Number(id)));
      }
    })();

    return () => {
      dispatch(emptyCurrentProduct());
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
    <Page title={currentProduct ? 'Product Settings: Edit Product' : 'Product Settings: Create Product'}>
      <Container maxWidth={false}>
        <ProductForm isEdit={isEdit} />
      </Container>
    </Page>
  );
}
