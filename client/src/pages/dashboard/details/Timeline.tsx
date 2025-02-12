import { IconButton, Stack } from '@mui/material';
import DashboardTimelineOee from '../../../sections/dashboard/details/timeline/DashboardTimelineOee';
import { useState } from 'react';
import Iconify from 'src/components/Iconify';
import TimelineChart from 'src/sections/dashboard/details/advanced/TimelineChart';

export default function Timeline() {
  const [isDetailTimeLine, setIsDetailTimeLine] = useState<boolean>(false);

  const handleClickDetailTimeLine = () => {
    setIsDetailTimeLine(!isDetailTimeLine);
  };

  return (
    <div>
      
      <Stack spacing={2}>
        {!isDetailTimeLine ? ( <DashboardTimelineOee handleClick={handleClickDetailTimeLine} /> 
      ) :
      <div>
        <IconButton onClick={() => handleClickDetailTimeLine()} >
          <Iconify icon="eva:arrow-circle-left-fill" />
        </IconButton>
        <TimelineChart />
      </div> 
      
      }
      </Stack>
     
    </div>
  );
}
