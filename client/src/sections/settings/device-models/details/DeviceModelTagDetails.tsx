import { Box, Button, Divider, Grid, MenuItem, Stack, Typography } from '@mui/material';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { DeviceModel } from '../../../../@types/deviceModel';
import { RHFCheckbox, RHFSelect, RHFTextField } from '../../../../components/hook-form';
import Iconify from '../../../../components/Iconify';
import {
  DEVICE_MODEL_DATA_TYPES,
  DEVICE_MODEL_READ_FUNCTIONS,
  DEVICE_MODEL_WRITE_FUNCTIONS,
} from '../../../../constants';
import { getDeviceModelReadFuncText, getDeviceModelWriteFuncText } from '../../../../utils/formatText';

export default function DeviceModelTagDetails() {
  const { control, getValues, setValue, watch } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tags',
  });

  const values = watch() as DeviceModel;

  const handleAdd = () => {
    append({
      name: '',
      address: 0,
      length: getLengthByDataType(DEVICE_MODEL_DATA_TYPES[0]),
      dataType: DEVICE_MODEL_DATA_TYPES[0],
      readFunc: 1,
      writeFunc: 5,
      writeState: false,
      factor: 1,
      compensation: 0,
    });
  };

  const handleRemove = (index: number) => {
    remove(index);
  };

  const handleDuplicate = (index: number) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...others } = getValues('tags')[index];
    append(others);
  };

  const getLengthByDataType = (dataType: string): number => {
    switch (dataType) {
      case 'int16':
      case 'int16s':
      case 'int16u':
        return 1;
      case 'int32':
      case 'int32s':
      case 'int32u':
      case 'float':
        return 2;
      default:
        return 0;
    }
  };

  const handleDataTypeChanged = (index: number, dataType: string) => {
    setValue(`tags[${index}].dataType`, dataType);
    setValue(`tags[${index}].length`, getLengthByDataType(dataType));
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h6" sx={{ color: 'text.disabled' }}>
        Tags
      </Typography>

      <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>
        {fields.map((item, index) => (
          <Box key={item.id}>
            <Box>
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
                        name={`tags[${index}].address`}
                        label="Address"
                        InputLabelProps={{ shrink: true }}
                        onChange={(event) => setValue(`tags[${index}].address`, Number(event.target.value))}
                      />
                    </Grid>

                    <Grid item xs={2.4}>
                      <RHFSelect
                        name={`tags[${index}].readFunc`}
                        label="Read Func"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        SelectProps={{ native: false }}
                      >
                        {DEVICE_MODEL_READ_FUNCTIONS.map((option) => (
                          <MenuItem
                            key={option}
                            value={option}
                            sx={{
                              mx: 1,
                              my: 0.5,
                              borderRadius: 0.75,
                              typography: 'body2',
                            }}
                          >
                            {getDeviceModelReadFuncText(option)}
                          </MenuItem>
                        ))}
                      </RHFSelect>
                    </Grid>

                    <Grid item xs={2.4}>
                      <RHFSelect
                        name={`tags[${index}].dataType`}
                        label="Data Type"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        SelectProps={{ native: false, sx: { textTransform: 'capitalize' } }}
                        onChange={(event) => handleDataTypeChanged(index, event.target.value)}
                      >
                        {DEVICE_MODEL_DATA_TYPES.map((option) => (
                          <MenuItem
                            key={option}
                            value={option}
                            sx={{
                              mx: 1,
                              my: 0.5,
                              borderRadius: 0.75,
                              typography: 'body2',
                              textTransform: 'capitalize',
                            }}
                          >
                            {option}
                          </MenuItem>
                        ))}
                      </RHFSelect>
                    </Grid>

                    <Grid item xs={2.4}>
                      <RHFTextField
                        size="small"
                        type="number"
                        name={`tags[${index}].factor`}
                        label="Factor"
                        InputLabelProps={{ shrink: true }}
                        onChange={(event) => setValue(`tags[${index}].factor`, Number(event.target.value))}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={2.4}>
                      <RHFTextField
                        size="small"
                        type="number"
                        name={`tags[${index}].compensation`}
                        label="Compensation"
                        InputLabelProps={{ shrink: true }}
                        onChange={(event) => setValue(`tags[${index}].compensation`, Number(event.target.value))}
                      />
                    </Grid>

                    <Grid item xs={2.4}>
                      <RHFCheckbox name={`tags[${index}].writeState`} label={'Allow write'} />
                    </Grid>

                    <Grid item xs={2.4} sx={{ visibility: values.tags[index].writeState ? 'visible' : 'hidden' }}>
                      <RHFSelect
                        name={`tags[${index}].writeFunc`}
                        label="Write Func"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        SelectProps={{ native: false }}
                      >
                        {DEVICE_MODEL_WRITE_FUNCTIONS.map((option) => (
                          <MenuItem
                            key={option}
                            value={option}
                            sx={{
                              mx: 1,
                              my: 0.5,
                              borderRadius: 0.75,
                              typography: 'body2',
                            }}
                          >
                            {getDeviceModelWriteFuncText(option)}
                          </MenuItem>
                        ))}
                      </RHFSelect>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'end', mt: 2, gap: 1 }}>
              <Button
                size="small"
                color={'inherit'}
                startIcon={<Iconify icon="eva:copy-fill" />}
                onClick={() => handleDuplicate(index)}
              >
                Duplicate
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<Iconify icon="eva:trash-2-outline" />}
                onClick={() => handleRemove(index)}
              >
                Remove
              </Button>
            </Box>
          </Box>
        ))}
      </Stack>

      <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

      <Box sx={{ display: 'flex', justifyContent: 'end', gap: 1 }}>
        <Box>
          <Button size={'medium'} startIcon={<Iconify icon="eva:plus-fill" />} onClick={handleAdd}>
            Add new tag
          </Button>
        </Box>
      </Box>
    </Stack>
  );
}
