import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { EditOee, OeeProduct } from '../../../../@types/oee';
import Iconify from '../../../../components/Iconify';
import { TableNoData } from '../../../../components/table';
import { getTimeUnitText } from '../../../../utils/formatText';
import OeeProductTableRow from './OeeProductTableRow';

type Props = {
  editingOee: EditOee;
  oeeProducts: OeeProduct[];
  onAdd: VoidFunction;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
};

export default function OeeProductTable({ onAdd, onEdit, onDelete, oeeProducts, editingOee }: Props) {
  const theme = useTheme();

  const isNotFound = oeeProducts.length === 0;

  const handleAdd = () => {
    onAdd();
  };

  const handleDelete = (index: number) => {
    onDelete(index);
  };

  const handleEdit = (index: number) => {
    onEdit(index);
  };

  return (
    <Stack spacing={theme.spacing(3)}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ color: 'text.disabled' }}>
            Products ({oeeProducts.length})
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box sx={{ flexShrink: 0 }}>
            <Button size={'medium'} startIcon={<Iconify icon="eva:plus-fill" />} onClick={handleAdd}>
              Add
            </Button>
          </Box>
        </Box>
      </Box>

      <TableContainer>
        <Table size={'small'}>
          <TableHead>
            <TableRow>
              <TableCell align={'left'}>SKU</TableCell>

              <TableCell align={'left'}>Name</TableCell>

              <TableCell align={'left'}>Standard Speed ({getTimeUnitText(editingOee.timeUnit)})</TableCell>

              <TableCell></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {oeeProducts.map((oeeProduct, index) => (
              <OeeProductTableRow
                key={oeeProduct.productId}
                row={oeeProduct}
                onEditRow={() => handleEdit(index)}
                onDeleteRow={() => handleDelete(index)}
              />
            ))}

            <TableNoData key={'noData'} isNotFound={isNotFound} />
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
