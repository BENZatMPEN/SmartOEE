import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Button, Grid, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Product } from '../../../../@types/product';
import { EditorLabelStyle } from '../../../../components/EditorLabelStyle';
import FormHeader from '../../../../components/FormHeader';
import { FormProvider, RHFEditor, RHFTextField, RHFUploadSingleFile } from '../../../../components/hook-form';
import Iconify from '../../../../components/Iconify';
import { RootState, useSelector } from '../../../../redux/store';
import { PATH_SETTINGS } from '../../../../routes/paths';
import axios from '../../../../utils/axios';

interface FormValuesProps extends Partial<Product> {
  image: File;
}

type Props = {
  isEdit: boolean;
  currentProduct: Product | null;
};

export default function ProductForm({ isEdit, currentProduct }: Props) {
  const theme = useTheme();

  const navigate = useNavigate();

  const { selectedSite } = useSelector((state: RootState) => state.site);

  const { enqueueSnackbar } = useSnackbar();

  const NewProductSchema = Yup.object().shape({
    sku: Yup.string().required('SKU is required'),
    name: Yup.string().required('Product Name is required'),
  });

  const defaultValues = useMemo(
    () => ({
      sku: currentProduct?.sku || '',
      name: currentProduct?.name || '',
      remark: currentProduct?.remark || '',
      siteId: currentProduct?.siteId || selectedSite?.id,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentProduct],
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewProductSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (isEdit && currentProduct) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentProduct]);

  const onSubmit = async (data: FormValuesProps) => {
    try {
      const { image, ...dto } = data;
      let product: Product;

      if (isEdit && currentProduct) {
        const response = await axios.put<Product>(`/products/${currentProduct.id}`, dto);
        product = response.data;
      } else {
        const response = await axios.post<Product>(`/products`, dto);
        product = response.data;
      }

      if (image) {
        await axios.post(
          `/products/${product.id}/upload`,
          { image },
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
      console.error(error);
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
              currentFile={currentProduct?.imageUrl}
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
