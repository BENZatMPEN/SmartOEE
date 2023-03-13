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
import { useContext, useEffect, useState } from 'react';
import { Link as RouterLink, Navigate, useNavigate } from 'react-router-dom';
import { FilterDevice } from '../../../@types/device';
import DeleteConfirmationDialog from '../../../components/DeleteConfirmationDialog';
import HeaderBreadcrumbs from '../../../components/HeaderBreadcrumbs';
import Iconify from '../../../components/Iconify';
import Page from '../../../components/Page';
import Scrollbar from '../../../components/Scrollbar';
import { TableHeadCustom, TableNoData, TableSelectedActions, TableSkeleton } from '../../../components/table';
import { ROWS_PER_PAGE_OPTIONS } from '../../../constants';
import useTable from '../../../hooks/useTable';
import { deleteDevice, deleteDevices, getDevicePagedList } from '../../../redux/actions/deviceAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import { PATH_PAGES, PATH_SETTINGS } from '../../../routes/paths';
import { DeviceTableRow, DeviceTableToolbar } from '../../../sections/settings/devices/list';
import { AbilityContext } from '../../../caslContext';
import { RoleAction, RoleSubject } from '../../../@types/role';

const TABLE_HEAD = [
  { id: 'name', label: 'Name', align: 'left', sort: true },
  { id: 'address', label: 'Address', align: 'left', sort: false },
  { id: 'port', label: 'Port', align: 'left', sort: false },
  { id: 'deviceId', label: 'ID', align: 'left', sort: false },
  { id: 'modelType', label: 'Model', align: 'left', sort: false },
  { id: 'connection', label: 'Connection', align: 'left', sort: false },
  { id: 'stopped', label: 'Status', align: 'center', sort: false },
  { id: 'remark', label: 'Remark', align: 'left', sort: false },
  { id: '' },
];

export default function DeviceList() {
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
    defaultOrderBy: 'name',
    defaultOrder: 'asc',
  });

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const { pagedList, isLoading } = useSelector((state: RootState) => state.device);

  const [filterName, setFilterName] = useState<string>('');

  useEffect(() => {
    (async () => {
      await refreshData(filterName);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, orderBy, page, rowsPerPage]);

  const refreshData = async (filterTerm: string = '') => {
    const filter: FilterDevice = {
      search: filterTerm,
      order: order,
      orderBy: orderBy,
      page: page,
      rowsPerPage: rowsPerPage,
    };

    await dispatch(getDevicePagedList(filter));
  };

  const handleSearch = async () => {
    setPage(0);
    await refreshData(filterName);
  };

  const handleReset = async () => {
    setPage(0);
    setFilterName('');
    await refreshData();
  };

  const handleDeleteRow = async (id: number) => {
    await dispatch(deleteDevice(id));
    await refreshData(filterName);
  };

  const handleDeleteRows = async (selectedIds: number[]) => {
    await dispatch(deleteDevices(selectedIds));
    await refreshData(filterName);
    setSelected([]);
  };

  const handleDetailRow = (id: number) => {
    navigate(PATH_SETTINGS.devices.details(paramCase(id.toString())));
  };

  const handleEditRow = (id: number) => {
    navigate(PATH_SETTINGS.devices.edit(paramCase(id.toString())));
  };

  const handleDuplicateRow = (id: number) => {
    navigate(PATH_SETTINGS.devices.duplicate(paramCase(id.toString())));
  };

  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  const [deletingItems, setDeletingItems] = useState<number[]>([]);

  const handleOpenDeleteDialog = async (ids: number[]) => {
    setOpenDeleteDialog(true);
    setDeletingItems(ids);
  };

  const handleConfirmDelete = async (confirm?: boolean) => {
    if (!confirm) {
      setOpenDeleteDialog(false);
      return;
    }

    if (deletingItems.length === 1 && selected.length === 0) {
      await handleDeleteRow(deletingItems[0]);
    } else {
      await handleDeleteRows(deletingItems);
    }

    setOpenDeleteDialog(false);
  };

  const denseHeight = dense ? 60 : 80;

  const isNotFound = (!pagedList.list.length && !!filterName) || (!isLoading && !pagedList.list.length);

  const ability = useContext(AbilityContext);

  if (!ability.can(RoleAction.Read, RoleSubject.DeviceSettings)) {
    return <Navigate to={PATH_PAGES.forbidden} />;
  }

  return (
    <Page title="Settings - Device List">
      <Container maxWidth={false}>
        <HeaderBreadcrumbs
          heading="Device List"
          links={[
            { name: 'Home', href: '/' },
            {
              name: 'Devices',
            },
          ]}
          {...(ability.can(RoleAction.Create, RoleSubject.DeviceSettings)
            ? {
                action: (
                  <Button
                    variant="contained"
                    startIcon={<Iconify icon="eva:plus-fill" />}
                    component={RouterLink}
                    to={PATH_SETTINGS.devices.new}
                  >
                    New
                  </Button>
                ),
              }
            : undefined)}
        />

        <Card>
          <DeviceTableToolbar
            filterName={filterName}
            onFilterName={setFilterName}
            onSearch={handleSearch}
            onReset={handleReset}
          />

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
                      <IconButton color="primary" onClick={() => handleOpenDeleteDialog(selected)}>
                        <Iconify icon={'eva:trash-2-outline'} />
                      </IconButton>
                    </Tooltip>
                  }
                />
              )}

              <Table size={'medium'}>
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
                      <DeviceTableRow
                        key={'row_' + row.id}
                        row={row}
                        selected={selected.includes(row.id)}
                        onSelectRow={() => onSelectRow(row.id)}
                        onDeleteRow={() => handleOpenDeleteDialog([row.id])}
                        onEditRow={() => handleEditRow(row.id)}
                        onDuplicateRow={() => handleDuplicateRow(row.id)}
                        onDetailsRow={() => handleDetailRow(row.id)}
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
              count={pagedList.count}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={onChangePage}
              onRowsPerPageChange={onChangeRowsPerPage}
            />
          </Box>
        </Card>

        <DeleteConfirmationDialog
          id="confirmDeleting"
          title="Confirmation"
          content="Do you want to delete?"
          keepMounted
          open={openDeleteDialog}
          onClose={handleConfirmDelete}
        />
      </Container>
    </Page>
  );
}
