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
import { FilterUser } from '../../../@types/user';
import DeleteConfirmationDialog from '../../../components/DeleteConfirmationDialog';
import HeaderBreadcrumbs from '../../../components/HeaderBreadcrumbs';
import Iconify from '../../../components/Iconify';
import Page from '../../../components/Page';
import Scrollbar from '../../../components/Scrollbar';
import { TableHeadCustom, TableNoData, TableSelectedActions, TableSkeleton } from '../../../components/table';
import { ROWS_PER_PAGE_OPTIONS } from '../../../constants';
import useTable from '../../../hooks/useTable';
import { deleteUser, deleteUsers, getUserPagedList } from '../../../redux/actions/userAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import { PATH_PAGES, PATH_SETTINGS } from '../../../routes/paths';
import { UserTableRow, UserTableToolbar } from '../../../sections/settings/users/list';
import { AbilityContext } from '../../../caslContext';
import { RoleAction, RoleSubject } from '../../../@types/role';

const TABLE_HEAD = [
  { id: 'firstName', label: 'First Name', align: 'left', sort: true },
  { id: 'lastName', label: 'Last Name', align: 'left', sort: true },
  { id: 'email', label: 'Email', align: 'left', sort: true },
  { id: 'createdAt', label: 'Created Date', align: 'left', sort: true },
  { id: '' },
];

export default function UserList() {
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

  const dispatch = useDispatch();

  const { pagedList, isLoading } = useSelector((state: RootState) => state.user);

  const [filterName, setFilterName] = useState<string>('');

  useEffect(() => {
    (async () => {
      await refreshData(filterName);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, orderBy, page, rowsPerPage]);

  const refreshData = async (filterTerm: string = '') => {
    const filter: FilterUser = {
      search: filterTerm,
      order: order,
      orderBy: orderBy,
      page: page,
      rowsPerPage: rowsPerPage,
    };

    await dispatch(getUserPagedList(filter));
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
    await dispatch(deleteUser(id));
    await refreshData(filterName);
  };

  const handleDeleteRows = async (selectedIds: number[]) => {
    await dispatch(deleteUsers(selectedIds));
    await refreshData(filterName);
    setSelected([]);
  };

  const handleEditRow = (id: number) => {
    navigate(PATH_SETTINGS.users.edit(paramCase(id.toString())));
  };

  const handleDuplicateRow = (id: number) => {
    navigate(PATH_SETTINGS.users.duplicate(paramCase(id.toString())));
  };

  const handleChangePasswordRow = (id: number) => {
    navigate(PATH_SETTINGS.users.changePassword(paramCase(id.toString())));
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

  if (!ability.can(RoleAction.Read, RoleSubject.UserSettings)) {
    return <Navigate to={PATH_PAGES.forbidden} />;
  }

  return (
    <Page title="Administrator - User List">
      <Container maxWidth={false}>
        <HeaderBreadcrumbs
          heading="User List"
          links={[
            { name: 'Home', href: '/' },
            {
              name: 'Users',
            },
          ]}
          {...(ability.can(RoleAction.Create, RoleSubject.UserSettings)
            ? {
                action: (
                  <Button
                    variant="contained"
                    startIcon={<Iconify icon="eva:plus-fill" />}
                    component={RouterLink}
                    to={PATH_SETTINGS.users.new}
                  >
                    New
                  </Button>
                ),
              }
            : undefined)}
        />

        <Card>
          <UserTableToolbar
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
                      <UserTableRow
                        key={'row_' + row.id}
                        row={row}
                        selected={selected.includes(row.id)}
                        onSelectRow={() => onSelectRow(row.id)}
                        onDeleteRow={() => handleOpenDeleteDialog([row.id])}
                        onEditRow={() => handleEditRow(row.id)}
                        onDuplicateRow={() => handleDuplicateRow(row.id)}
                        onChangePasswordRow={() => handleChangePasswordRow(row.id)}
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
