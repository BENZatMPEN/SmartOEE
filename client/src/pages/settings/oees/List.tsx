import {
  Box,
  Button,
  Card,
  Container,
  IconButton,
  Table,
  TableBody,
  TableContainer,
  TablePagination,
  Tooltip,
} from '@mui/material';
import { paramCase } from 'change-case';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FilterOee, Oee } from '../../../@types/oee';
import HeaderBreadcrumbs from '../../../components/HeaderBreadcrumbs';
import Iconify from '../../../components/Iconify';
import Page from '../../../components/Page';
import Scrollbar from '../../../components/Scrollbar';
import { TableHeadCustom, TableNoData, TableSelectedActions, TableSkeleton } from '../../../components/table';
import useTable from '../../../hooks/useTable';
import { RootState, useSelector } from '../../../redux/store';
import { PATH_SETTINGS } from '../../../routes/paths';
import { OEETableRow, OEETableToolbar } from '../../../sections/settings/oee/list';
import axios from '../../../utils/axios';

const TABLE_HEAD = [
  { id: 'oeeCode', label: 'OEE Code', align: 'left' },
  { id: 'machineCode', label: 'M/C Code', align: 'left' },
  { id: 'machineName', label: 'Machine Name', align: 'left' },
  { id: 'location', label: 'Location', align: 'left' },
  { id: 'oeeType', label: 'OEE Type', align: 'left' },
  { id: '' },
];

type OeePagedList = {
  list: Oee[];
  count: number;
};

export default function OEEList() {
  const {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    selected,
    setSelected,
    onSelectRow,
    onSelectAllRows,
    onSort,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable({
    defaultOrderBy: 'createdAt',
    defaultOrder: 'desc',
  });

  const navigate = useNavigate();

  const [pagedList, setPagedList] = useState<OeePagedList>({ list: [], count: 0 });

  const [filterName, setFilterName] = useState('');

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { selectedSite } = useSelector((state: RootState) => state.site);

  useEffect(() => {
    (async () => {
      await refreshData();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, orderBy, page, rowsPerPage]);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const params: FilterOee = {
        search: filterName,
        order: order,
        orderBy: orderBy,
        page: page,
        rowsPerPage: rowsPerPage,
        siteId: selectedSite?.id,
      };
      const response = await axios.get<OeePagedList>('/oees', { params });
      setPagedList(response.data);
      setIsLoading(false);
    } catch (error) {
      setPagedList({ list: [], count: 0 });
      setPage(0);
      setIsLoading(false);
      console.log(error);
    }
  };

  const handleFilterName = (filterName: string) => {
    setFilterName(filterName);
  };

  const handleSearch = async () => {
    setPage(0);
    await refreshData();
  };

  const handleDeleteRow = async (id: number) => {
    try {
      await axios.delete(`/oees/${id}`);
      await refreshData();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteRows = async (selectedIds: number[]) => {
    try {
      await axios.delete(`/oees`, {
        params: { ids: selectedIds },
      });
      await refreshData();
      setSelected([]);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditRow = (id: number) => {
    navigate(PATH_SETTINGS.oees.edit(paramCase(id.toString())));
  };

  const handleDuplicateRow = (id: number) => {
    navigate(PATH_SETTINGS.oees.duplicate(paramCase(id.toString())));
  };

  const denseHeight = dense ? 60 : 80;

  const isNotFound = (!pagedList.list.length && !!filterName) || (!isLoading && !pagedList.list.length);

  return (
    <Page title="OEE Settings - OEE List">
      <Container maxWidth={false}>
        <HeaderBreadcrumbs
          heading="OEE List"
          links={[
            { name: 'Home', href: '/' },
            {
              name: 'OEEs',
            },
          ]}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
              component={RouterLink}
              to={PATH_SETTINGS.oees.new}
            >
              New
            </Button>
          }
        />

        <Card>
          <OEETableToolbar filterName={filterName} onFilterName={handleFilterName} onSearch={handleSearch} />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              {selected.length > 0 && (
                <TableSelectedActions
                  dense={dense}
                  numSelected={selected.length}
                  rowCount={pagedList.list.length}
                  onSelectAllRows={(checked) =>
                    onSelectAllRows(
                      checked,
                      pagedList.list.map((row) => row.id),
                    )
                  }
                  actions={
                    <Tooltip title="Delete">
                      <IconButton color="primary" onClick={() => handleDeleteRows(selected)}>
                        <Iconify icon={'eva:trash-2-outline'} />
                      </IconButton>
                    </Tooltip>
                  }
                />
              )}

              <Table size={dense ? 'small' : 'medium'}>
                <TableHeadCustom
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={pagedList.list.length}
                  numSelected={selected.length}
                  onSort={onSort}
                  onSelectAllRows={(checked) =>
                    onSelectAllRows(
                      checked,
                      pagedList.list.map((row) => row.id),
                    )
                  }
                />

                <TableBody>
                  {(isLoading ? [...Array(rowsPerPage)] : pagedList.list).map((row, index) =>
                    row ? (
                      <OEETableRow
                        key={'row_' + row.id}
                        row={row}
                        selected={selected.includes(row.id)}
                        onSelectRow={() => onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        onDuplicateRow={() => handleDuplicateRow(row.id)}
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
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={pagedList.count}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={onChangePage}
              onRowsPerPageChange={onChangeRowsPerPage}
            />
          </Box>
        </Card>
      </Container>
    </Page>
  );
}
