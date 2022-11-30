import { Card, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { fNumber } from '../../utils/formatNumber';

const RootStyle = styled(Card)(({ theme }) => ({
  display: 'flex',
  position: 'relative',
  justifyContent: 'space-between',
  alignItems: 'end',
  padding: theme.spacing(3),
}));

type Props = {
  title: string;
  total: number;
  color?: string;
};

export default function DashboardHeaderWidget({ title, total, color = '#ffffff' }: Props) {
  return (
    <RootStyle
      sx={{
        bgcolor: color,
        color: 'common.white',
      }}
    >
      <Typography variant="h6" sx={{ lineHeight: 1 }}>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ lineHeight: 1 }}>
        {fNumber(total)}
      </Typography>
    </RootStyle>
  );
}
