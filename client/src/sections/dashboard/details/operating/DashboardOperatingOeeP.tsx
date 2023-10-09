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
import { Machine } from '../../../../@types/machine';
import { OeeBatchP } from '../../../../@types/oeeBatch';
import Iconify from '../../../../components/Iconify';
import Scrollbar from '../../../../components/Scrollbar';
import { TableHeadCustom, TableNoData } from '../../../../components/table';
import { initialOeeStats, OEE_TYPE_P, ROWS_PER_PAGE_OPTIONS } from '../../../../constants';
import useTable from '../../../../hooks/useTable';
import useToggle from '../../../../hooks/useToggle';
import { updateBatchParamP } from '../../../../redux/actions/oeeBatchAction';
import { RootState, useDispatch, useSelector } from '../../../../redux/store';
import { fSeconds } from '../../../../utils/formatNumber';
import { fDateTime } from '../../../../utils/formatTime';
import DashboardOperatingOeePDialog from './DashboardOperatingOeePDialog';

export default function DashboardOperatingOeeP() {
  const { page, order, orderBy, rowsPerPage, selected, onSort, onChangePage, onChangeRowsPerPage } = useTable({
    defaultOrderBy: 'createdAt',
    defaultOrder: 'asc',
  });

  const dispatch = useDispatch();

  const { selectedOee } = useSelector((state: RootState) => state.oeeDashboard);

  const { currentBatch, canEditBatch, batchParamPs } = useSelector((state: RootState) => state.oeeBatch);

  const { timeUnit } = selectedOee || { timeUnit: '' };

  const { oeeStats, machines } = currentBatch || { machines: [] };

  const { totalSpeedLossCount, totalMinorStopCount, totalSpeedLossSeconds, totalMinorStopSeconds } =
    oeeStats || initialOeeStats;

  const mcParams = useMemo(
    () => machines.map((machine) => machine.parameters.filter((param) => param.oeeType === OEE_TYPE_P)).flat(),
    [machines],
  );

  const TABLE_HEAD = [
    { id: 'timestamp', label: 'Timestamp', align: 'left' },
    { id: 'machineId', label: 'Machine', align: 'left' },
    { id: 'machineParameterId', label: 'Minor Stop', align: 'left' },
    { id: 'seconds', label: `Duration`, align: 'left' },
    { id: '' },
  ];

  const { toggle: openEdit, onOpen: onOpenEdit, onClose: onCloseEdit } = useToggle();

  const [editingItem, setEditingItem] = useState<{ param: OeeBatchP; index: number } | null>(null);

  const handleEditItem = (oeeBatchP: OeeBatchP, index: number) => {
    setEditingItem({ param: oeeBatchP, index });
    onOpenEdit();
  };

  const handleUpdateItem = (oeeBatchP: OeeBatchP) => {
    if (editingItem) {
      dispatch(updateBatchParamP({ param: oeeBatchP, index: editingItem.index }));
    }
    setEditingItem(null);
  };

  const getMachineName = (oeeBatchP: OeeBatchP): string => {
    const idx = machines.findIndex((m) => m.id === oeeBatchP.machineId);
    return idx >= 0 ? machines[idx].name : 'Other';
  };

  const getMachineParamName = (oeeBatchP: OeeBatchP): string => {
    const idx = mcParams.findIndex((mp) => mp.id === oeeBatchP.machineParameterId);
    return idx >= 0 ? mcParams[idx].name : 'Other';
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'top', pb: 3 }}>
          <Typography variant="h3">Performance</Typography>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" spacing={5}>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Total Minor Stop:
              </Typography>
              <Typography variant="subtitle1">{totalMinorStopCount} times</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" spacing={5}>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Total Time Minor Stop:
              </Typography>
              <Typography variant="subtitle1">{fSeconds(totalMinorStopSeconds)}</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" spacing={5}>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Total Time Speed Loss:
              </Typography>
              <Typography variant="subtitle1">{fSeconds(totalSpeedLossSeconds)}</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" spacing={5}>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Total Time:
              </Typography>
              <Typography variant="subtitle1">{fSeconds(totalSpeedLossSeconds + totalMinorStopSeconds)}</Typography>
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
                rowCount={batchParamPs.length}
                numSelected={selected.length}
                onSort={onSort}
              />

              <TableBody>
                {batchParamPs.length > 0 &&
                  batchParamPs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow key={'row_' + row.id} hover>
                      <TableCell align="left">{fDateTime(row.timestamp)}</TableCell>

                      <TableCell align="left">{getMachineName(row)}</TableCell>

                      <TableCell align="left">{getMachineParamName(row)}</TableCell>

                      <TableCell align="left">{fSeconds(row.seconds)}</TableCell>

                      <TableCell align="left">
                        <Button
                          disabled={!canEditBatch}
                          size={'small'}
                          startIcon={<Iconify icon="eva:edit-outline" />}
                          onClick={() => handleEditItem(row, index)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                <TableNoData key={'noData'} isNotFound={batchParamPs.length === 0} />
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <Box sx={{ position: 'relative' }}>
          <TablePagination
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            component="div"
            count={batchParamPs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
          />
        </Box>

        {editingItem && (
          <DashboardOperatingOeePDialog
            open={openEdit}
            onClose={onCloseEdit}
            onUpdate={handleUpdateItem}
            editingOeeBatchP={editingItem.param}
          />
        )}
      </CardContent>
    </Card>
  );
}
