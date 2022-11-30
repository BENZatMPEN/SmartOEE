// @mui
import { TableCell, TableRow } from '@mui/material';

// ----------------------------------------------------------------------

type Props = {
  height?: number;
  emptyRows: number;
  colSpan?: number;
};

export default function TableEmptyRows({ emptyRows, height, colSpan }: Props) {
  if (!emptyRows) {
    return null;
  }

  return (
    <TableRow
      sx={{
        ...(height && {
          height: height * emptyRows,
        }),
      }}
    >
      <TableCell colSpan={colSpan || 0} />
    </TableRow>
  );
}
