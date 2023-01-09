import { Box, Card, Grid, Link, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { Faq, FaqAttachment } from '../../../@types/faq';
import Iconify from '../../../components/Iconify';
import Label from '../../../components/Label';
import { getFileUrl } from '../../../utils/imageHelper';

const RootStyle = styled('div')(({ theme }) => ({
  // padding: theme.spacing(3),
  // [theme.breakpoints.up(1368)]: {
  //   padding: theme.spacing(5, 8),
  // },
}));

type Props = {
  faq: Faq;
};

export default function FaqAttachments({ faq, ...other }: Props) {
  const theme = useTheme();

  const getAttachmentGroup = (groupName: string): FaqAttachment[] => {
    return (faq.attachments || []).filter((item) => item.groupName === groupName);
  };

  return (
    <RootStyle {...other}>
      <Card sx={{ px: theme.spacing(2), py: theme.spacing(3), mb: theme.spacing(3) }}>
        <Typography variant="h5" gutterBottom>
          Attachments
        </Typography>
        {getAttachmentGroup('attachments').length > 0 && (
          <Grid container spacing={theme.spacing(3)}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: theme.spacing(1) }}>
                {getAttachmentGroup('attachments').map((item) => (
                  <Label
                    key={item.attachmentId}
                    variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                    color={'default'}
                    sx={{ py: 1.8, fontSize: '0.85rem' }}
                  >
                    <Link
                      href={`${getFileUrl(item.attachment.fileName)}`}
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
          </Grid>
        )}

        {getAttachmentGroup('attachments').length === 0 && <Typography variant="subtitle2">No attachments</Typography>}
      </Card>
    </RootStyle>
  );
}
