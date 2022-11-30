import { Button, InputAdornment, Stack, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import Iconify from '../../components/Iconify';

type Props = {
  filterName: string;
  fromDate: Date;
  toDate: Date;
  onFilterName: (value: string) => void;
  onFromDate: (date: Date) => void;
  onToDate: (date: Date) => void;
  onSearch: () => void;
  onExport: () => void;
};

export default function HistoryTableToolbar({
  filterName,
  fromDate,
  toDate,
  onFilterName,
  onFromDate,
  onToDate,
  onSearch,
  onExport,
}: Props) {
  return (
    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ py: 2.5, px: 3 }}>
      <DatePicker
        label="Start Date"
        value={fromDate}
        onChange={(newValue: any) => {
          onFromDate(newValue);
        }}
        renderInput={(params: any) => <TextField {...params} fullWidth />}
      />

      <DatePicker
        label="to Date"
        value={toDate}
        onChange={(newValue: any) => {
          onToDate(newValue);
        }}
        renderInput={(params: any) => <TextField {...params} fullWidth />}
      />

      <TextField
        fullWidth
        value={filterName}
        onChange={(event) => onFilterName(event.target.value)}
        placeholder="Search by Details"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon={'eva:search-fill'} sx={{ color: 'text.disabled', width: 20, height: 20 }} />
            </InputAdornment>
          ),
        }}
      />

      <Stack spacing={2} direction="row">
        <Button startIcon={<Iconify icon="eva:search-fill" />} onClick={onSearch}>
          Search
        </Button>

        <Button startIcon={<Iconify icon="eva:file-text-outline" />} onClick={onExport}>
          Excel
        </Button>
      </Stack>
    </Stack>
  );
}
