import { Box, Button, Grid, IconButton, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { ImageWidgetProps } from '../../@types/imageWidget';
import { RHFTextField } from '../hook-form';
import Iconify from '../Iconify';
import UploadSingleBase64 from '../upload/UploadSingleBase64';

export default function ImageWidgetMappingList() {
  const theme = useTheme();

  const { control, watch, setValue, getValues } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'imageValues',
  });

  const values = watch() as ImageWidgetProps;

  const handleAdd = () => {
    append({ image: null, value: '' });
  };

  const handleRemove = (index: number) => {
    remove(index);
  };

  const handleDrop = async (index: number, acceptedFiles: File[]) => {
    const arr = getValues('imageValues');
    const fileBuffer = await acceptedFiles[0].arrayBuffer();
    arr[index].image = new Buffer(fileBuffer).toString('base64');
    setValue('imageValues', [...arr]);
  };

  return (
    <Stack spacing={theme.spacing(3)}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" sx={{ color: 'text.disabled' }}>
            Images
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box sx={{ flexShrink: 0 }}>
            <Button size={'medium'} startIcon={<Iconify icon="eva:plus-fill" />} onClick={handleAdd}>
              Add Image
            </Button>
          </Box>
        </Box>
      </Box>

      <Box>
        <Grid container spacing={theme.spacing(3)}>
          {fields.map((item, index) => (
            <Grid item key={item.id} xs={12} md={6}>
              <Stack spacing={theme.spacing(2)}>
                <Box sx={{ display: 'flex', gap: theme.spacing(1) }}>
                  <RHFTextField
                    name={`imageValues[${index}].value`}
                    label="Value"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />

                  <IconButton size="medium" color="error" onClick={() => handleRemove(index)}>
                    <Iconify icon="eva:trash-2-outline" />
                  </IconButton>
                </Box>

                <UploadSingleBase64
                  accept="image/*"
                  file={values.imageValues[index]?.image}
                  onDrop={(files: File[]) => handleDrop(index, files)}
                  dropZoneDesc={false}
                  dropZoneSx={{ minHeight: '150px' }}
                />
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Stack>
  );
}
