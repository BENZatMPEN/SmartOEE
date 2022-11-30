import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableContainer,
  TablePagination,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { OeeBatchQ } from '../../../../@types/oeeBatch';
import Iconify from '../../../../components/Iconify';
import Scrollbar from '../../../../components/Scrollbar';
import { TableNoData } from '../../../../components/table';
import { initialOeeStats, OEE_TYPE_Q, ROWS_PER_PAGE_OPTIONS } from '../../../../constants';
import useTable from '../../../../hooks/useTable';
import { RootState, useSelector } from '../../../../redux/store';
import axios from '../../../../utils/axios';

type QStats = {
  totalManual: number;
  totalOther: number;
};

const initialQStats = {
  totalManual: 0,
  totalOther: 0,
};

export default function DashboardOperatingOeeQ() {
  const { page, rowsPerPage, onChangePage, onChangeRowsPerPage } = useTable();

  const { enqueueSnackbar } = useSnackbar();

  const { currentBatch, canEditBatch, batchParamQs } = useSelector((state: RootState) => state.oeeBatch);

  const { oeeStats, machines } = currentBatch || { machines: [] };

  const { totalAutoDefects, totalManualDefects, totalOtherDefects } = oeeStats || initialOeeStats;

  const [qStats, setQStats] = useState<QStats>(initialQStats);

  const mcParams = useMemo(
    () => machines.map((machine) => machine.parameters.filter((param) => param.oeeType === OEE_TYPE_Q)).flat(),
    [machines],
  );

  const [localQs, setLocalQs] = useState<OeeBatchQ[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setLocalQs([...batchParamQs]);
  }, [batchParamQs]);

  useEffect(() => {
    setQStats({
      totalManual: totalManualDefects,
      totalOther: totalOtherDefects,
    });
  }, [totalManualDefects, totalOtherDefects]);

  const isNotFound = localQs.length === 0 || !currentBatch;

  const handleAmountChange = (id: number, amount: number) => {
    if (amount < 0) {
      return;
    }

    const index = localQs.findIndex((item) => item.id === id);
    if (index < 0) {
      return;
    }

    const item = localQs[index];
    localQs[index] = {
      ...item,
      manualAmount: amount,
    };
    setLocalQs([...localQs]);
    setQStats({
      ...qStats,
      totalOther: calculateTotalOther(qStats.totalManual),
    });
  };

  const handleTotalManualChange = (total: number) => {
    setQStats({
      totalManual: total,
      totalOther: calculateTotalOther(total),
    });
  };

  const calculateTotalOther = (totalManual: number): number => {
    const sumManual = localQs.reduce((acc, x) => acc + x.manualAmount, 0);
    return totalManual - sumManual;
  };

  const handleSave = async () => {
    if (!currentBatch) {
      return;
    }

    setIsLoading(true);

    try {
      await axios.post(`/oee-batches/${currentBatch.id}/q-params`, {
        qParams: localQs.map((item) => {
          return {
            id: item.id,
            manualAmount: item.manualAmount,
          };
        }),
        totalManual: qStats.totalManual,
      });

      enqueueSnackbar('Quality has been updated!');
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }

    setIsLoading(false);
  };

  const getMachineParamName = (oeeBatchQ: OeeBatchQ): string => {
    const idx = mcParams.findIndex((mp) => mp.id === oeeBatchQ.machineParameterId);
    return idx >= 0 ? mcParams[idx].name : 'Other';
  };

  return (
    <Card>
      <CardContent>
        <Scrollbar>
          {isNotFound ? (
            <TableContainer sx={{ minWidth: 800 }}>
              <Table size={'medium'}>
                <TableBody>
                  <TableNoData key={'noData'} isNotFound={isNotFound} />
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={12} xl={2.5}>
                    <Typography variant="h6">Quality</Typography>
                  </Grid>

                  <Grid item xs={12} xl={9.5}>
                    <Stack spacing={3} sx={{ mt: 1 }} direction="row" justifyContent="space-between">
                      <TextField
                        type="number"
                        size="small"
                        label="Total Manual"
                        value={qStats.totalManual}
                        InputProps={{ readOnly: !canEditBatch }}
                        InputLabelProps={{ shrink: true }}
                        onFocus={(event) => {
                          if (canEditBatch) {
                            event.target.select();
                          }
                        }}
                        onChange={(event) => {
                          handleTotalManualChange(Number(event.target.value));
                        }}
                      />

                      <Stack spacing={2} direction="row">
                        <TextField
                          type="number"
                          size="small"
                          label="Other"
                          value={qStats.totalOther}
                          InputProps={{ readOnly: true }}
                          InputLabelProps={{ shrink: true }}
                        />

                        <LoadingButton
                          type="submit"
                          size="medium"
                          variant="outlined"
                          loading={isLoading}
                          startIcon={<Iconify icon="eva:save-fill" />}
                          disabled={!canEditBatch || qStats.totalOther < 0}
                          onClick={async () => {
                            await handleSave();
                          }}
                        >
                          Save
                        </LoadingButton>
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>

                <Divider sx={{ borderStyle: 'dashed', mt: 3 }} />
              </Grid>

              <Grid item xs={12} xl={2.5}>
                <Stack spacing={3} sx={{ mt: 1 }}>
                  <TextField
                    type="number"
                    size="small"
                    label="Total Defect"
                    value={totalAutoDefects + qStats.totalManual}
                    InputProps={{ readOnly: true }}
                    InputLabelProps={{ shrink: true }}
                  />

                  <TextField
                    type="number"
                    size="small"
                    label="Total Auto"
                    value={totalAutoDefects}
                    InputProps={{ readOnly: true }}
                    InputLabelProps={{ shrink: true }}
                  />

                  <TextField
                    type="number"
                    size="small"
                    label="Total Manual"
                    value={qStats.totalManual}
                    InputProps={{ readOnly: true }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} xl={9.5}>
                <Grid container spacing={3} sx={{ pt: 1, pb: 3 }}>
                  {localQs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                    <Grid item key={row.id} xs={12} md={6}>
                      <Grid container spacing={2}>
                        <Grid item xs={4.5}>
                          <Typography variant="body2">{getMachineParamName(row)}</Typography>
                        </Grid>

                        <Grid item xs={1.75}>
                          <TextField
                            type="number"
                            size="small"
                            label="Auto"
                            value={row.autoAmount}
                            InputProps={{ readOnly: true }}
                          />
                        </Grid>

                        <Grid item xs={4}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <IconButton
                              size="small"
                              disabled={!canEditBatch}
                              onClick={() => {
                                handleAmountChange(row.id, row.manualAmount + 1);
                              }}
                            >
                              <Iconify icon="eva:plus-fill" />
                            </IconButton>

                            <TextField
                              size="small"
                              type="number"
                              label="Manual"
                              value={row.manualAmount}
                              InputProps={{ readOnly: !canEditBatch }}
                              onFocus={(event) => {
                                if (canEditBatch) {
                                  event.target.select();
                                }
                              }}
                              onChange={(event) => {
                                handleAmountChange(row.id, Number(event.target.value));
                              }}
                            />

                            <IconButton
                              size="small"
                              disabled={!canEditBatch}
                              onClick={() => {
                                handleAmountChange(row.id, row.manualAmount - 1);
                              }}
                            >
                              <Iconify icon="eva:minus-fill" />
                            </IconButton>
                          </Stack>
                        </Grid>

                        <Grid item xs={1.75}>
                          <TextField
                            type="number"
                            size="small"
                            label="Total"
                            value={row.autoAmount + row.manualAmount}
                            InputProps={{ readOnly: true }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          )}
        </Scrollbar>
        <Box sx={{ position: 'relative' }}>
          <TablePagination
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            component="div"
            count={localQs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
