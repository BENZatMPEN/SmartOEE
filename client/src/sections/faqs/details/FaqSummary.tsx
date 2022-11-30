import { Box, Card, Grid, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import parse from 'html-react-parser';
import { Faq } from '../../../@types/faq';
import Label from '../../../components/Label';
import {
  FAQ_PROCESS_STATUS_APPROVED,
  FAQ_PROCESS_STATUS_COMPLETED,
  FAQ_PROCESS_STATUS_WAITING,
} from '../../../constants';
import { getFaqProcessStatusText } from '../../../utils/formatText';
import { fDate } from '../../../utils/formatTime';

const RootStyle = styled('div')(({ theme }) => ({
  // padding: theme.spacing(3),
  // [theme.breakpoints.up(1368)]: {
  //   padding: theme.spacing(5, 8),
  // },
}));

type Props = {
  faq: Faq;
};

export default function FaqSummary({ faq, ...other }: Props) {
  const theme = useTheme();

  const { id, status, topic, date, startDate, endDate, description, remark, createdByUser, approvedByUser } = faq;
  return (
    <RootStyle {...other}>
      <Box sx={{ mb: theme.spacing(3), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">{topic}</Typography>

        <Label
          variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
          color={
            (status === FAQ_PROCESS_STATUS_APPROVED && 'success') ||
            (status === FAQ_PROCESS_STATUS_COMPLETED && 'warning') ||
            (status === FAQ_PROCESS_STATUS_WAITING && 'info') ||
            'default'
          }
          sx={{ textTransform: 'uppercase' }}
        >
          {getFaqProcessStatusText(status)}
        </Label>
      </Box>

      <Card sx={{ px: theme.spacing(2), py: theme.spacing(3), mb: theme.spacing(3) }}>
        <Grid container spacing={theme.spacing(3)}>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.disabled' }}>
              Date
            </Typography>
            <Typography variant="body2">{fDate(date)}</Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.disabled' }}>
              Start Date
            </Typography>
            <Typography variant="body2">{fDate(startDate)}</Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.disabled' }}>
              End Date
            </Typography>
            <Typography variant="body2">{fDate(endDate)}</Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.disabled' }}>
              Created By
            </Typography>
            <Typography variant="body2">
              {createdByUser ? `${createdByUser.firstName} ${createdByUser.lastName}` : '-'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.disabled' }}>
              Approved By
            </Typography>
            <Typography variant="body2">
              {approvedByUser ? `${approvedByUser.firstName} ${approvedByUser.lastName}` : '-'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.disabled' }}>
              Details
            </Typography>
            <div>{parse(description)}</div>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.disabled' }}>
              Remark
            </Typography>
            <div>{parse(remark)}</div>
          </Grid>
        </Grid>
      </Card>
    </RootStyle>
  );
}
