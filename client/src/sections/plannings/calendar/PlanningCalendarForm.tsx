import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Box, Button, DialogActions, Divider, IconButton, MenuItem, Stack, Tooltip, Autocomplete, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { DateRange } from '../../../@types/calendar';
import { Oee } from '../../../@types/oee';
import { EditPlanning, Planning } from '../../../@types/planning';
import { Product } from '../../../@types/product';
import { User, FilterUser } from '../../../@types/user';
import { ColorSinglePicker } from '../../../components/color-utils';
import { FormProvider, RHFSelect, RHFSwitch, RHFTextField } from '../../../components/hook-form';
import { RHFDatePicker, RHFDateTimePicker } from '../../../components/hook-form/RHFDateTimePicker';
import Iconify from '../../../components/Iconify';
import axios from '../../../utils/axios';
import { createPlanning, updatePlanning } from '../../../redux/actions/calendarAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { getUserPagedList } from '../../../redux/actions/adminUserAction';
import { PLANNING_END_TYPE, PLANNING_START_TYPE } from 'src/constants';

const COLOR_OPTIONS = [
  '#00AB55', // theme.palette.primary.main,
  '#1890FF', // theme.palette.info.main,
  '#54D62C', // theme.palette.success.main,
  '#FFC107', // theme.palette.warning.main,
  '#FF4842', // theme.palette.error.main
  '#04297A', // theme.palette.info.darker
  '#7A0C2E', // theme.palette.error.darker
];

type Props = {
  currentPlanning: Planning | null;
  range: DateRange | null;
  onClose: (refresh: boolean) => void;
  onDelete: VoidFunction;
};

export default function PlanningCalendarForm({ currentPlanning, range, onDelete, onClose }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const dispatch = useDispatch();

  const { saveError, isDuplicate } = useSelector((state: RootState) => state.calendar);

  const isEdit = currentPlanning !== null && !isDuplicate;

  const [oees, setOees] = useState<Oee[]>([]);

  const [products, setProducts] = useState<Product[]>([]);

  const [users, setUsers] = useState<User[]>([]);

  const [formValues, setFormValues] = useState<EditPlanning | undefined>(undefined);

  useEffect(() => {
    (async () => {
      await getOees();
      await getUsers();

      if (currentPlanning) {
        await getProducts(currentPlanning.oeeId);
      }

      setFormValues({
        title: currentPlanning?.title || '',
        remark: currentPlanning?.remark || '',
        lotNumber: currentPlanning?.lotNumber || '',
        oeeId: currentPlanning?.oeeId || -1,
        productId: currentPlanning?.productId || -1,
        userId: currentPlanning?.userId || -1,
        plannedQuantity: currentPlanning?.plannedQuantity || 0,
        color: currentPlanning?.color || '#00AB55',
        startDate: currentPlanning?.startDate || (range ? new Date(range.start) : dayjs().startOf('d').toDate()),
        endDate: currentPlanning?.endDate || (range ? new Date(range.end) : dayjs().endOf('d').toDate()),
        startType: currentPlanning?.startType || '',
        endType: currentPlanning?.endType || '',
        operatorId: currentPlanning?.operatorId || 0
      });
    })();

    return () => {
      setOees([]);
      setProducts([]);
      setUsers([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlanning]);

  const getOees = async () => {
    try {
      const response = await axios.get<Oee[]>('/oees/all');
      const { data: oees } = response;
      setOees(oees);
      setProducts([]);
    } catch (error) {
      setOees([]);
    }
  };

  const getProducts = async (oeeId: number) => {
    try {
      const response = await axios.get<Product[]>(`/oees/${oeeId}/products`);
      setProducts(response.data);
    } catch (error) {
      setProducts([]);
    }
  };

  const getUsers = async () => {
    try {
      const response = await axios.get<User[]>('/users/all');
      setUsers(response.data);
    } catch (error) {
      setUsers([]);
    }
  };

  const EventSchema = Yup.object().shape({
    title: Yup.string().max(255).required('Title is required'),
    plannedQuantity: Yup.number().min(1),
    oeeId: Yup.number().min(1),
    productId: Yup.number().min(1),
    userId: Yup.number().min(1),
    // TODO: validate date range
  });

  const methods = useForm<EditPlanning>({
    resolver: yupResolver(EventSchema),
    defaultValues: {
      title: '',
      remark: '',
      lotNumber: '',
      oeeId: -1,
      productId: -1,
      userId: -1,
      plannedQuantity: 0,
      color: '#00AB55',
      startDate: range ? new Date(range.start) : dayjs().startOf('d').toDate(),
      endDate: range ? new Date(range.end) : dayjs().add(1, 'd').startOf('d').toDate(),
      startType: 'AUTO',
      endType: 'MANUAL',
      operatorId: 0
    },
    values: formValues,
  });

  const {
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const handleOeeChanged = async (oeeId: number) => {
    setValue('oeeId', oeeId);
    setValue('productId', -1);
    await getProducts(oeeId);
  };

  const onSubmit = async (data: EditPlanning) => {
    const planning =
      isEdit && currentPlanning
        ? await dispatch(updatePlanning(currentPlanning.id, data))
        : await dispatch(createPlanning(data));

    if (planning) {
      enqueueSnackbar('Update success!');
      onClose(true);
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

  const handleDelete = async () => {
    onDelete();
    onClose(false);
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3} sx={{ p: 3 }}>
        <RHFTextField name="title" label="Title" size="small" InputLabelProps={{ shrink: true }} />

        <RHFTextField name="lotNumber" label="Lot Number" size="small" InputLabelProps={{ shrink: true }} />

        <RHFTextField name="plannedQuantity" label="Planned Quantity" size="small" InputLabelProps={{ shrink: true }} />

        <RHFSelect
          name="oeeId"
          label="OEE"
          size="small"
          InputLabelProps={{ shrink: true }}
          SelectProps={{ native: false, sx: { textTransform: 'capitalize' } }}
          onChange={(event) => handleOeeChanged(Number(event.target.value))}
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

          {oees.map((oee) => (
            <MenuItem
              key={oee.id}
              value={oee.id}
              sx={{
                mx: 1,
                my: 0.5,
                borderRadius: 0.75,
                typography: 'body2',
                textTransform: 'capitalize',
              }}
            >
              {oee.oeeCode} - {oee.productionName}
            </MenuItem>
          ))}
        </RHFSelect>

        <RHFSelect
          name="productId"
          label="Product"
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

          {products.map((product) => (
            <MenuItem
              key={product.id}
              value={product.id}
              sx={{
                mx: 1,
                my: 0.5,
                borderRadius: 0.75,
                typography: 'body2',
                textTransform: 'capitalize',
              }}
            >
              {product.sku} - {product.name}
            </MenuItem>
          ))}
        </RHFSelect>

        <RHFSelect
          name="userId"
          label="User"
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

        <RHFDateTimePicker key="startDateTimePicker" name="startDate" label="Start Date" size="small" />

        <RHFDateTimePicker key="endDateTimePicker" name="endDate" label="End Date" size="small" />

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
        
        <RHFTextField name="remark" label="Remark" multiline rows={4} size="small" InputLabelProps={{ shrink: true }} />

        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <ColorSinglePicker value={field.value} onChange={field.onChange} colors={COLOR_OPTIONS} />
          )}
        />
      </Stack>

      <DialogActions>
        {isEdit && (
          <Tooltip title="Delete">
            <IconButton size="medium" color="error" onClick={handleDelete}>
              <Iconify icon="eva:trash-2-outline" />
            </IconButton>
          </Tooltip>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Button variant="outlined" color="inherit" onClick={() => onClose(false)}>
          Cancel
        </Button>

        <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
          {isEdit ? 'Save' : 'Add'}
        </LoadingButton>
      </DialogActions>
    </FormProvider>
  );
}
