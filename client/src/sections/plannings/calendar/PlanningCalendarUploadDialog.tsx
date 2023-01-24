import { Button, DialogActions, Stack } from '@mui/material';
import { useRef } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { FormProvider } from '../../../components/hook-form';
import { useForm } from 'react-hook-form';
import { LoadingButton } from '@mui/lab';
import axios from '../../../utils/axios';
import { useSnackbar } from 'notistack';

interface PlanningCalendarUploadProps {
  keepMounted: boolean;
  open: boolean;
  onClose: (success?: boolean) => void;
}

const PlanningCalendarUploadDialog = (props: PlanningCalendarUploadProps) => {
  const { enqueueSnackbar } = useSnackbar();

  const { onClose, open } = props;

  const methods = useForm<{ files: FileList }>();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: { files: FileList }) => {
    if (data && data.files.length >= 0) {
      try {
        await axios.post(
          `/plannings/import-excel`,
          { file: data.files[0] },
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        onClose(true);
      } catch (error) {
        enqueueSnackbar('Error while uploading');
      }
    }
  };

  const radioGroupRef = useRef<HTMLElement>(null);

  const handleEntering = () => {
    if (radioGroupRef.current != null) {
      radioGroupRef.current.focus();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog maxWidth="xs" TransitionProps={{ onEntering: handleEntering }} open={open}>
      <DialogTitle>Upload Planning</DialogTitle>
      <DialogContent dividers>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack alignContent="center" spacing={2} direction="row">
            <Button variant="outlined" component="label">
              Select File
              <input
                {...register('files')}
                hidden
                accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                type="file"
              />
            </Button>

            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              Upload
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

export default PlanningCalendarUploadDialog;
