import {
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import TagReader from '../../../../components/TagReader';
import { RootState, useSelector } from '../../../../redux/store';
import { PATH_SETTINGS } from '../../../../routes/paths';

export default function DeviceSummary() {
  const { currentDevice } = useSelector((state: RootState) => state.device);

  const { name, address, port, deviceId, tags } = currentDevice || {
    name: '',
    address: '',
    port: 0,
    deviceId: 0,
    tags: [],
  };
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" gutterBottom>
          {name}
        </Typography>

        <Breadcrumbs
          links={[
            { name: 'Home', href: '/' },
            {
              name: 'Devices',
              href: PATH_SETTINGS.devices.root,
            },
            {
              name: name,
            },
          ]}
        />
      </Box>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item sm={4}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.disabled' }}>
                Address
              </Typography>
              <Typography variant="body2">{address}</Typography>
            </Grid>

            <Grid item sm={4}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.disabled' }}>
                Port
              </Typography>
              <Typography variant="body2">{port}</Typography>
            </Grid>

            <Grid item sm={4}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.disabled' }}>
                Device ID
              </Typography>
              <Typography variant="body2">{deviceId}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ color: 'text.disabled' }}>
              Tags
            </Typography>

            <TableContainer>
              <Table size={'medium'}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>spLow</TableCell>
                    <TableCell>spHigh</TableCell>
                    <TableCell>Read</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {(tags || []).map((tag, index) => (
                    <TableRow key={tag.id} hover>
                      <TableCell>{tag.name}</TableCell>
                      <TableCell>{tag.spLow}</TableCell>
                      <TableCell>{tag.spHigh}</TableCell>
                      <TableCell>
                        <TagReader tagId={tag.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
