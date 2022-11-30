import { Box, IconButton } from '@mui/material';
import Iconify from '../../components/Iconify';
import MenuPopover from '../../components/MenuPopover';

type Props = {
  actions: React.ReactNode;
  open?: HTMLElement | null;
  onClose?: VoidFunction;
  onOpen?: (event: React.MouseEvent<HTMLElement>) => void;
};

export default function DashboardHeaderToolbarMoreMenu({ actions, open, onClose, onOpen }: Props) {
  return (
    <Box>
      <IconButton onClick={onOpen}>
        <Iconify icon={'eva:more-vertical-fill'} width={32} height={32} />
      </IconButton>

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={onClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        arrow="right-top"
        sx={{
          mt: -1,
          '& .MuiMenuItem-root': {
            px: 1,
            typography: 'body2',
            borderRadius: 0.75,
            '& svg': { mr: 2, width: 20, height: 20 },
          },
        }}
      >
        {actions}
      </MenuPopover>
    </Box>
  );
}
