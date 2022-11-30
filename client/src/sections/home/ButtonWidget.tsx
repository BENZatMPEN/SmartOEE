// @mui
import { Card, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
// components
import Iconify from '../../components/Iconify';
// theme
import { ColorSchema } from '../../theme/palette';

// ----------------------------------------------------------------------

const RootStyle = styled(Card)(({ theme }) => ({
  boxShadow: 'none',
  textAlign: 'center',
  padding: theme.spacing(5, 0),
}));

const IconWrapperStyle = styled('div')(({ theme }) => ({
  margin: 'auto',
  display: 'flex',
  borderRadius: '50%',
  alignItems: 'center',
  width: theme.spacing(8),
  height: theme.spacing(8),
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
}));

// ----------------------------------------------------------------------

type Props = {
  title: string;
  icon: string;
  color?: ColorSchema;
};

export default function ButtonWidget({ title, icon, color = 'primary' }: Props) {
  return (
    <RootStyle
      sx={{
        color: (theme) => theme.palette[color].darker,
        bgcolor: (theme) => theme.palette[color].lighter,
      }}
    >
      {/*<IconWrapperStyle*/}
      {/*  sx={{*/}
      {/*    color: (theme) => theme.palette[color].dark,*/}
      {/*    backgroundImage: (theme) =>*/}
      {/*      `linear-gradient(135deg, ${alpha(theme.palette[color].dark, 0)} 0%, ${alpha(*/}
      {/*        theme.palette[color].dark,*/}
      {/*        0.24,*/}
      {/*      )} 100%)`,*/}
      {/*  }}*/}
      {/*>*/}
      <Iconify icon={icon} width={64} height={64} sx={{ marginBottom: 2 }} />
      {/*</IconWrapperStyle>*/}
      <Typography variant="h5" sx={{ opacity: 0.72 }}>
        {title}
      </Typography>
    </RootStyle>
  );
}
