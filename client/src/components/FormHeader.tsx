import { Box, BoxProps, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { PATH_ADMINISTRATOR } from '../routes/paths';
import Breadcrumbs from './Breadcrumbs';

interface IProps extends BoxProps {
  heading: string;
  breadcrumbs?: ReactNode;
  action?: ReactNode;
  cancel?: ReactNode;
}

export default function FormHeader({ action, cancel, breadcrumbs, heading, sx, ...other }: IProps) {
  return (
    <Box sx={{ mb: 3, ...sx }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" gutterBottom>
            {heading}
          </Typography>
          {breadcrumbs}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
          {cancel && <Box sx={{ flexShrink: 0 }}>{cancel}</Box>}
        </Box>
      </Box>
    </Box>
  );
}
