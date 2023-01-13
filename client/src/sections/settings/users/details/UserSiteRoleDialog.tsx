import { Box, Button, Divider, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import Iconify from '../../../../components/Iconify';
import { emptyRoleOptions, getRoleOptions } from '../../../../redux/actions/roleAction';
// import { emptySiteOptions, getSiteOptions } from '../../../../redux/actions/siteAction';
import { RootState, useDispatch, useSelector } from '../../../../redux/store';

export default function UserSiteRoleList() {
  const dispatch = useDispatch();

  // const { siteOptions } = useSelector((state: RootState) => state.site);

  const { roleOptions } = useSelector((state: RootState) => state.role);

  const [selectedSiteId, setSelectedSiteId] = useState<number>(-1);

  const [selectedRoleId, setSelectedRoleId] = useState<number>(-1);

  const { control, watch } = useFormContext();

  const values = watch();

  const { append, remove } = useFieldArray({
    control,
    name: 'siteRoles',
  });

  useEffect(() => {
    (async () => {
      // await dispatch(getSiteOptions());
    })();

    return () => {
      // dispatch(emptySiteOptions());
      dispatch(emptyRoleOptions());
    };
  }, [dispatch]);

  const handleSelectedSite = async (siteId: number) => {
    setSelectedRoleId(-1);
    await dispatch(getRoleOptions(siteId));
  };

  const handleAdd = () => {
    if (selectedSiteId > -1 && selectedRoleId > -1) {
      append({
        // site: siteOptions.filter((item) => item.id === selectedSiteId)[0],
        role: roleOptions.filter((item) => item.id === selectedRoleId)[0],
      });
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h6" sx={{ color: 'text.disabled' }}>
        Site & Role
      </Typography>

      <Box>
        <Grid container spacing={3}>
          <Grid item sm={6}>
            <TextField
              label="Site"
              defaultValue={-1}
              value={selectedSiteId}
              InputLabelProps={{ shrink: true }}
              SelectProps={{ native: false }}
              select
              fullWidth
              onChange={async (event) => {
                const siteId = Number(event.target.value);
                setSelectedSiteId(siteId);
                await handleSelectedSite(siteId);
              }}
            >
              <MenuItem
                value={-1}
                sx={{
                  mx: 1,
                  borderRadius: 0.75,
                  typography: 'body1',
                  fontStyle: 'italic',
                  color: 'text.secondary',
                }}
              >
                None
              </MenuItem>

              <Divider />

              {/*{(siteOptions || []).map((item) => (*/}
              {/*  <MenuItem*/}
              {/*    key={item.id}*/}
              {/*    value={item.id}*/}
              {/*    sx={{*/}
              {/*      mx: 1,*/}
              {/*      my: 0.5,*/}
              {/*      borderRadius: 0.75,*/}
              {/*      typography: 'body1',*/}
              {/*    }}*/}
              {/*  >*/}
              {/*    {item.name}*/}
              {/*  </MenuItem>*/}
              {/*))}*/}
            </TextField>
          </Grid>

          <Grid item sm={6}>
            <TextField
              label="Role"
              defaultValue={-1}
              value={selectedRoleId}
              InputLabelProps={{ shrink: true }}
              SelectProps={{ native: false }}
              select
              fullWidth
              onChange={(event) => {
                setSelectedRoleId(Number(event.target.value));
              }}
            >
              <MenuItem
                value={-1}
                sx={{
                  mx: 1,
                  borderRadius: 0.75,
                  typography: 'body1',
                  fontStyle: 'italic',
                  color: 'text.secondary',
                }}
              >
                None
              </MenuItem>

              <Divider />

              {(roleOptions || []).map((item) => (
                <MenuItem
                  key={item.id}
                  value={item.id}
                  sx={{
                    mx: 1,
                    my: 0.5,
                    borderRadius: 0.75,
                    typography: 'body1',
                  }}
                >
                  {item.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Box>

      <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>
        {/*{values.siteRoles.map((item: any) => (*/}
        {/*  <Box key={`item_${item.site.id}_${item.role.id}`}></Box>*/}
        {/*))}*/}

        {values.siteRoles.map((item: any, index: number) => (
          <Box key={`item_${item.site.id}_${item.role.id}`}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={6}>
                <TextField
                  label="Site"
                  fullWidth
                  defaultValue={item.site.name}
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={4}>
                <TextField
                  label="Role"
                  fullWidth
                  defaultValue={item.role.name}
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={2}>
                <Button
                  size="small"
                  color="error"
                  startIcon={<Iconify icon="eva:trash-2-outline" />}
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              </Grid>
            </Grid>
          </Box>
        ))}

        <Box sx={{ display: 'flex', justifyContent: 'end', gap: 1 }}>
          <Box>
            <Button size={'medium'} startIcon={<Iconify icon="eva:plus-fill" />} onClick={handleAdd}>
              Add Site & Role
            </Button>
          </Box>
        </Box>
      </Stack>
    </Stack>
  );
}
