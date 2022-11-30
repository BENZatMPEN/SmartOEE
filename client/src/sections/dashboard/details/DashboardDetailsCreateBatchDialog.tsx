import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { LoadingButton } from '@mui/lab';
import { Box, Dialog, Grid, MenuItem, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { Oee } from '../../../@types/oee';
import { OeeBatch } from '../../../@types/oeeBatch';
import { Product } from '../../../@types/product';
import { FormProvider, RHFSelect, RHFTextField } from '../../../components/hook-form';
import { RHFDateTimePicker } from '../../../components/hook-form/RHFDateTimePicker';
import Iconify from '../../../components/Iconify';
import { newBatch } from '../../../redux/actions/oeeBatchAction';
import { useDispatch } from '../../../redux/store';
import axios from '../../../utils/axios';

export type FormValuesProps = {
  startDate: Date;
  endDate: Date;
  productId: number;
  oeeId: number;
  plannedQuantity: number;
  lotNumber: string;
};

type Props = {
  open: boolean;
  onClose: VoidFunction;
  oee: Oee;
};

export default function DashboardDetailsCreateBatchDialog({ open, onClose, oee }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const dispatch = useDispatch();

  const NewOeeBatchSchema = Yup.object().shape({
    productId: Yup.number().min(0),
    plannedQuantity: Yup.number().min(1),
  });

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewOeeBatchSchema),
    defaultValues: {
      oeeId: oee.id,
      productId: -1,
      plannedQuantity: 0,
      lotNumber: '',
      startDate: dayjs().startOf('day').toDate(),
      endDate: dayjs().endOf('day').toDate(),
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const [products, setProducts] = useState<Product[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);

    (async () => {
      try {
        const response = await axios.get<Product[]>(`/oees/${oee.id}/products`);
        setProducts(response.data);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    })();

    return () => {
      setProducts([]);
      setIsLoading(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: FormValuesProps) => {
    data.startDate = dayjs(data.startDate).second(0).toDate();
    data.endDate = dayjs(data.endDate).second(0).toDate();

    try {
      const response = await axios.post<OeeBatch>(`/oee-batches`, data, {
        params: {
          oeeId: oee.id,
        },
      });

      enqueueSnackbar('Create success!');
      dispatch(newBatch(response.data));
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack sx={{ p: 3 }} spacing={3}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Create New Batch</Typography>

            <LoadingButton
              type="submit"
              size="small"
              variant="outlined"
              loading={isSubmitting}
              startIcon={<Iconify icon="eva:save-fill" />}
              sx={{ alignSelf: 'flex-end' }}
            >
              Save
            </LoadingButton>
          </Stack>

          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <RHFSelect name="productId" type="number" label="Product" size="small" SelectProps={{ native: false }}>
                  <MenuItem
                    value="-1"
                    sx={{
                      mx: 1,
                      my: 0.5,
                      borderRadius: 0.75,
                      typography: 'body2',
                    }}
                  >
                    Please select
                  </MenuItem>

                  {products.map((product) => (
                    <MenuItem
                      key={product.id}
                      value={product.id}
                      sx={{
                        mx: 1,
                        my: 0.5,
                        borderRadius: 0.75,
                        typography: 'body2',
                      }}
                    >
                      {product.name}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              <Grid item xs={12} md={6}>
                <RHFTextField
                  type="number"
                  name="plannedQuantity"
                  size="small"
                  label="Planned Quantity"
                  onFocus={(event) => {
                    event.target.select();
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <RHFTextField
                  type="text"
                  name="lotNumber"
                  size="small"
                  label="Lot Number"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>

          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <RHFDateTimePicker name="startDate" size="small" label="Start Date" />
              </Grid>

              <Grid item xs={12} md={6}>
                <RHFDateTimePicker name="endDate" size="small" label="End Date" />
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </FormProvider>
    </Dialog>
  );
}
