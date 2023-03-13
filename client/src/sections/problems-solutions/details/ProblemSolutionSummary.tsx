import { Box, Card, Divider, Grid, Link, Stack, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import parse from 'html-react-parser';
import { useNavigate } from 'react-router-dom';
import { ProblemSolution } from '../../../@types/problemSolution';
import Iconify from '../../../components/Iconify';
import Label from '../../../components/Label';
import { PS_PROCESS_STATUS_APPROVED, PS_PROCESS_STATUS_COMPLETED, PS_PROCESS_STATUS_WAITING } from '../../../constants';
import { fPsProcessStatusText } from '../../../utils/textHelper';
import { fDate } from '../../../utils/formatTime';
import { getFileUrl } from '../../../utils/imageHelper';

const RootStyle = styled('div')(({ theme }) => ({
  // padding: theme.spacing(3),
  // [theme.breakpoints.up(1368)]: {
  //   padding: theme.spacing(5, 8),
  // },
}));

type Props = {
  problemSolution: ProblemSolution;
};

export default function ProblemSolutionSummary({ problemSolution, ...other }: Props) {
  const theme = useTheme();

  const navigate = useNavigate();

  const { name, status, date, startDate, endDate, remark, tasks, headProjectUser, approvedByUser, oee } =
    problemSolution;

  return (
    <RootStyle {...other}>
      <Box sx={{ mb: theme.spacing(3), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">{name}</Typography>

        <Label
          variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
          color={
            (status === PS_PROCESS_STATUS_APPROVED && 'success') ||
            (status === PS_PROCESS_STATUS_COMPLETED && 'warning') ||
            (status === PS_PROCESS_STATUS_WAITING && 'info') ||
            'default'
          }
          sx={{ textTransform: 'uppercase' }}
        >
          {fPsProcessStatusText(status)}
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
              Project Head
            </Typography>
            <Typography variant="body2">
              {headProjectUser ? `${headProjectUser.firstName} ${headProjectUser.lastName}` : '-'}
            </Typography>
          </Grid>

          {approvedByUser && (
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.disabled' }}>
                Approved By
              </Typography>
              <Typography variant="body2">
                {approvedByUser ? `${approvedByUser.firstName} ${approvedByUser.lastName}` : '-'}
              </Typography>
            </Grid>
          )}

          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.disabled' }}>
              Production
            </Typography>
            <Typography variant="body2">{oee ? `${oee.productionName}` : '-'}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.disabled' }}>
              Remark
            </Typography>
            {parse(remark)}
          </Grid>
        </Grid>
      </Card>

      {(tasks || []).length > 0 && (
        <Card sx={{ px: theme.spacing(2), py: theme.spacing(3), mb: theme.spacing(3) }}>
          <Typography variant="h5" paragraph>
            Tasks
          </Typography>

          <Stack spacing={theme.spacing(3)} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
            {tasks.map((item) => (
              <Box key={item.id}>
                <Box
                  sx={{ mb: theme.spacing(2), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="h6">{item.title}</Typography>

                  <Label
                    variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                    color={
                      (item.status === 'approved' && 'success') ||
                      (item.status === 'complete' && 'warning') ||
                      (item.status === 'waiting' && 'info') ||
                      'default'
                    }
                    sx={{ textTransform: 'uppercase' }}
                  >
                    {fPsProcessStatusText(item.status)}
                  </Label>
                </Box>

                <Grid container spacing={theme.spacing(3)}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.disabled' }}>
                      Start Date
                    </Typography>
                    <Typography variant="body2">{fDate(item.startDate)}</Typography>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.disabled' }}>
                      End Date
                    </Typography>
                    <Typography variant="body2">{fDate(item.endDate)}</Typography>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.disabled' }}>
                      Assignee
                    </Typography>
                    <Typography variant="body2">
                      {item.assigneeUser ? `${item.assigneeUser.firstName} ${item.assigneeUser.lastName}` : '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.disabled' }}>
                      Comment
                    </Typography>
                    <Typography variant="body2">{item.comment}</Typography>
                  </Grid>

                  {(item.attachments || []).length > 0 && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: theme.spacing(1) }}>
                        {item.attachments.map((item) => (
                          <Label
                            key={item.attachmentId}
                            variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                            color={'default'}
                            sx={{ py: 1.8, fontSize: '0.85rem' }}
                          >
                            <Link
                              href={getFileUrl(item.attachment.fileName)}
                              underline="none"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Iconify icon="eva:attach-fill" fontSize={'1rem'} />
                                {item.attachment.name}
                              </Box>
                            </Link>
                          </Label>
                        ))}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
            ))}
          </Stack>
        </Card>
      )}
    </RootStyle>
  );
}
