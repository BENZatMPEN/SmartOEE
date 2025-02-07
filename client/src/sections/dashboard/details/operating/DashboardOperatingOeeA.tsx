import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { OeeBatchA } from '../../../../@types/oeeBatch';
import Iconify from '../../../../components/Iconify';
import Scrollbar from '../../../../components/Scrollbar';
import { TableHeadCustom, TableNoData } from '../../../../components/table';
import { initialOeeStats, OEE_TYPE_A, ROWS_PER_PAGE_OPTIONS } from '../../../../constants';
import useTable from '../../../../hooks/useTable';
import useToggle from '../../../../hooks/useToggle';
import { updateBatchParamA } from '../../../../redux/actions/oeeBatchAction';
import { RootState, useDispatch, useSelector } from '../../../../redux/store';
import { fSeconds } from '../../../../utils/formatNumber';
import { fDateTime } from '../../../../utils/formatTime';
import DashboardOperatingOeeADialog from './DashboardOperatingOeeADialog';

export default function DashboardOperatingOeeA() {
  const { page, order, orderBy, rowsPerPage, selected, onSort, onChangePage, onChangeRowsPerPage } = useTable({
    defaultOrderBy: 'createdAt',
    defaultOrder: 'asc',
  });

  const dispatch = useDispatch();

  const { currentBatch, canEditBatch, batchParamAs } = useSelector((state: RootState) => state.oeeBatch);

  const { oeeStats, machines } = currentBatch || { machines: [] };

  const mcParams = useMemo(
    () => machines.map((machine) => machine.parameters.filter((param) => param.oeeType === OEE_TYPE_A)).flat(),
    [machines],
  );

  const { totalBreakdownCount, totalBreakdownSeconds } = oeeStats || initialOeeStats;

  const TABLE_HEAD = [
    { id: 'timestamp', label: 'TimestampStart', align: 'left' },
    { id: 'timestamp', label: 'TimestampEnd', align: 'left' },
    { id: 'machineId', label: 'Machine', align: 'left' },
    { id: 'machineParameterId', label: 'Breakdown', align: 'left' },
    { id: 'seconds', label: `Duration`, align: 'left' },
    { id: '' },
  ];

  const { toggle: openEdit, onOpen: onOpenEdit, onClose: onCloseEdit } = useToggle();

  const [editingItem, setEditingItem] = useState<{ param: OeeBatchA; index: number } | null>(null);

  const handleEditItem = (oeeBatchA: OeeBatchA, index: number) => {
    setEditingItem({ param: oeeBatchA, index });
    onOpenEdit();
  };

  const handleUpdateItem = (oeeBatchA: OeeBatchA) => {
    if (editingItem) {
      dispatch(updateBatchParamA({ param: oeeBatchA, index: editingItem.index }));
    }
    setEditingItem(null);
  };

  const getMachineName = (oeeBatchA: OeeBatchA): string => {
    const idx = machines.findIndex((m) => m.id === oeeBatchA.machineId);
    return idx >= 0 ? machines[idx].name : 'Other';
  };

  const getMachineParamName = (oeeBatchA: OeeBatchA): string => {
    const idx = mcParams.findIndex((mp) => mp.id === oeeBatchA.machineParameterId);
    return idx >= 0 ? mcParams[idx].name : 'Other';
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'top', pb: 3 }}>
          <Typography variant="h3">Availability</Typography>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" spacing={5}>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Total Breakdown:
              </Typography>
              <Typography variant="subtitle1">{totalBreakdownCount} times</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" spacing={5}>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Total Time:
              </Typography>
              <Typography variant="subtitle1">{fSeconds(totalBreakdownSeconds)}</Typography>
            </Stack>
          </Stack>
        </Box>
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800 }}>
            <Table size={'medium'}>
              <TableHeadCustom
                order={order}
                orderBy={orderBy}
                headLabel={TABLE_HEAD}
                rowCount={batchParamAs.length}
                numSelected={selected.length}
                onSort={onSort}
              />

              <TableBody>
                {batchParamAs.length > 0 &&
                  batchParamAs
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => {
                      const timestampStart = new Date(new Date(row.timestamp).getTime() - row.seconds * 1000);

                      return (
                        <TableRow key={'row_' + row.id} hover>
                          <TableCell align="left">{fDateTime(timestampStart)}</TableCell>

                          <TableCell align="left">{fDateTime(row.timestamp)}</TableCell>

                          <TableCell align="left">{getMachineName(row)}</TableCell>

                          <TableCell align="left">{getMachineParamName(row)}</TableCell>

                          <TableCell align="left">{fSeconds(row.seconds)}</TableCell>

                          <TableCell align="left">
                            <Button
                              size="small"
                              disabled={!canEditBatch}
                              startIcon={<Iconify icon="eva:edit-outline" />}
                              onClick={() => handleEditItem(row, index)}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                <TableNoData key="noData" isNotFound={batchParamAs.length === 0} />
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <Box sx={{ position: 'relative' }}>
          <TablePagination
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            component="div"
            count={batchParamAs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
          />
        </Box>

        {editingItem && (
          <DashboardOperatingOeeADialog
            open={openEdit}
            onClose={onCloseEdit}
            onUpdate={handleUpdateItem}
            editingOeeBatchA={editingItem.param}
          />
        )}
      </CardContent>
    </Card>
  );
}
