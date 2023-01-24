import { EditProduct, FilterProduct, Product, ProductPagedList } from '../../@types/product';
import axios from '../../utils/axios';
import productSlice from '../slices/productSlice';
import { dispatch } from '../store';

export const { emptyCurrentProduct } = productSlice.actions;

export function getProductPagedList(filter: FilterProduct) {
  return async () => {
    dispatch(productSlice.actions.startLoading());

    try {
      const response = await axios.get<ProductPagedList>(`/products`, { params: filter });
      dispatch(productSlice.actions.getProductPagedListSuccess(response.data));
    } catch (error) {
      dispatch(productSlice.actions.hasError(error));
    }
  };
}

export function getProduct(id: number) {
  return async () => {
    dispatch(productSlice.actions.startLoading());

    try {
      const response = await axios.get<Product>(`/products/${id}`);
      dispatch(productSlice.actions.getProductSuccess(response.data));
    } catch (error) {
      dispatch(productSlice.actions.hasError(error));
    }
  };
}

export function createProduct(dto: EditProduct) {
  return async () => {
    dispatch(productSlice.actions.startSavingError());

    try {
      const response = await axios.post<Product>(`/products`, dto, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      dispatch(productSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

export function updateProduct(id: number, dto: EditProduct) {
  return async () => {
    dispatch(productSlice.actions.startSavingError());

    try {
      const response = await axios.put<Product>(`/products/${id}`, dto, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      dispatch(productSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

export function deleteProduct(id: number) {
  return async () => {
    dispatch(productSlice.actions.startLoading());

    try {
      await axios.delete(`/products/${id}`);
      dispatch(productSlice.actions.deleteSuccess());
    } catch (error) {
      dispatch(productSlice.actions.hasError(error));
    }
  };
}

export function deleteProducts(selectedIds: number[]) {
  return async () => {
    dispatch(productSlice.actions.startLoading());

    try {
      await axios.delete(`/products`, {
        params: { ids: selectedIds },
      });
      dispatch(productSlice.actions.deleteSuccess());
    } catch (error) {
      dispatch(productSlice.actions.hasError(error));
    }
  };
}
