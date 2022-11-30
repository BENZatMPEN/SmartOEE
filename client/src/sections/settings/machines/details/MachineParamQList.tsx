import { Box, Button, Grid, IconButton, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { RHFTextField } from '../../../../components/hook-form';
import Iconify from '../../../../components/Iconify';

type Props = {
  onAdd: () => void;
  onEdit: (index: number) => void;
};

export default function MachineParamQList({ onAdd, onEdit }: Props) {
  const theme = useTheme();

  const { control } = useFormContext();

  const { fields, remove } = useFieldArray({
    control,
    name: 'qParams',
  });

  const handleAdd = () => {
    onAdd();
  };

  const handleRemove = (index: number) => {
    remove(index);
  };

  const handleEdit = (index: number) => {
    onEdit(index);
  };

  return (
    <Stack spacing={theme.spacing(3)}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ color: 'text.disabled' }}>
            OEE Parameter - Quality (Q)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box sx={{ flexShrink: 0 }}>
            <Button size={'medium'} startIcon={<Iconify icon="eva:plus-fill" />} onClick={handleAdd}>
              Add new tag
            </Button>
          </Box>
        </Box>
      </Box>

      <Box>
        <Grid container spacing={3}>
          {fields.map((item, index) => (
            <Grid item key={item.id} xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <RHFTextField size="small" name={`qParams[${index}].name`} InputProps={{ readOnly: true }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'end', gap: 1 }}>
                  <IconButton size="medium" onClick={() => handleEdit(index)}>
                    <Iconify icon="eva:edit-outline" />
                  </IconButton>
                  <IconButton size="medium" color="error" onClick={() => handleRemove(index)}>
                    <Iconify icon="eva:trash-2-outline" />
                  </IconButton>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Stack>
  );
}
