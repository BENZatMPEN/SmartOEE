import {
  Box,
  Card,
  CardContent,
  Container,
  Table,
  TableBody,
  TableContainer,
  TablePagination,
  Typography,
} from '@mui/material';
import { saveAs } from 'file-saver';
import { useEffect, useState } from 'react';
import { FilterOeeBatch } from '../../../@types/oeeBatch';
import Page from '../../../components/Page';
import Scrollbar from '../../../components/Scrollbar';
import { TableHeadCustom, TableNoData, TableSkeleton } from '../../../components/table';
import { ROWS_PER_PAGE_OPTIONS } from '../../../constants';
import useTable from '../../../hooks/useTable';
import { getOeeBatchPagedList } from '../../../redux/actions/oeeBatchAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import DashboardHistoryTableRow from '../../../sections/dashboard/details/history/list/DashboardHistoryTableRow';
import axios from '../../../utils/axios';

const TABLE_HEAD = [
  { id: 'productionName', label: 'Production Name', align: 'left' },
  { id: 'lotNumber', label: 'Lot Number', align: 'left' },
  { id: 'batchStartedDate', label: 'Start', align: 'left' },
  { id: 'batchStoppedDate', label: 'End', align: 'left' },
  { id: '' },
];

export default function History() {
  const { dense, page, order, orderBy, rowsPerPage, setPage, selected, onSort, onChangePage, onChangeRowsPerPage } =
    useTable({
      defaultOrderBy: 'createdAt',
      defaultOrder: 'desc',
    });

  const dispatch = useDispatch();

  const { selectedOee } = useSelector((state: RootState) => state.oee);

  const { batchPagedList } = useSelector((state: RootState) => state.oeeBatch);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      await refreshData();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, orderBy, page, rowsPerPage]);

  const refreshData = async () => {
    setIsLoading(true);

    if (!selectedOee) {
      setPage(0);
      setIsLoading(false);
      return;
    }

    try {
      const filter: FilterOeeBatch = {
        order: order,
        orderBy: orderBy,
        page: page,
        rowsPerPage: rowsPerPage,
        oeeId: selectedOee.id,
      };

      await dispatch(getOeeBatchPagedList(filter));
      setIsLoading(false);
    } catch (error) {
      setPage(0);
      setIsLoading(false);
      console.log(error);
    }
  };

  const handleExportRow = async (id: number) => {
    const response = await axios({
      url: `oee-batches/${id}/download-logs`, //your url
      method: 'GET',
      responseType: 'blob', // important
    });

    saveAs(new Blob([response.data]), `oee-batch-${id}-logs.xlsx`);
  };

  const denseHeight = dense ? 60 : 80;

  const isNotFound = !isLoading && !batchPagedList.list.length;

  return (
    <Page title="History">
      <Container maxWidth={false}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          History
        </Typography>

        <Card>
          <CardContent>
            <Scrollbar>
              <TableContainer sx={{ minWidth: 800 }}>
                <Table size={'medium'}>
                  <TableHeadCustom
                    order={order}
                    orderBy={orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={batchPagedList.list.length}
                    numSelected={selected.length}
                    onSort={onSort}
                  />

                  <TableBody>
                    {(isLoading ? [...Array(rowsPerPage)] : batchPagedList.list).map((row, index) =>
                      row ? (
                        <DashboardHistoryTableRow
                          key={'row_' + row.id}
                          row={row}
                          selected={selected.includes(row.id)}
                          onExportRow={() => handleExportRow(row.id)}
                        />
                      ) : (
                        !isNotFound && <TableSkeleton key={'skl_' + index} sx={{ height: denseHeight }} />
                      ),
                    )}

                    <TableNoData key={'noData'} isNotFound={isNotFound} />
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>

            <Box sx={{ position: 'relative' }}>
              <TablePagination
                rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                component="div"
                count={batchPagedList.count}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={onChangePage}
                onRowsPerPageChange={onChangeRowsPerPage}
              />
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Page>
  );
}
