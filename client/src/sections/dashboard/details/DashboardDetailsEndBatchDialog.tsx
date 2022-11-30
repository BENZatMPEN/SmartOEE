import { Button, Dialog, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Iconify from '../../../components/Iconify';

type Props = {
  open: boolean;
  onClose: (endBatch: boolean) => void;
};

export default function DashboardDetailsEndBatchDialog({ open, onClose }: Props) {
  const theme = useTheme();

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={() => onClose(false)}>
      <Stack textAlign="center" sx={{ p: theme.spacing(3) }} spacing={theme.spacing(3)}>
        <Typography variant="h6">Confirm End Batch</Typography>

        <Stack direction="row" alignItems="center" justifyContent="center" spacing={theme.spacing(3)}>
          <Button
            type="submit"
            variant="contained"
            startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
            sx={{ alignSelf: 'flex-end' }}
            onClick={() => {
              onClose(true);
            }}
          >
            End Batch
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="eva:close-fill" />}
            sx={{ alignSelf: 'flex-end' }}
            onClick={() => {
              onClose(false);
            }}
          >
            No
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  );
}
