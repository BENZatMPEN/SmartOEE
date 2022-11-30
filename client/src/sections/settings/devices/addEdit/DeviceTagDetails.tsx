import { Box, Divider, Grid, Stack, Typography } from '@mui/material';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { RHFCheckbox, RHFTextField } from '../../../../components/hook-form';

export default function DeviceTagDetails() {
  const { control, setValue } = useFormContext();

  const { fields } = useFieldArray({
    control,
    name: 'tags',
  });

  return (
    <Stack spacing={3}>
      <Typography variant="h6" sx={{ color: 'text.disabled' }}>
        Tags
      </Typography>

      <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>
        {fields.map((item, index) => (
          <Box key={item.id}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={2.4}>
                    <RHFTextField
                      size="small"
                      name={`tags[${index}].name`}
                      label="Name"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={2.4}>
                    <RHFTextField
                      size="small"
                      type="number"
                      name={`tags[${index}].spLow`}
                      label="spLow"
                      InputLabelProps={{ shrink: true }}
                      onChange={(event) => setValue(`tags[${index}].spLow`, Number(event.target.value))}
                    />
                  </Grid>

                  <Grid item xs={2.4}>
                    <RHFTextField
                      size="small"
                      type="number"
                      name={`tags[${index}].spHigh`}
                      label="spHigh"
                      InputLabelProps={{ shrink: true }}
                      onChange={(event) => setValue(`tags[${index}].spHigh`, Number(event.target.value))}
                    />
                  </Grid>

                  <Grid item xs={2.4}>
                    <RHFTextField
                      size="small"
                      type="text"
                      name={`tags[${index}].update`}
                      label="Update"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={2.4}>
                    <RHFCheckbox name={`tags[${index}].record`} label={'Record'} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
