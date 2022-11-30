import { Button, Dialog, Divider, ListItemButton, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { OeeProduct } from '../../../../@types/oee';
import { Product } from '../../../../@types/product';
import { FormProvider, RHFTextField } from '../../../../components/hook-form';
import Iconify from '../../../../components/Iconify';
import Scrollbar from '../../../../components/Scrollbar';
import axios from '../../../../utils/axios';
import { getTimeUnitText } from '../../../../utils/formatText';
import { OeeFormValuesProps } from './OeeForm';

type FormValuesProps = {
  searchTerm: string;
};

type Props = {
  open: boolean;
  onClose: VoidFunction;
  onSelect: (oeeProduct: OeeProduct) => void;
  editingProduct: OeeProduct | undefined;
  currentOee: OeeFormValuesProps;
};

export default function OeeProductDialog({ open, onClose, editingProduct, currentOee, onSelect }: Props) {
  const methods = useForm<FormValuesProps>({
    defaultValues: {
      searchTerm: '',
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    console.log(data);
  };

  const [selectedProduct, setSelectedProduct] = useState<OeeProduct>({} as OeeProduct);

  const [products, setProducts] = useState<Product[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getProducts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<Product[]>('/products/all');
      setProducts(response.data);
      setIsLoading(false);
    } catch {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (open) {
        reset();

        await getProducts();
        if (editingProduct) {
          setSelectedProduct(editingProduct);
        } else {
          setSelectedProduct({
            standardSpeedSeconds: 0,
            productId: 0,
          });
        }
      }
    })();
  }, [open]);

  const handleSelectOeeProduct = () => {
    if (selectedProduct) {
      onSelect(selectedProduct);
      onClose();
    }
  };

  const handleChangeStandardSpeed = (standardSpeedSeconds: number) => {
    setSelectedProduct({
      ...selectedProduct,
      standardSpeedSeconds: standardSpeedSeconds,
    });
  };

  const handleSelectItem = (product: Product) => {
    setSelectedProduct({
      ...selectedProduct,
      productId: product.id,
      product: product,
    });
  };

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <Stack sx={{ py: 2.5, px: 3 }} spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6"> Select Product </Typography>

          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="eva:plus-fill" />}
            sx={{ alignSelf: 'flex-end' }}
            onClick={handleSelectOeeProduct}
          >
            OK
          </Button>
        </Stack>

        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2} direction="row">
            <RHFTextField name="searchTerm" label="Search" size="small" InputLabelProps={{ shrink: true }} />

            <Button type="submit" variant="text">
              <Iconify icon="eva:search-fill" />
            </Button>
          </Stack>
        </FormProvider>

        <Divider />

        <Stack spacing={2}>
          <TextField
            type="number"
            fullWidth
            label={`Standard speed (${getTimeUnitText(currentOee.timeUnit)})`}
            size="small"
            InputLabelProps={{ shrink: true }}
            value={selectedProduct?.standardSpeedSeconds || 0}
            onChange={(event) => handleChangeStandardSpeed(Number(event.target.value))}
          />

          <Scrollbar sx={{ maxHeight: 400 }}>
            {(products || []).map((product) => (
              <ListItemButton
                key={product.id}
                selected={selectedProduct?.productId === product.id}
                onClick={() => handleSelectItem(product)}
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <Typography variant="subtitle2">{product.name}</Typography>

                <Typography variant="caption" sx={{ color: 'primary.main', my: 0.5, fontWeight: 'fontWeightMedium' }}>
                  {product.sku}
                </Typography>
              </ListItemButton>
            ))}
          </Scrollbar>
        </Stack>
      </Stack>
    </Dialog>
  );
}
