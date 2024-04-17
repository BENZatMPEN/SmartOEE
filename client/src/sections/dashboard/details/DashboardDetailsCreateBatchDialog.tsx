import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { LoadingButton } from '@mui/lab';
import { Box, Dialog, Grid, MenuItem, Stack, Typography, Divider } from '@mui/material';
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
import { Planning } from '../../../@types/planning';
import { AxiosError } from 'axios';
import { PLANNING_START_TYPE, PLANNING_END_TYPE } from '../../../constants'
import { User } from '../../../@types/user';

interface NewOeeBatch {
  startDate: Date;
  endDate: Date;
  productId: number;
  oeeId: number;
  planningId: number;
  plannedQuantity: number;
  lotNumber: string;
  startType: string;
  endType: string;
  operatorId: number;
}

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

  const methods = useForm<NewOeeBatch>({
    resolver: yupResolver(NewOeeBatchSchema),
    defaultValues: {
      oeeId: oee.id,
      productId: -1,
      planningId: -1,
      plannedQuantity: 0,
      lotNumber: '',
      startDate: dayjs().startOf('day').toDate(),
      endDate: dayjs().endOf('day').toDate(),
      startType: 'AUTO',
      endType: 'MANUAL',
      operatorId: 0
    },
  });

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const [products, setProducts] = useState<Product[]>([]);

  const [plannings, setPlannings] = useState<Planning[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [users, setUsers] = useState<User[]>([]);

  const getProducts = async () => {
    try {
      const response = await axios.get<Product[]>(`/oees/${oee.id}/products`);
      setProducts(response.data);
    } catch {
      setProducts([]);
    }
  };

  const getPlannings = async () => {
    try {
      const response = await axios.get<Planning[]>(`/oees/${oee.id}/plannings`);
      setPlannings(response.data);
    } catch {
      setProducts([]);
    }
  };

  const getUsers = async () => {
    try {
      const response = await axios.get<User[]>(`/users/oee?oeeId=${oee.id}`);
      setUsers(response.data);
    } catch (error) {
      setUsers([]);
    }
  };

  useEffect(() => {
    setIsLoading(true);

    (async () => {
      try {
        await getProducts();
        await getPlannings();
        await getUsers();
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

  const onSubmit = async (data: NewOeeBatch) => {
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
      if (error instanceof AxiosError) {
        enqueueSnackbar(error.response?.data.message || 'An error occurred.', { variant: 'error' });
      }
      console.error(error);
    }
  };

  const handlePlanningChange = (planningId: number): void => {
    if (planningId === -1) {
      setValue('planningId', -1);
      setValue('productId', -1);
      setValue('lotNumber', '');
      setValue('plannedQuantity', 0);
      return;
    }

    const planning = plannings.filter((item) => item.id === planningId)[0];
    setValue('planningId', planning.id);
    setValue('productId', planning.productId);
    setValue('lotNumber', planning.lotNumber);
    setValue('plannedQuantity', planning.plannedQuantity);
    setValue('startDate', dayjs(planning.startDate).toDate());
    setValue('endDate', dayjs(planning.endDate).toDate());
    setValue('startType', planning.startType);
    setValue('endType', planning.endType);
    setValue('operatorId', planning.operatorId);
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
              <Grid item xs={12} sm={6}>
                <RHFSelect
                  name="planningId"
                  type="number"
                  label="Planning"
                  size="small"
                  SelectProps={{ native: false }}
                  onChange={(event) => {
                    handlePlanningChange(Number(event.target.value));
                  }}
                >
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

                  {plannings.map((planning) => (
                    <MenuItem
                      key={planning.id}
                      value={planning.id}
                      sx={{
                        mx: 1,
                        my: 0.5,
                        borderRadius: 0.75,
                        typography: 'body2',
                      }}
                    >
                      {`${planning.lotNumber} - ${dayjs(planning.startDate).format('DD/MM/YYYY HH:mm')} - ${dayjs(
                        planning.startDate,
                      ).format('DD/MM/YYYY HH:mm')}`}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              <Grid item xs={12} sm={6}>
                <RHFSelect
                  name="productId"
                  type="number"
                  label="Product"
                  size="small"
                  SelectProps={{ native: false, disabled: values.planningId > -1 }}
                >
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

              <Grid item xs={12} sm={6}>
                <RHFTextField
                  type="number"
                  name="plannedQuantity"
                  size="small"
                  label="Planned Quantity"
                  disabled={values.planningId > -1}
                  onFocus={(event) => {
                    event.target.select();
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <RHFTextField
                  type="text"
                  name="lotNumber"
                  size="small"
                  label="Lot Number"
                  disabled={values.planningId > -1}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>

          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <RHFDateTimePicker name="startDate" size="small" label="Start Date" />
              </Grid>

              <Grid item xs={12} sm={6}>
                <RHFDateTimePicker name="endDate" size="small" label="End Date" />
              </Grid>
            </Grid>
          </Box>
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <RHFSelect
                  name="startType"
                  label="Auto Start Batch"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{ native: false, sx: { textTransform: 'capitalize' } }}
                >

                  {PLANNING_START_TYPE.map((planStart) => (
                    <MenuItem
                      key={`start-${planStart.key}`}
                      value={planStart.key}
                      sx={{
                        mx: 1,
                        my: 0.5,
                        borderRadius: 0.75,
                        typography: 'body2',
                        textTransform: 'capitalize',
                      }}
                    >
                      {planStart.name}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              <Grid item xs={12} sm={6}>
                <RHFSelect
                  name="endType"
                  label="Auto End Batch(FG)"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{ native: false, sx: { textTransform: 'capitalize' } }}
                >

                  {PLANNING_END_TYPE.map((planEnd) => (
                    <MenuItem
                      key={`end-${planEnd.key}`}
                      value={planEnd.key}
                      sx={{
                        mx: 1,
                        my: 0.5,
                        borderRadius: 0.75,
                        typography: 'body2',
                        textTransform: 'capitalize',
                      }}
                    >
                      {planEnd.name}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>
            </Grid>
          </Box>
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <RHFSelect
                  name="operatorId"
                  label="Operator Name"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{ native: false, sx: { textTransform: 'capitalize' } }}
                >
                  <MenuItem
                    value={-1}
                    sx={{
                      mx: 1,
                      borderRadius: 0.75,
                      typography: 'body2',
                      fontStyle: 'italic',
                      color: 'text.secondary',
                    }}
                  >
                    None
                  </MenuItem>

                  <Divider />

                  {users.map((user) => (
                    <MenuItem
                      key={user.id}
                      value={user.id}
                      sx={{
                        mx: 1,
                        my: 0.5,
                        borderRadius: 0.75,
                        typography: 'body2',
                        textTransform: 'capitalize',
                      }}
                    >
                      {user.firstName} {user.lastName}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </FormProvider>
    </Dialog>
  );
}
