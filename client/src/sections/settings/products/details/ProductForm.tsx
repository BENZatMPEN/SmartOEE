import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Button, Grid, Stack } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { EditProduct } from '../../../../@types/product';
import { EditorLabelStyle } from '../../../../components/EditorLabelStyle';
import FormHeader from '../../../../components/FormHeader';
import { FormProvider, RHFCheckbox, RHFEditor, RHFTextField, RHFUploadSingleFile } from '../../../../components/hook-form';
import Iconify from '../../../../components/Iconify';
import { createProduct, updateProduct } from '../../../../redux/actions/productAction';
import { RootState, useDispatch, useSelector } from '../../../../redux/store';
import { PATH_SETTINGS } from '../../../../routes/paths';
import { getFileUrl } from '../../../../utils/imageHelper';

type Props = {
  isEdit: boolean;
};

export default function ProductForm({ isEdit }: Props) {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const { currentProduct, saveError } = useSelector((state: RootState) => state.product);

  const { enqueueSnackbar } = useSnackbar();

  const NewProductSchema = Yup.object().shape({
    sku: Yup.string().required('SKU is required'),
    name: Yup.string().required('Product Name is required'),
  });

  const methods = useForm<EditProduct>({
    resolver: yupResolver(NewProductSchema),
    defaultValues: {
      sku: '',
      name: '',
      remark: '',
      image: null,
      activePcs: false,
      secondUnit: '',
      pscGram: 0,
    },
    values: {
      sku: currentProduct?.sku || '',
      name: currentProduct?.name || '',
      remark: currentProduct?.remark || '',
      image: null,
      activePcs: currentProduct?.activePcs || false,
      secondUnit: currentProduct?.secondUnit || '',
      pscGram: currentProduct?.pscGram || 0,
    },
  });

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: EditProduct) => {
    const product =
      isEdit && currentProduct
        ? await dispatch(updateProduct(currentProduct.id, data))
        : await dispatch(createProduct(data));

    if (product) {
      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
      navigate(PATH_SETTINGS.products.root);
    }
  };

  useEffect(() => {
    if (saveError) {
      if (saveError instanceof AxiosError) {
        if ('message' in saveError.response?.data) {
          if (Array.isArray(saveError.response?.data.message)) {
            for (const item of saveError.response?.data.message) {
              enqueueSnackbar(item, { variant: 'error' });
            }
          } else {
            enqueueSnackbar(saveError.response?.data.message, { variant: 'error' });
          }
        }
      } else {
        enqueueSnackbar(saveError.response?.data.error, { variant: 'error' });
      }
    }
  }, [enqueueSnackbar, saveError]);

  const handleDrop = useCallback(
    (acceptedFiles) => {
      setValue(
        'image',
        Object.assign(acceptedFiles[0], {
          preview: URL.createObjectURL(acceptedFiles[0]),
        }),
      );
    },
    [setValue],
  );

  const activePcs = watch('activePcs');
  
  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <FormHeader
        heading={!isEdit ? 'Create Product' : 'Edit Product'}
        action={
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            startIcon={<Iconify icon="eva:save-fill" />}
          >
            {!isEdit ? 'Create' : 'Save'}
          </LoadingButton>
        }
        cancel={
          <Button variant="contained" component={RouterLink} to={PATH_SETTINGS.products.root}>
            Cancel
          </Button>
        }
      />

      <Stack spacing={3}>
        <Grid container spacing={3}>
          <Grid item xs={4}>
            <RHFUploadSingleFile
              name="image"
              accept="image/*"
              maxSize={3145728}
              onDrop={handleDrop}
              currentFile={isEdit ? getFileUrl(currentProduct?.imageName) : ''}
            />
          </Grid>

          <Grid item xs={8}>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Stack spacing={3}>
                  <RHFTextField name="sku" label="SKU Code" />
                </Stack>
              </Grid>

              <Grid item xs={6}>
                <RHFTextField name="name" label="Product Name" />
              </Grid>


              <Grid item xs={6} sx={{ display: 'flex' }}>
                <RHFCheckbox name="activePcs" label="" />
                <RHFTextField name="pscGram" label="1 Pcs" disabled={!activePcs} />
              </Grid>

              <Grid item xs={6} sx={{ display: 'flex' }}>
                <RHFTextField name="secondUnit" label="Second Unit" disabled={!activePcs} />
              </Grid>

              <Grid item xs={12}>
                <EditorLabelStyle>Remark</EditorLabelStyle>
                <RHFEditor simple name="remark" />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Stack>
    </FormProvider>
  );
}
