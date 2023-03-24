import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { LoadingButton } from '@mui/lab';
import { Box, Dialog, Grid, Stack, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { OeeBatch } from '../../../@types/oeeBatch';
import { FormProvider, RHFTextField } from '../../../components/hook-form';
import Iconify from '../../../components/Iconify';
import { enableEditBatch } from '../../../redux/actions/oeeBatchAction';
import { useDispatch } from '../../../redux/store';
import axios from '../../../utils/axios';

export type FormValuesProps = {
  reason: string;
};

type Props = {
  open: boolean;
  onClose: VoidFunction;
  oeeBatch: OeeBatch;
};

export default function DashboardDetailsEnableEditingBatchDialog({ open, onClose, oeeBatch }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const dispatch = useDispatch();

  const NewOeeBatchSchema = Yup.object().shape({
    reason: Yup.string().required(),
  });

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewOeeBatchSchema),
    defaultValues: {
      reason: '',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    try {
      await axios.post(`/oee-batches/${oeeBatch.id}/open-edit`, data);

      enqueueSnackbar('Enable editing batch!');
      dispatch(enableEditBatch(true));
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
            <Typography variant="h6">Enable Editing Batch</Typography>

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
              <Grid item xs={12}>
                <RHFTextField
                  type="text"
                  multiline
                  rows={6}
                  name="reason"
                  size="small"
                  label="Reason"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </FormProvider>
    </Dialog>
  );
}
