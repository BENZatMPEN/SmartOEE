import { Button, InputAdornment, Stack, TextField } from '@mui/material';
import Iconify from '../../../../components/Iconify';

type Props = {
  filterName: string;
  onFilterName: (value: string) => void;
  onSearch: VoidFunction;
  onReset: VoidFunction;
};

export default function DeviceModelTableToolbar({ filterName, onFilterName, onSearch, onReset }: Props) {
  return (
    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ py: 2.5, px: 3 }}>
      <TextField
        fullWidth
        value={filterName}
        onChange={(event) => onFilterName(event.target.value)}
        placeholder="Search by Name"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon={'eva:search-fill'} sx={{ color: 'text.disabled', width: 20, height: 20 }} />
            </InputAdornment>
          ),
        }}
      />

      <Button variant="text" startIcon={<Iconify icon="eva:search-fill" />} onClick={onSearch}>
        Search
      </Button>

      <Button variant="text" onClick={onReset}>
        Reset
      </Button>
    </Stack>
  );
}
