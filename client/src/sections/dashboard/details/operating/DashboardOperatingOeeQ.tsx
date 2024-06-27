import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
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
import { DialogActions } from '@mui/material';
import { Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Paper } from '@mui/material';

type QStats = {
  totalManual: number;
  totalOther: number;
  totalManualGram: number;
};

const initialQStats = {
  totalManual: 0,
  totalOther: 0,
  totalManualGram: 0
};

export default function DashboardOperatingOeeQ() {
  const { page, rowsPerPage, onChangePage, onChangeRowsPerPage } = useTable();

  const { enqueueSnackbar } = useSnackbar();

  const { currentBatch, canEditBatch, batchParamQs } = useSelector((state: RootState) => state.oeeBatch);

  const { selectedOee } = useSelector((state: RootState) => state.oeeDashboard);

  const { oeeStats, machines, product, plannedQuantity } = currentBatch || { machines: [] };

  const { totalAutoDefects, totalManualDefects, totalManualGrams, totalOtherDefects, totalCount } = oeeStats || initialOeeStats;

  const [qStats, setQStats] = useState<QStats>(initialQStats);

  const mcParams = useMemo(
    () => machines.map((machine) => machine.parameters.filter((param) => param.oeeType === OEE_TYPE_Q)).flat(),
    [machines],
  );

  const [localQs, setLocalQs] = useState<OeeBatchQ[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isModalOpen, setModalOpen] = useState(false);

  const [rowModal, setRowModal] = useState<any>({});

  const [pcdGram, setPcdGram] = useState<number>(0);

  const [newValueGram, setNewValueGram] = useState<number>(0);

  const [totalGram, setTotalGram] = useState<number>(0);
  const handleOpenModal = (row: OeeBatchQ) => {
    setRowModal(row)
    if (product?.activePcs === true && canEditBatch) {
      setModalOpen(true);
    }
  };

  useEffect(() => {
    let sum = 0;
    localQs.forEach((item) => {
      if (item.grams) {
        const grams = item.grams.split(',').map((item: string) => Number(item));
        sum += grams.reduce((acc, x) => acc + x, 0);
      }
    });
    setTotalGram(sum);
  }, [localQs]);

  const handleCloseModal = () => {
    setNewValueGram(0);
    setModalOpen(false);
  };

  useEffect(() => {
    setLocalQs([...batchParamQs]);
  }, [batchParamQs]);

  useEffect(() => {
    setQStats({
      totalManualGram: totalManualGrams | 0,
      totalManual: totalManualDefects | 0,
      totalOther: totalOtherDefects | 0,
    });
  }, [totalManualDefects, totalOtherDefects, totalManualGrams]);

  useEffect(() => {
    setPcdGram(product?.pscGram || 0);
  }, [selectedOee]);

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
    const totalOther = calculateTotalOther(qStats.totalManual);
    const manualGrams = localQs.reduce((acc, x) => acc + (x.manualAmountGram || 0), 0);
    setQStats({
      ...qStats,
      totalOther: totalOther,
      totalManualGram: manualGrams,
    });
  };

  const handleManualGramChange = () => {
    const totalOther = calculateTotalOther(qStats.totalManual);
    setQStats({
      ...qStats,
      totalOther: totalOther,
    });
  }

  const handleTotalManualChange = (total: number) => {
    setQStats({
      ...qStats,
      totalManual: total,
      totalOther: calculateTotalOther(total),
    });
  };

  const calculateTotalOther = (totalManual: number): number => {
    const manualGrams = localQs.reduce((acc, x) => acc + (x.manualAmountGram || 0), 0);
    const sumManual = localQs.reduce((acc, x) => acc + x.manualAmount || 0, 0);
    return totalManual - sumManual - manualGrams;
  };

  const handleSave = async () => {
    if (!currentBatch) {
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`/oee-batches/${currentBatch.id}/q-params`, {
        qParams: localQs.map((item) => ({
          id: item.id,
          grams: item.grams,
          manualAmountGram: item.manualAmountGram,
          manualAmount: item.manualAmount,
        })),
        totalManual: qStats.totalManual,
        totalManualGram: qStats.totalManualGram,
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

  const handleAddGram = (value: number) => {
    const newManualGram = (rowModal.grams ?? '').split(',').filter((item: string) => item !== '');
    newManualGram?.push(value.toString());
    setRowModal({
      ...rowModal,
      grams: newManualGram?.join(',')
    })
    const index = localQs.findIndex((item) => item.id === rowModal.id);
    const grams = newManualGram?.map((item: string) => Number(item));
    //transfer grams to pcs
    const newManualAmount = Math.ceil(grams?.reduce((acc: any, x: any) => acc + x, 0) / pcdGram);

    const item = localQs[index];
    localQs[index] = {
      ...item,
      grams: newManualGram?.join(','),
      manualAmountGram: newManualAmount
    };

    setLocalQs([...localQs]);
    setNewValueGram(0);
    handleManualGramChange();

    const manualGrams = localQs.reduce((acc, x) => acc + (x.manualAmountGram || 0), 0);
    setQStats({
      ...qStats,
      totalOther: calculateTotalOther(qStats.totalManual),
      totalManualGram: manualGrams,
    } as QStats);
  };

  const handleDeleteGram = (index: number) => {
    const newManualGram = rowModal.grams?.split(',');
    newManualGram?.splice(index, 1);
    setRowModal({
      ...rowModal,
      grams: newManualGram?.join(',')
    })

    const indexLocalQs = localQs.findIndex((item) => item.id === rowModal.id);
    const newManualAmount = Math.ceil(newManualGram?.reduce((acc: any, x: any) => acc + Number(x), 0) / pcdGram);
    const item = localQs[indexLocalQs];
    localQs[indexLocalQs] = {
      ...item,
      grams: newManualGram?.join(','),
      manualAmountGram: newManualAmount
    };

    setLocalQs([...localQs]);
    const manualGrams = localQs.reduce((acc, x) => acc + (x.manualAmountGram || 0), 0);
    setQStats({
      ...qStats,
      totalOther: calculateTotalOther(qStats.totalManual),
      totalManualGram: manualGrams,
    } as QStats);
  }
  const calculateTotalGrams = (grams: string | undefined) => {
    if (!grams) {
      return 0;
    }

    return grams.split(',').reduce((acc: number, x: string) => acc + Number(x), 0);
  }
  const totalDefect = totalAutoDefects + totalManualDefects;
  const fgValue = totalCount - totalDefect;

  const safePlannedQuantity = plannedQuantity || 1; // default to 1 to avoid division by zero
  const yieldValue = ((totalCount - totalDefect) / safePlannedQuantity) * 100;
  const lossValue = (safePlannedQuantity - (totalCount - totalDefect)) / safePlannedQuantity * 100;
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
            <Grid container spacing={3} sx={{ mb: 5 }}>
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={12} xl={2.5}>
                    <Typography variant="h3">Quality</Typography>
                  </Grid>
                  <Grid item xs={12} xl={9.5}>
                    <Stack spacing={4} sx={{ mt: 1 }} direction="row" justifyContent="space-between">
                      <TextField
                        type="number"
                        size="small"
                        label="Key Total Manual Defect(pcs)"
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
                      {product?.activePcs && (
                        <>
                          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>{`Yield ${yieldValue}%`}</Typography>
                          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>{`Loss ${lossValue}%`}</Typography>
                          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>{`1 Pcs = ${product?.pscGram} ${product?.secondUnit}`}</Typography>
                        </>
                      )}

                      <Stack spacing={2} direction="row">
                        <TextField
                          type="number"
                          size="small"
                          label="Other(pcs)"
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
                <Stack spacing={4} sx={{ mt: 1 }}>

                  {
                    product?.activePcs ? (
                      <>
                        <TextField
                          type="string"
                          size="small"
                          label="Total Finish Good (FG)"
                          value={`${fgValue} pcs = ${fgValue * (product?.pscGram || 0)} ${product?.secondUnit}`}
                          InputProps={{ readOnly: true }}
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                          type="string"
                          size="small"
                          label="Total Defect(pcs)"
                          value={`${totalAutoDefects + qStats.totalManual} pcs = ${(totalAutoDefects + qStats.totalManual) * (product?.pscGram || 0)} ${product?.secondUnit}`}
                          InputProps={{ readOnly: true, sx: { backgroundColor: '#fdf924' } }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </>

                    ) : (
                      <TextField
                        type="number"
                        size="small"
                        label="Total Defect(pcs)"
                        value={totalAutoDefects + qStats.totalManual}
                        InputProps={{ readOnly: true, sx: { backgroundColor: '#fdf924' } }}
                        InputLabelProps={{ shrink: true }}
                      />
                    )
                  }
                  <TextField
                    type="number"
                    size="small"
                    label="Total Auto Defect(pcs)"
                    value={totalAutoDefects}
                    InputProps={{ readOnly: true }}
                    InputLabelProps={{ shrink: true }}
                  />

                  <TextField
                    type="number"
                    size="small"
                    label="Total Manual Defect(pcs)"
                    value={qStats.totalManual - qStats.totalManualGram}
                    InputProps={{ readOnly: true }}
                    InputLabelProps={{ shrink: true }}
                  />
                  {
                    product?.activePcs && (
                      <>
                        <TextField
                          type="number"
                          size="small"
                          label={`Total Manual ${product?.secondUnit} (1) Defect`}
                          value={qStats.totalManualGram}
                          InputProps={{ readOnly: true }}
                          InputLabelProps={{ shrink: true }}
                          disabled={product?.activePcs !== true}
                        />
                        <TextField
                          type="number"
                          size="small"
                          label={`Total ${product?.secondUnit} Input`}
                          value={totalGram}
                          InputProps={{ readOnly: true }}
                          InputLabelProps={{ shrink: true }}
                          disabled={product?.activePcs !== true}
                        />
                      </>
                    )
                  }
                </Stack>
              </Grid>

              <Grid item xs={12} xl={9.5}>
                <Grid container spacing={3} sx={{ pt: 1, pb: 3 }}>
                  {localQs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                    <Grid item key={row.id} xs={12} lg={6} >
                      <Grid container spacing={2}>
                        <Grid item xs={3.5}>
                          <Typography variant="body2">{getMachineParamName(row)}</Typography>
                        </Grid>

                        <Grid item xs={1.5}>
                          <TextField
                            type="number"
                            size="small"
                            label="Auto(pcs)"
                            value={row.autoAmount}
                            InputProps={{ readOnly: true }}
                          />
                        </Grid>

                        <Grid item xs={3.5}>
                          <Paper elevation={6}>
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
                                label="Manual(pcs)"
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
                          </Paper>
                        </Grid>
                        {product?.activePcs && (
                          <Grid item xs={1.75}>
                            <TextField
                              type="number"
                              size="small"
                              label={`Manual(${product?.secondUnit})`}
                              value={row?.manualAmountGram}
                              InputProps={{ readOnly: true }}
                              onClick={() => handleOpenModal(row)}
                              disabled={product?.activePcs !== true}
                            />
                          </Grid>
                        )}
                        <Grid item xs={1.75}>
                          <TextField
                            type="number"
                            size="small"
                            label="Total(pcs)"
                            value={row.autoAmount + row.manualAmount + (row?.manualAmountGram || 0)}
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

      {/* Modal */}
      <Dialog open={isModalOpen} onClose={handleCloseModal}>
        <DialogTitle>
          {getMachineParamName(rowModal)}
          <Grid container spacing={1} sx={{ mt: 1, borderBottom: '1px solid', pb: 1.25, maxWidth: '300px' }} justifyContent="center">
            <Grid item xs={6}>
              <TextField
                InputProps={{
                  readOnly: true,
                }}
                type="number"
                size="small"
                label="Total(g)"
                value={calculateTotalGrams(rowModal.grams)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                InputProps={{
                  readOnly: true,
                }}
                type="number"
                size="small"
                label="Total(pcs)"
                value={Math.ceil(calculateTotalGrams(rowModal.grams) / pcdGram)}
              />
            </Grid>
          </Grid>
        </DialogTitle>
        <DialogContent sx={{ overflow: 'auto', maxHeight: 'calc(100vh - 500px)', minHeight: 'calc(100vh - 500px)', maxWidth: '400px' }}>
          {rowModal.grams && rowModal.grams?.split(',').map((amount: any, index: any) => (
            <Grid container spacing={1} sx={{ mt: 1 }} justifyContent="center" key={index}>
              <Grid item xs={8}>
                <TextField
                  type="number"
                  size="small"
                  label="Manual(g)"
                  value={amount}
                />
              </Grid>
              <Grid item xs={4}>
                <Button onClick={() => handleDeleteGram(index)}>
                  <CloseIcon />
                </Button>
              </Grid>
            </Grid>
          ))}
        </DialogContent>

        <DialogContent>
          <Grid container spacing={1} sx={{ mt: 1 }} justifyContent="center">
            <Grid item xs={8}>
              <TextField
                type="number"
                size="small"
                label="Manual(g)"
                value={newValueGram}
                onChange={(e) => setNewValueGram(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={4}>
              <Button onClick={() => handleAddGram(newValueGram)}>
                Add
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ padding: '0px 24px 12px !important' }}>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
