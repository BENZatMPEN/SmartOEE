import { Box, Card, Table, TableBody, TableCell, TableContainer, TablePagination, TableRow } from '@mui/material';
import dayjs from 'dayjs';
import { saveAs } from 'file-saver';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlarmHistory, FilterHistoryLog, HistoryLog } from '../../../@types/history-log';
import Scrollbar from '../../../components/Scrollbar';
import { TableHeadCustom, TableNoData, TableSkeleton } from '../../../components/table';
import { HISTORY_LOG_TYPE_ALARM, ROWS_PER_PAGE_OPTIONS } from '../../../constants';
import useTable from '../../../hooks/useTable';
import { FaqTableRow } from '../../../sections/faqs/list';
import { HistoryTableToolbar } from '../../../sections/history';
import axios from '../../../utils/axios';
import { fDate, fTime } from '../../../utils/formatTime';

const TABLE_HEAD = [
  { id: 'createdAt', label: 'Date', align: 'center' },
  { id: 'createdAt', label: 'Time', align: 'center' },
  { id: 'message', label: 'Message', align: 'left' },
  // { id: 'details', label: 'Details', align: 'left' },
  { id: '' },
];

type HistoryPagedList = {
  list: HistoryLog[];
  count: number;
};

export default function HistoryAlarm() {
  const { dense, page, order, orderBy, rowsPerPage, setPage, onSort, onChangePage, onChangeRowsPerPage } = useTable({
    defaultOrderBy: 'createdAt',
    defaultOrder: 'desc',
  });

  const navigate = useNavigate();

  const [pagedList, setPagedList] = useState<HistoryPagedList>({ list: [], count: 0 });

  const [filterName, setFilterName] = useState('');

  const [fromDate, setFromDate] = useState<Date>(dayjs(new Date()).add(-7, 'd').startOf('d').toDate());

  const [toDate, setToDate] = useState<Date>(dayjs(new Date()).endOf('d').toDate());

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      await refreshData();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, orderBy, page, rowsPerPage]);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const params: FilterHistoryLog = {
        search: filterName,
        order: order,
        orderBy: orderBy,
        page: page,
        rowsPerPage: rowsPerPage,
        fromDate: fromDate,
        toDate: toDate,
        type: HISTORY_LOG_TYPE_ALARM,
      };

      const response = await axios.get<HistoryPagedList>('/history-logs', { params });
      setPagedList(response.data);
      setIsLoading(false);
    } catch (error) {
      setPagedList({ list: [], count: 0 });
      setPage(0);
      setIsLoading(false);
      console.log(error);
    }
  };

  const handleSearch = async () => {
    setPage(0);
    await refreshData();
  };

  const handleExport = async () => {
    const params: FilterHistoryLog = {
      search: filterName,
      order: order,
      orderBy: orderBy,
      page: page,
      rowsPerPage: rowsPerPage,
      fromDate: fromDate,
      toDate: toDate,
      type: HISTORY_LOG_TYPE_ALARM,
    };

    const response = await axios({
      url: `/history-logs/export`,
      method: 'GET',
      params: params,
      responseType: 'blob',
    });

    saveAs(new Blob([response.data]), `alarm-logs.xlsx`);
  };

  const denseHeight = dense ? 60 : 80;

  const isNotFound = (!pagedList.list.length && !!filterName) || (!isLoading && !pagedList.list.length);

  return (
    <Card>
      <HistoryTableToolbar
        filterName={filterName}
        fromDate={fromDate}
        toDate={toDate}
        onFilterName={(filterName) => {
          setFilterName(filterName);
        }}
        onFromDate={(date) => {
          setFromDate(date);
        }}
        onToDate={(date) => {
          setToDate(date);
        }}
        onSearch={handleSearch}
        onExport={handleExport}
      />
      <Scrollbar>
        <TableContainer sx={{ minWidth: 800 }}>
          <Table size={'medium'}>
            <TableHeadCustom
              order={order}
              orderBy={orderBy}
              headLabel={TABLE_HEAD}
              rowCount={pagedList.list.length}
              onSort={onSort}
            />

            <TableBody>
              {(isLoading ? [...Array(rowsPerPage)] : pagedList.list).map((row, index) =>
                row ? (
                  <TableRow key={`row_${row.id}`} hover>
                    <TableCell align="center">{fDate(row.createdAt)}</TableCell>

                    <TableCell align="center">{fTime(row.createdAt)}</TableCell>

                    {/*<TableCell align="left">{productionName}</TableCell>*/}

                    <TableCell align="left">{row.message}</TableCell>
                  </TableRow>
                ) : (
                  !isNotFound && <TableSkeleton key={'skl_' + index} sx={{ height: denseHeight }} />
                ),
              )}

              {/*{(isLoading ? [...Array(rowsPerPage)] : pagedList.list).map((row, index) => {*/}
              {/*  return row*/}
              {/*    ? () => {*/}
              {/*        const { id, message, createdAt } = row;*/}
              {/*        // const { productionName }: AlarmHistory = data;*/}

              {/*        return <TableRow key={'row_' + id}></TableRow>;*/}
              {/*        // return (*/}
              {/*        //   <TableRow key={id} hover>*/}
              {/*        //     <TableCell align="center">{fDate(createdAt)}</TableCell>*/}
              {/*        //*/}
              {/*        //     <TableCell align="center">{fTime(createdAt)}</TableCell>*/}
              {/*        //*/}
              {/*        //     /!*<TableCell align="left">{productionName}</TableCell>*!/*/}
              {/*        //*/}
              {/*        //     <TableCell align="left">{message}</TableCell>*/}
              {/*        //   </TableRow>*/}
              {/*        // );*/}
              {/*      }*/}
              {/*    : !isNotFound && <TableSkeleton key={'skl_' + index} sx={{ height: denseHeight }} />;*/}
              {/*})}*/}

              <TableNoData key={'noData'} isNotFound={isNotFound} />
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>

      <Box sx={{ position: 'relative' }}>
        <TablePagination
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          component="div"
          count={pagedList.count}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={onChangePage}
          onRowsPerPageChange={onChangeRowsPerPage}
        />
      </Box>
    </Card>
  );
}
