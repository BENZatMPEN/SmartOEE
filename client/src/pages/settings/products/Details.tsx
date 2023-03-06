import { Card, CardContent, Container } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useContext, useEffect } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import Page from '../../../components/Page';
import { emptyCurrentProduct, getProduct } from '../../../redux/actions/productAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import { PATH_PAGES, PATH_SETTINGS } from '../../../routes/paths';
import ProductForm from '../../../sections/settings/products/details/ProductForm';
import { AbilityContext } from '../../../caslContext';
import { RoleAction, RoleSubject } from '../../../@types/role';

export default function ProductDetails() {
  const dispatch = useDispatch();

  const { enqueueSnackbar } = useSnackbar();

  const { currentProduct, error, isLoading } = useSelector((state: RootState) => state.product);

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

  const ability = useContext(AbilityContext);

  if (!isEdit && !ability.can(RoleAction.Create, RoleSubject.ProductSettings)) {
    return <Navigate to={PATH_PAGES.forbidden} />;
  }

  if (isEdit && !ability.can(RoleAction.Update, RoleSubject.ProductSettings)) {
    return <Navigate to={PATH_PAGES.forbidden} />;
  }

  return (
    <Page title={`Product Settings: ${currentProduct ? 'Edit Product' : 'Create Product'}`}>
      <Container maxWidth={false}>
        {isLoading ? (
          <Card>
            <CardContent>Loading...</CardContent>
          </Card>
        ) : (
          <ProductForm isEdit={isEdit} />
        )}
      </Container>
    </Page>
  );
}
