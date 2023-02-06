import * as React from 'react';
import { ReactNode } from 'react';
import Dialog from '@mui/material/Dialog';
import { Button, DialogActions, DialogContent } from '@mui/material';

interface Props {
  details: ReactNode;
  open: boolean;
  onClose: VoidFunction;
}

export function AnalyticChartOEELotDialog({ details, open, onClose }: Props) {
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogContent>{details}</DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
