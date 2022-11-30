import { Box, Card, FormControlLabel, Stack, Switch, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { setGanttView } from '../../redux/actions/siteAction';
import { RootState, useDispatch, useSelector } from '../../redux/store';
import { fDate, fTime } from '../../utils/formatTime';
import DashboardHeaderToolbarMoreMenu from './DashboardHeaderToolbarMoreMenu';

export default function DashboardHeaderToolbar() {
  const theme = useTheme();

  const dispatch = useDispatch();

  const { ganttView } = useSelector((state: RootState) => state.site);

  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handViewToggle = () => {
    dispatch(setGanttView(!ganttView));
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%', gap: 1 }}>
      <Box sx={{ flexGrow: 1, height: '100%' }}>
        <Card
          sx={{
            bgcolor: theme.palette.grey['500'],
            color: 'common.white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '100%',
            p: 3,
          }}
        >
          <Typography variant="caption" sx={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1 }}>
            {fDate(time)}
          </Typography>

          <Typography variant="caption" sx={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1 }}>
            {fTime(time)}
          </Typography>
        </Card>
      </Box>

      <DashboardHeaderToolbarMoreMenu
        open={openMenu}
        onOpen={handleOpenMenu}
        onClose={handleCloseMenu}
        actions={
          <Stack spacing={2} sx={{ p: 1 }}>
            <Box>
              <FormControlLabel
                label={'Gantt View'}
                control={
                  <Switch
                    checked={ganttView}
                    onChange={(event) => {
                      handViewToggle();
                      setOpenMenuActions(null);
                    }}
                  />
                }
              />
            </Box>
          </Stack>
        }
      />
    </Box>
  );
}
