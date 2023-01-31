import { Button, DialogActions, Stack } from '@mui/material';
import { useRef } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { LoadingButton } from '@mui/lab';
import axios from '../../../utils/axios';
import { saveAs } from 'file-saver';
import { useForm } from 'react-hook-form';
import { FilterPlanning } from '../../../@types/planning';
import { FormProvider } from '../../../components/hook-form';
import { RHFDatePicker } from '../../../components/hook-form/RHFDateTimePicker';
import dayjs from 'dayjs';

interface Props {
  keepMounted: boolean;
  open: boolean;
  onClose: () => void;
}

const PlanningCalendarExportDialog = ({ open, onClose }: Props) => {
  const methods = useForm<FilterPlanning>({
    defaultValues: {
      start: dayjs().add(-5, 'd').toDate(),
      end: new Date(),
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const radioGroupRef = useRef<HTMLElement>(null);

  const handleEntering = () => {
    if (radioGroupRef.current != null) {
      radioGroupRef.current.focus();
    }
  };

  const onSubmit = async (data: FilterPlanning) => {
    const response = await axios({
      url: `/plannings/export-excel`,
      method: 'GET',
      params: data,
      responseType: 'blob',
    });

    saveAs(new Blob([response.data]), `plannings.xlsx`);
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog maxWidth="xs" TransitionProps={{ onEntering: handleEntering }} open={open}>
      <DialogTitle>Export Planning</DialogTitle>
      <DialogContent dividers>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack alignContent="center" spacing={2} direction="row">
            <RHFDatePicker name="start" label="Start Date" size="small" />

            <RHFDatePicker name="end" label="End Date" size="small" />

            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              Export
            </LoadingButton>
          </Stack>
        </FormProvider>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleCancel}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlanningCalendarExportDialog;
