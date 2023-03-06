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
import { FilterProblemSolution } from '../../@types/problemSolution';
import DeleteConfirmationDialog from '../../components/DeleteConfirmationDialog';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import Iconify from '../../components/Iconify';
import Page from '../../components/Page';
import Scrollbar from '../../components/Scrollbar';
import { TableHeadCustom, TableNoData, TableSelectedActions, TableSkeleton } from '../../components/table';
import { ROWS_PER_PAGE_OPTIONS } from '../../constants';
import useTable from '../../hooks/useTable';
import {
  deleteProblemSolution,
  deleteProblemSolutions,
  getProblemSolutionPagedList,
} from '../../redux/actions/problemSolutionAction';
import { RootState, useDispatch, useSelector } from '../../redux/store';
import { PATH_PAGES, PATH_PROBLEMS_SOLUTIONS, PATH_SETTINGS } from '../../routes/paths';
import { ProblemSolutionTableRow, ProblemSolutionTableToolbar } from '../../sections/problems-solutions/list';
import { AbilityContext } from '../../caslContext';
import { RoleAction, RoleSubject } from '../../@types/role';

const TABLE_HEAD = [
  { id: 'id', label: 'Project Code', align: 'left' },
  { id: 'name', label: 'Project Name', align: 'left' },
  { id: 'headProjectUserId', label: 'Project Head', align: 'left' },
  { id: 'approvedByUserId', label: 'Approved By', align: 'left' },
  { id: 'startDate', label: 'Timeline', align: 'left' },
  { id: 'status', label: 'Project Status', align: 'left' },
  { id: '' },
];

export default function ProblemSolutionList() {
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

  const { pagedList, isLoading } = useSelector((state: RootState) => state.problemSolution);

  const [filterName, setFilterName] = useState('');

  useEffect(() => {
    (async () => {
      await refreshData();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, orderBy, page, rowsPerPage]);

  const refreshData = async () => {
    const filter: FilterProblemSolution = {
      search: filterName,
      order: order,
      orderBy: orderBy,
      page: page,
      rowsPerPage: rowsPerPage,
    };

    await dispatch(getProblemSolutionPagedList(filter));
  };

  const handleFilterName = (filterName: string) => {
    setFilterName(filterName);
  };

  const handleSearch = async () => {
    setPage(0);
    await refreshData();
  };

  const handleDeleteRow = async (id: number) => {
    await dispatch(deleteProblemSolution(id));
    await refreshData();
  };

  const handleDeleteRows = async (selectedIds: number[]) => {
    await dispatch(deleteProblemSolutions(selectedIds));
    await refreshData();
    setSelected([]);
  };

  const handleDetailRow = (id: number) => {
    navigate(PATH_PROBLEMS_SOLUTIONS.item.details(paramCase(id.toString())));
  };

  const handleEditRow = (id: number) => {
    navigate(PATH_PROBLEMS_SOLUTIONS.item.edit(paramCase(id.toString())));
  };

  const handleDuplicateRow = (id: number) => {
    navigate(PATH_PROBLEMS_SOLUTIONS.item.duplicate(paramCase(id.toString())));
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

  if (!ability.can(RoleAction.Read, RoleSubject.ProblemsAndSolutions)) {
    return <Navigate to={PATH_PAGES.forbidden} />;
  }

  return (
    <Page title="Problems & Solutions">
      <Container maxWidth={false}>
        <HeaderBreadcrumbs
          heading="Problems & Solutions"
          links={[
            { name: 'Home', href: '/' },
            {
              name: 'Problems & Solutions',
            },
          ]}
          {...(ability.can(RoleAction.Create, RoleSubject.UserSettings)
            ? {
                action: (
                  <Button
                    variant="contained"
                    startIcon={<Iconify icon="eva:plus-fill" />}
                    component={RouterLink}
                    to={PATH_PROBLEMS_SOLUTIONS.item.new}
                  >
                    New
                  </Button>
                ),
              }
            : undefined)}
        />

        <Card>
          <ProblemSolutionTableToolbar
            filterName={filterName}
            onFilterName={handleFilterName}
            onSearch={handleSearch}
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
                      <ProblemSolutionTableRow
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
