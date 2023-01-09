import { Box, MenuItem, TextField } from '@mui/material';
import useResponsive from '../../../hooks/useResponsive';
import { selectSite } from '../../../redux/actions/userSiteAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';

export default function SiteSelector() {
  const { userSites, selectedSiteId } = useSelector((state: RootState) => state.userSite);

  const isDesktop = useResponsive('up', 'sm');

  const dispatch = useDispatch();

  const handleChange = (siteId: number) => {
    dispatch(selectSite(siteId));
    window.location.reload();
  };

  return (
    <Box>
      <TextField
        select
        fullWidth
        sx={{ width: isDesktop ? '400px' : '100%' }}
        defaultValue={''}
        value={userSites.length > 0 ? selectedSiteId : ''}
        InputLabelProps={{ shrink: true }}
        SelectProps={{ native: false }}
        onChange={async (event) => {
          handleChange(Number(event.target.value));
        }}
      >
        {userSites.map((site) => (
          <MenuItem
            key={site.id}
            value={site.id}
            sx={{
              mx: 1,
              my: 0.5,
              borderRadius: 0.75,
              typography: 'body1',
            }}
          >
            {site.name}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
}
