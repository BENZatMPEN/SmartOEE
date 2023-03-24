import { Box, Grid, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { RootState, useSelector } from '../../../redux/store';
import { fDateTime } from '../../../utils/formatTime';
import { getColor } from '../../../utils/colorHelper';
import {
  OEE_BATCH_STATUS_BREAKDOWN,
  OEE_BATCH_STATUS_ENDED,
  OEE_BATCH_STATUS_MC_SETUP,
  OEE_BATCH_STATUS_PLANNED,
  OEE_BATCH_STATUS_RUNNING,
  OEE_BATCH_STATUS_STANDBY,
} from '../../../constants';

export default function DashboardDetailsStatus() {
  const theme = useTheme();

  const { currentBatch } = useSelector((state: RootState) => state.oeeBatch);

  const { product, startDate, endDate, status } = currentBatch || {};

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(3) }}>
      <Grid container spacing={theme.spacing(2)}>
        <Grid item xs={12}>
          <Box sx={{ border: '1px solid rgba(0, 0, 0, 0.2)', borderRadius: '6px', p: theme.spacing(1) }}>
            <Typography variant={'h5'} textAlign={'center'}>
              {product ? product.name : 'There is no previous batch'}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: theme.spacing(1) }}>
            <Typography variant={'subtitle1'}>Start:</Typography>
            <Typography variant={'body1'}>{startDate ? fDateTime(startDate) : ''}</Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: theme.spacing(1) }}>
            <Typography variant={'subtitle1'}>End:</Typography>
            <Typography variant={'body1'}>{endDate ? fDateTime(endDate) : ''}</Typography>
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={theme.spacing(2)}>
        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(1) }}>
            <Typography variant={'subtitle1'} sx={{ textAlign: 'center' }}>
              Running
            </Typography>
            <Box
              sx={{
                backgroundColor: status
                  ? status === OEE_BATCH_STATUS_RUNNING
                    ? getColor(status)
                    : 'lightgray'
                  : 'lightgray',
                borderRadius: '6px',
                p: theme.spacing(2),
              }}
            >
              &nbsp;
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(1) }}>
            <Typography variant={'subtitle1'} sx={{ textAlign: 'center' }}>
              Breakdown
            </Typography>
            <Box
              sx={{
                backgroundColor: status
                  ? status === OEE_BATCH_STATUS_BREAKDOWN
                    ? getColor(status)
                    : 'lightgray'
                  : 'lightgray',
                borderRadius: '6px',
                p: theme.spacing(2),
              }}
            >
              &nbsp;
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(1) }}>
            <Typography variant={'subtitle1'} sx={{ textAlign: 'center' }}>
              M/C Setup
            </Typography>
            <Box
              sx={{
                backgroundColor: status
                  ? status === OEE_BATCH_STATUS_MC_SETUP
                    ? getColor(status)
                    : 'lightgray'
                  : 'lightgray',
                borderRadius: '6px',
                p: theme.spacing(2),
              }}
            >
              &nbsp;
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(1) }}>
            <Typography variant={'subtitle1'} sx={{ textAlign: 'center' }}>
              {status ? (status === 'planned' ? 'P/Downtime' : 'Standby') : 'Standby'}
            </Typography>
            <Box
              sx={{
                backgroundColor: status
                  ? status === OEE_BATCH_STATUS_STANDBY ||
                    status === OEE_BATCH_STATUS_PLANNED ||
                    status === OEE_BATCH_STATUS_ENDED
                    ? getColor(
                        status === OEE_BATCH_STATUS_PLANNED ? OEE_BATCH_STATUS_PLANNED : OEE_BATCH_STATUS_STANDBY,
                      )
                    : 'lightgray'
                  : 'lightgray',
                borderRadius: '6px',
                p: theme.spacing(2),
              }}
            >
              &nbsp;
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
