import { Box, Button } from '@mui/material';
import XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface Props {
  headers: string[];
  rows: any[];
  filename: string;
}

export default function ExportXlsx({ headers, rows, filename }: Props) {
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  const exportToXlsx = () => {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'data');
    const xslxBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array', bookSST: true });
    saveAs(new Blob([xslxBuffer], { type: fileType }), `${filename}.xlsx`);
  };

  return (
    <Box display="flex" justifyContent="end" paddingY={2}>
      <Button variant="outlined" onClick={() => exportToXlsx()}>
        Export Excel
      </Button>
    </Box>
  );
}
