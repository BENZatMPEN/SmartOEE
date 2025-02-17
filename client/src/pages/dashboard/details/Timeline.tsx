import { Button, Grid, IconButton, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import DashboardTimelineOee from '../../../sections/dashboard/details/timeline/DashboardTimelineOee';
import { useState } from 'react';
import Iconify from 'src/components/Iconify';
import TimelineChart from 'src/sections/dashboard/details/advanced/TimelineChart';
import DashboardTimelineOeeStack from 'src/sections/dashboard/details/timeline/DashboardTimelineOeeStack';
import FormFilter from 'src/sections/dashboard/details/timeline/FormFilter';

export default function Timeline() {
  const [isDetailTimeLine, setIsDetailTimeLine] = useState<string>('timeline');

  const handleClickDetailTimeLine = (event: React.MouseEvent<HTMLElement>, type: string) => {
    if (type !== null) {
      setIsDetailTimeLine(type);
    }
  };

  return (
    <div>
      <Stack direction="row" spacing={4}  >
        <ToggleButtonGroup
          value={isDetailTimeLine}
          exclusive
          onChange={handleClickDetailTimeLine}
          aria-label="text alignment"
          color="primary"
          size='small'
        >
          <ToggleButton value="timeline" aria-label="default">
            <Typography>Timeline</Typography>
          </ToggleButton>
          <ToggleButton value="stack" aria-label="timeline">
            <Typography>Stack</Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      <Stack spacing={2}>
        {isDetailTimeLine === 'timeline' ? (
          <DashboardTimelineOee />
        ) : (
          <div>
            <Grid container justifyContent={'flex-end'}>
              <Grid item xs={12} sm={6} sx={{ marginBottom: 2 }}>
                <FormFilter />
              </Grid>
            </Grid>

            {/* <IconButton onClick={() => handleClickDetailTimeLine()} >
          <Iconify icon="eva:arrow-circle-left-fill" />
        </IconButton> */}
            <DashboardTimelineOeeStack />
          </div>
        )}
      </Stack>
    </div>
  );
}
