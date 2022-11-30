import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Box, Button, DialogActions, Divider, IconButton, MenuItem, Stack, Tooltip } from '@mui/material';
import merge from 'lodash/merge';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { DateRange } from '../../../@types/calendar';
import { Oee } from '../../../@types/oee';
import { Planning } from '../../../@types/planning';
import { Product } from '../../../@types/product';
import { User } from '../../../@types/user';
import { ColorSinglePicker } from '../../../components/color-utils';
import { FormProvider, RHFSelect, RHFSwitch, RHFTextField } from '../../../components/hook-form';
import { RHFDatePicker, RHFDateTimePicker } from '../../../components/hook-form/RHFDateTimePicker';
import Iconify from '../../../components/Iconify';
import axios from '../../../utils/axios';

const COLOR_OPTIONS = [
  '#00AB55', // theme.palette.primary.main,
  '#1890FF', // theme.palette.info.main,
  '#54D62C', // theme.palette.success.main,
  '#FFC107', // theme.palette.warning.main,
  '#FF4842', // theme.palette.error.main
  '#04297A', // theme.palette.info.darker
  '#7A0C2E', // theme.palette.error.darker
];

const getInitialValues = (planning: Planning | null, range: DateRange | null) => {
  const initialEvent = {
    title: '',
    remark: '',
    lotNumber: '',
    oeeId: -1,
    productId: -1,
    userId: -1,
    plannedQuantity: 0,
    color: '#00AB55',
    allDay: false,
    startDate: range ? new Date(range.start) : new Date(),
    endDate: range ? new Date(range.end) : new Date(),
  };

  if (planning) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, oeeId, productId, userId, ...other } = planning;
    return merge({}, initialEvent, other);
  }

  return initialEvent;
};

interface FormValuesProps extends Partial<Planning> {}

type Props = {
  planning: Planning | null;
  range: DateRange | null;
  onCancel: (refresh: boolean) => void;
  onDelete: VoidFunction;
};

export default function PlanningCalendarForm({ planning, range, onDelete, onCancel }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const isEdit = planning !== null && planning.id > 0;

  const EventSchema = Yup.object().shape({
    title: Yup.string().max(255).required('Title is required'),
    plannedQuantity: Yup.number().min(1),
    oeeId: Yup.number().min(1),
    productId: Yup.number().min(1),
    userId: Yup.number().min(1),
    // TODO: validate date range
  });

  const methods = useForm({
    resolver: yupResolver(EventSchema),
    defaultValues: getInitialValues(planning, range),
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const [oees, setOees] = useState<Oee[]>([]);

  const [products, setProducts] = useState<Product[]>([]);

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    (async () => {
      try {
        await getOees();
        await getUsers();

        if (planning) {
          await getProducts(planning.oeeId);

          setValue('oeeId', planning.oeeId);
          setValue('productId', planning.productId);
          setValue('userId', planning.userId);
        }
      } catch (error) {
        console.log(error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planning]);

  const getOees = async () => {
    try {
      const response = await axios.get<Oee[]>('/oees/all');
      const { data: oees } = response;
      setOees(oees);
      setProducts([]);
    } catch (error) {
      console.log(error);
    }
  };

  const getProducts = async (oeeId: number) => {
    try {
      const response = await axios.get<Product[]>(`/oees/${oeeId}/products`);
      setProducts(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getUsers = async () => {
    try {
      const response = await axios.get<User[]>('/users/all');
      setUsers(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleOeeChanged = async (oeeId: number) => {
    setValue('oeeId', oeeId);
    setValue('productId', -1);
    await getProducts(oeeId);
  };

  const onSubmit = async (data: FormValuesProps) => {
    try {
      const { id, ...dto } = data;
      if (isEdit) {
        await axios.put<Planning>(`/plannings/${planning.id}`, {
          ...dto,
          id,
        });
        enqueueSnackbar('Update success!');
      } else {
        await axios.post<Planning>(`/plannings`, dto);
        enqueueSnackbar('Create success!');
      }

      onCancel(true);
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    onDelete();
    onCancel(false);
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3} sx={{ p: 3 }}>
        <RHFTextField name="title" label="Title" size="small" InputLabelProps={{ shrink: true }} />

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
              {oee.productionName}
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
              {product.name}
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

        <RHFSwitch name="allDay" label="All day" />

        {values.allDay ? (
          <>
            <RHFDatePicker name="startDate" label="Start Date" size="small" />

            <RHFDatePicker name="endDate" label="End Date" size="small" />
          </>
        ) : (
          <>
            <RHFDateTimePicker name="startDate" label="Start Date" size="small" />

            <RHFDateTimePicker name="endDate" label="End Date" size="small" />
          </>
        )}

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

        <Button variant="outlined" color="inherit" onClick={() => onCancel(false)}>
          Cancel
        </Button>

        <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
          {isEdit ? 'Save' : 'Add'}
        </LoadingButton>
      </DialogActions>
    </FormProvider>
  );
}
