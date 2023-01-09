import { Box, Stack } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { ReactNode, useRef } from 'react';
import Iconify from './Iconify';

export interface ConfirmationDialogProps {
  id: string;
  title: string;
  content: ReactNode;
  keepMounted: boolean;
  open: boolean;
  onClose: (value?: boolean) => void;
}

const DeleteConfirmationDialog = (props: ConfirmationDialogProps) => {
  const { onClose, open, title, content, ...other } = props;

  const radioGroupRef = useRef<HTMLElement>(null);

  const handleEntering = () => {
    if (radioGroupRef.current != null) {
      radioGroupRef.current.focus();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleOk = () => {
    onClose(true);
  };

  return (
    <Dialog
      // sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
      maxWidth="xs"
      TransitionProps={{ onEntering: handleEntering }}
      open={open}
      {...other}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack direction="row" gap={3} alignItems="center">
          <Iconify icon={'fa:exclamation-circle'} sx={{ color: 'error.main', width: 35, height: 35 }} />
          <Box>{content}</Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleCancel}>
          Cancel
        </Button>
        <Button color="error" onClick={handleOk}>
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
