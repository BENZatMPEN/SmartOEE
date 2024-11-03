import { Box, Card, CardContent, Grid, MenuItem, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { Machine as MachineType } from '../../../@types/machine';
import { Widget } from '../../../@types/widget';
import { RootState, useSelector } from '../../../redux/store';
import DashboardMachineProcessStatus from '../../../sections/dashboard/details/machine/DashboardMachineProcessStatus';
import DashboardMachineProductStatus from '../../../sections/dashboard/details/machine/DashboardMachineProductStatus';
import DashboardMachineTimeline from '../../../sections/dashboard/details/machine/DashboardMachineTimeline';
import axios from '../../../utils/axios';
import ImageWidget from '../../../components/widget/ImageWidget';

export default function Machine() {
  const { selectedOee } = useSelector((state: RootState) => state.oeeDashboard);

  const [imgWidget, setImgWidget] = useState<Widget | null>(null);
  const [machines, setMachines] = useState<MachineType[]>([]);
  const [selectedMc, setSelectedMc] = useState<MachineType | null>(null);

  useEffect(() => {
    if (!selectedOee) {
      return;
    }

    (async () => {
      const results = await Promise.all(
        (selectedOee.oeeMachines || []).map((machine) => axios.get<MachineType>(`/machines/${machine.machineId}`)),
      );

      const machines = results.map((result) => result.data);
      setMachines(machines);
      setSelectedMc(machines.length > 0 ? machines[0] : null);
    })();
  }, [selectedOee]);

  useEffect(() => {
    if (!selectedMc || selectedMc.widgets.length === 0) {
      setImgWidget(null);
      return;
    }

    setImgWidget(selectedMc.widgets[0]);
  }, [selectedMc]);

  return (
    <Box>
      <Stack spacing={3} direction={'column'}>
        <Card>
          <CardContent>
            <Grid container spacing={3} alignItems="start">
              <Grid item xs={12} md={7}>
                <DashboardMachineProcessStatus />
              </Grid>

              <Grid item xs={12} md={5}>
                {selectedMc && (
                  <Stack spacing={3}>
                    <Stack direction="row" justifyContent="end" spacing={2}>
                      <TextField
                        size="small"
                        select
                        value={selectedMc.id}
                        InputLabelProps={{ shrink: true }}
                        SelectProps={{ native: false }}
                        sx={{ width: '200px' }}
                        onChange={(event) => {
                          setSelectedMc(machines.find((item) => item.id === Number(event.target.value)) || machines[0]);
                          setImgWidget(null);
                        }}
                      >
                        {machines.map((item) => (
                          <MenuItem
                            key={item.id}
                            value={item.id}
                            sx={{
                              mx: 1,
                              my: 0.5,
                              borderRadius: 0.75,
                              typography: 'body2',
                            }}
                          >
                            {item.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Stack>

                    {imgWidget && (
                      <ImageWidget
                        widget={imgWidget}
                        sx={{
                          borderRadius: 1,
                          height: '300px',
                          objectFit: 'contain',
                        }}
                      />
                    )}
                  </Stack>
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
