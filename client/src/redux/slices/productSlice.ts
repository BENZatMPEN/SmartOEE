import { createSlice } from '@reduxjs/toolkit';
import { Product, ProductPagedList } from '../../@types/product';

export type ProductState = {
  isLoading: boolean;
  error: any | null;
  pagedList: ProductPagedList;
  currentProduct: Product | null;
  saveError: any | null;
};

const initialState: ProductState = {
  isLoading: false,
  error: null,
  pagedList: {
    list: [],
    count: 0,
  },
  currentProduct: null,
  saveError: null,
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getProductsSuccess(state, action) {
      state.isLoading = false;
      state.pagedList = action.payload;
    },
    startSavingError(state) {
      state.saveError = null;
    },
    hasSaveError(state, action) {
      state.saveError = action.payload;
    },
    emptyCurrentProduct(state) {
      state.currentProduct = null;
    },
    getProductDetailsSuccess(state, action) {
      state.currentProduct = action.payload;
    },
  },
});

export default productSlice;
