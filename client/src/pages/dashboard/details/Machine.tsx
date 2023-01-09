import { Box, Card, CardContent, Grid, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { Machine as MachineType } from '../../../@types/machine';
import { Widget } from '../../../@types/widget';
import { LoadableWidget } from '../../../components/widget/LoadableWidget';
import { RootState, useSelector } from '../../../redux/store';
import DashboardMachineProcessStatus from '../../../sections/dashboard/details/machine/DashboardMachineProcessStatus';
import DashboardMachineProductStatus from '../../../sections/dashboard/details/machine/DashboardMachineProductStatus';
import DashboardMachineTimeline from '../../../sections/dashboard/details/machine/DashboardMachineTimeline';
import axios from '../../../utils/axios';

export default function Machine() {
  const { currentOee } = useSelector((state: RootState) => state.oee);

  const [imgWidget, setImgWidget] = useState<Widget | null>(null);

  useEffect(() => {
    if (!currentOee) {
      setImgWidget(null);
      return;
    }

    (async () => {
      const oeeMachines = currentOee.oeeMachines || [];
      if (oeeMachines.length > 0) {
        const oeeMachine = oeeMachines[0];
        const response = await axios.get<MachineType>(`/machines/${oeeMachine.machineId}`);
        const { data } = response;

        if (data.widgets.length > 0) {
          setImgWidget(data.widgets[0]);
        }
      }
    })();
    // TODO: there will be multiple machine - use the machine from oeeBatch
  }, [currentOee]);

  return (
    <Box>
      <Stack spacing={3} direction={'column'}>
        <Card>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={7}>
                <DashboardMachineProcessStatus />
              </Grid>

              <Grid item xs={12} md={5}>
                {imgWidget && (
                  <LoadableWidget
                    widget={imgWidget}
                    sx={{
                      borderRadius: 1,
                      height: '250px',
                      objectFit: 'contain',
                    }}
                  />
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box>
          <DashboardMachineProductStatus />
        </Box>

        <Box>
          <DashboardMachineTimeline />
        </Box>
      </Stack>
    </Box>
  );
}
