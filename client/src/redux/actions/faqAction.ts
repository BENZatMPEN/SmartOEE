import { EditFaq, Faq, FaqPagedList, FilterFaq } from '../../@types/faq';
import axios from '../../utils/axios';
import faqSlice from '../slices/faqSlice';
import { dispatch } from '../store';

export const { emptyCurrentFaq } = faqSlice.actions;

export function getFaqPagedList(filter: FilterFaq) {
  return async () => {
    dispatch(faqSlice.actions.startLoading());

    try {
      const response = await axios.get<FaqPagedList>(`/faqs`, { params: filter });
      dispatch(faqSlice.actions.getFaqPagedListSuccess(response.data));
    } catch (error) {
      dispatch(faqSlice.actions.hasError(error));
    }
  };
}

export function getFaq(id: number) {
  return async () => {
    dispatch(faqSlice.actions.startLoading());

    try {
      const response = await axios.get<Faq>(`/faqs/${id}`);
      dispatch(faqSlice.actions.getFaqSuccess(response.data));
    } catch (error) {
      dispatch(faqSlice.actions.hasError(error));
    }
  };
}

export function createFaq(dto: EditFaq) {
  return async () => {
    dispatch(faqSlice.actions.startSavingError());

    try {
      const response = await axios.post<Faq>(`/faqs`, dto, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      dispatch(faqSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

export function updateFaq(id: number, dto: EditFaq) {
  return async () => {
    dispatch(faqSlice.actions.startSavingError());

    try {
      const response = await axios.put<Faq>(`/faqs/${id}`, dto, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      dispatch(faqSlice.actions.hasSaveError(error));
      return null;
    }
  };
}

export function deleteFaq(id: number) {
  return async () => {
    dispatch(faqSlice.actions.startLoading());

    try {
      await axios.delete(`/faqs/${id}`);
      dispatch(faqSlice.actions.deleteSuccess());
    } catch (error) {
      dispatch(faqSlice.actions.hasError(error));
    }
  };
}

export function deleteFaqs(selectedIds: number[]) {
  return async () => {
    dispatch(faqSlice.actions.startLoading());

    try {
      await axios.delete(`/faqs`, {
        params: { ids: selectedIds },
      });
      dispatch(faqSlice.actions.deleteSuccess());
    } catch (error) {
      dispatch(faqSlice.actions.hasError(error));
    }
  };
}
