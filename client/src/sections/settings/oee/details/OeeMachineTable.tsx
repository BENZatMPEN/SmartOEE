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
import { OeeMachine } from '../../../../@types/oee';
import Iconify from '../../../../components/Iconify';
import { TableNoData } from '../../../../components/table';
import OeeMachineTableRow from './OeeMachineTableRow';

type Props = {
  oeeMachines: OeeMachine[];
  onAdd: VoidFunction;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onAddPlanDowntime: (index: number) => void;
  onDeletePlanDowntime: (index: number, indexPlan: number) => void;
  onFixTimeChange: (indexPlan: number) => void;
};

export default function OeeMachineTable({ onAdd, onEdit, onDelete, oeeMachines, onAddPlanDowntime, onDeletePlanDowntime, onFixTimeChange }: Props) {
  const theme = useTheme();

  const isNotFound = oeeMachines.length === 0;

  const handleAdd = () => {
    onAdd();
  };

  const handleDelete = (index: number) => {
    onDelete(index);
  };

  const handleEdit = (index: number) => {
    onEdit(index);
  };

  const handleAddPlanDowntime = (index: number) => {
    onAddPlanDowntime(index);
  }

  const handleDeletePlanDowntime = (index: number, indexPlan: number) => {
    onDeletePlanDowntime(index, indexPlan);
  }

  const handleFixTimeChange = (indexPlan: number) => {
    onFixTimeChange(indexPlan);
  };

  return (
    <Stack spacing={theme.spacing(3)}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ color: 'text.disabled' }}>
            Machines ({oeeMachines.length})
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
              <TableCell sx={{ width: '30px' }}></TableCell>

              <TableCell align={'left'}>Machine Code</TableCell>

              <TableCell align={'left'}>Name</TableCell>

              <TableCell></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {oeeMachines.map((oeeMachine, index) => (
              <OeeMachineTableRow
                key={oeeMachine.machineId}
                row={oeeMachine}
                onEditRow={() => handleEdit(index)}
                onDeleteRow={() => handleDelete(index)}
                onAddPlanDowntime={() => handleAddPlanDowntime(index)}
                onDeletePlanDowntime={(index, indexPlan) => handleDeletePlanDowntime(index, indexPlan)}
                onFixTimeChange={(indexPlan) => handleFixTimeChange(indexPlan)}
              />
            ))}

            <TableNoData key={'noData'} isNotFound={isNotFound} />
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
