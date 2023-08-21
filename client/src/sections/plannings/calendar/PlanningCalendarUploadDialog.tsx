import { Alert, AlertTitle, Button, DialogActions, Stack } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { FormProvider } from '../../../components/hook-form';
import { useForm } from 'react-hook-form';
import { LoadingButton } from '@mui/lab';
import axios from '../../../utils/axios';
import { useSnackbar } from 'notistack';
import { ImportPlanningErrorRow, ImportPlanningResult } from '../../../@types/planning';

interface Props {
  keepMounted: boolean;
  open: boolean;
  onClose: (success?: boolean) => void;
}

const PlanningCalendarUploadDialog = ({ onClose, open }: Props) => {
  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<{ files: FileList }>();

  const [invalidRows, setInvalidRows] = useState<ImportPlanningErrorRow[]>([]);

  useEffect(() => {
    if (open) {
      reset();
      setInvalidRows([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const {
    register,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: { files: FileList }) => {
    if (data && data.files.length >= 0) {
      try {
        const response = await axios.post<ImportPlanningResult>(
          `/plannings/import-excel`,
          { file: data.files[0] },
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        if (response.data.success) {
          onClose(true);
        } else {
          setInvalidRows(response.data.invalidRows || []);
        }

        enqueueSnackbar('Upload completed');
      } catch (error) {
        enqueueSnackbar('Error while uploading', { variant: 'error' });
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

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'exists':
        return 'Exists';
      case 'oee':
        return 'No OEE code';
      case 'product':
        return 'No product';
      case 'user':
        return 'No user';
      default:
        return 'Unknown error';
    }
  };

  return (
    <Dialog maxWidth="xs" TransitionProps={{ onEntering: handleEntering }} open={open}>
      <DialogTitle>Upload Planning</DialogTitle>
      <DialogContent dividers>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
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

            {invalidRows.length > 0 ? (
              <Alert severity="error">
                <AlertTitle>There are rows that cannot import:</AlertTitle>
                {invalidRows.map((item) => (
                  <div key={item.row}>
                    {item.row} - {getReasonText(item.reason)}
                  </div>
                ))}
              </Alert>
            ) : (
              <></>
            )}
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
