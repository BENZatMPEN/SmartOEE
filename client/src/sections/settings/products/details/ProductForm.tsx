import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Button, Grid, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { EditProduct, Product } from '../../../../@types/product';
import { EditorLabelStyle } from '../../../../components/EditorLabelStyle';
import FormHeader from '../../../../components/FormHeader';
import { FormProvider, RHFEditor, RHFTextField, RHFUploadSingleFile } from '../../../../components/hook-form';
import Iconify from '../../../../components/Iconify';
import { RootState, useSelector } from '../../../../redux/store';
import { PATH_SETTINGS } from '../../../../routes/paths';
import axios from '../../../../utils/axios';
import { getFileUrl } from '../../../../utils/imageHelper';

type Props = {
  isEdit: boolean;
  currentProduct: Product | null;
};

export default function ProductForm({ isEdit, currentProduct }: Props) {
  const theme = useTheme();

  const navigate = useNavigate();

  const { selectedSite } = useSelector((state: RootState) => state.userSite);

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
    },
    values: {
      sku: currentProduct?.sku || '',
      name: currentProduct?.name || '',
      remark: currentProduct?.remark || '',
      image: null,
    },
  });

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: EditProduct) => {
    try {
      if (isEdit && currentProduct) {
        await axios.put<Product>(`/products/${currentProduct.id}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        await axios.post<Product>(
          `/products`,
          { ...data, siteId: selectedSite?.id },
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );
      }

      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
      navigate(PATH_SETTINGS.products.root);
    } catch (error) {
      if (error instanceof AxiosError) {
        if ('message' in error.response?.data) {
          if (Array.isArray(error.response?.data.message)) {
            for (const item of error.response?.data.message) {
              enqueueSnackbar(item, { variant: 'error' });
            }
          } else {
            enqueueSnackbar(error.response?.data.message, { variant: 'error' });
          }
          return;
        }
        enqueueSnackbar(error.response?.data.error, { variant: 'error' });
      }
    }
  };

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

      <Stack spacing={theme.spacing(3)}>
        <Grid container spacing={theme.spacing(3)}>
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
            <Grid container spacing={theme.spacing(3)}>
              <Grid item xs={6}>
                <Stack spacing={theme.spacing(3)}>
                  <RHFTextField name="sku" label="SKU Code" />
                </Stack>
              </Grid>

              <Grid item xs={6}>
                <RHFTextField name="name" label="Product Name" />
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
