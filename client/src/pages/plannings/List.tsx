import FullCalendar, { DateSelectArg, EventClickArg } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import {
  Box,
  Button,
  Card,
  Container,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableContainer,
  TablePagination,
  Tooltip,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';
import { CalendarView, DateRange } from '../../@types/calendar';
import { FilterPlanning } from '../../@types/planning';
import { DialogAnimate } from '../../components/animate';
import DeleteConfirmationDialog from '../../components/DeleteConfirmationDialog';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import Iconify from '../../components/Iconify';
import Page from '../../components/Page';
import Scrollbar from '../../components/Scrollbar';
import { TableHeadCustom, TableNoData, TableSelectedActions, TableSkeleton } from '../../components/table';
import { ROWS_PER_PAGE_OPTIONS } from '../../constants';
import useResponsive from '../../hooks/useResponsive';
import useTable from '../../hooks/useTable';
import {
  closeModal,
  deletePlanning,
  deletePlannings,
  filterPlannings,
  getPlanningsByRange,
  selectPlanning,
  selectRange,
  setPlanningFilterTerm,
} from '../../redux/actions/calendarAction';
import { RootState, useDispatch, useSelector } from '../../redux/store';
import {
  PlanningCalendarForm,
  PlanningCalendarStyle,
  PlanningCalendarToolbar,
} from '../../sections/plannings/calendar';
import { PlanningTableRow, PlanningTableToolbar } from '../../sections/plannings/list';
import dayjs from 'dayjs';
import PlanningCalendarUploadDialog from '../../sections/plannings/calendar/PlanningCalendarUploadDialog';

const TABLE_HEAD = [
  { id: 'startDate', label: 'Start', align: 'left' },
  { id: 'endDate', label: 'End', align: 'left' },
  { id: 'title', label: 'Title', align: 'left' },
  { id: 'productionName', label: 'Production', align: 'left' },
  { id: 'product', label: 'Product', align: 'left' },
  { id: 'user', label: 'User', align: 'left' },
  { id: 'plannedQuantity', label: 'Planned', align: 'left' },
  { id: '' },
];

export default function PlanningList() {
  const {
    dense,
    page,
    rowsPerPage,
    setPage,
    selected,
    setSelected,
    onSelectRow,
    onSelectAllRows,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable();

  const { enqueueSnackbar } = useSnackbar();

  const dispatch = useDispatch();

  const { events, selectedRange, filteredPlannings, currentPlanning, isLoading, isOpenModal } = useSelector(
    (state: RootState) => state.calendar,
  );

  const isDesktop = useResponsive('up', 'sm');

  const calendarRef = useRef<FullCalendar>(null);

  const [date, setDate] = useState(new Date());

  const [view, setView] = useState<CalendarView>(isDesktop ? 'dayGridMonth' : 'listWeek');

  const [viewRange, setViewRange] = useState<DateRange | null>(null);

  const [filterName, setFilterName] = useState<string>('');

  const refreshViewRange = (calendarEl: FullCalendar | null) => {
    if (!calendarEl) {
      return;
    }

    const { currentStart } = calendarEl.getApi().view;
    const range = {
      start: dayjs(currentStart).startOf('M').toDate(),
      end: dayjs(currentStart).endOf('M').toDate(),
    };
    setViewRange(range);
    refreshData(range);
  };

  useEffect(() => {
    refreshViewRange(calendarRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshData = (range: DateRange | null) => {
    if (!range) {
      return;
    }

    const { start, end } = range;
    const filter: FilterPlanning = {
      start,
      end,
    };

    (async () => {
      await dispatch(getPlanningsByRange(filter));
      dispatch(
        selectRange({
          start: dayjs().startOf('d').toDate(),
          end: dayjs().startOf('d').add(1, 'd').toDate(),
        }),
      );
      dispatch(filterPlannings());
    })();
  };

  const handleFilterName = (filterName: string) => {
    setFilterName(filterName);
    dispatch(setPlanningFilterTerm(filterName));
  };

  const handleSearch = async () => {
    setPage(0);
    dispatch(filterPlannings());
  };

  const handleDeleteRow = async (id: number) => {
    await dispatch(deletePlanning(id));
    dispatch(filterPlannings());
  };

  const handleDeleteRows = async (selectedIds: number[]) => {
    await dispatch(deletePlannings(selectedIds));
    dispatch(filterPlannings());
    setSelected([]);
  };

  const handleEditRow = (id: number) => {
    dispatch(selectPlanning({ id }));
  };

  const handleDuplicateRow = (id: number) => {
    dispatch(selectPlanning({ id, isDuplicate: true }));
  };

  const denseHeight = dense ? 60 : 80;

  const isNotFound = !isLoading && !filteredPlannings.length;

  useEffect(() => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      const newView = isDesktop ? 'dayGridMonth' : 'listWeek';
      calendarApi.changeView(newView);
      setView(newView);
    }
  }, [isDesktop]);

  const handleClickToday = () => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      calendarApi.today();
      setDate(calendarApi.getDate());
    }
  };

  const handleChangeView = (newView: CalendarView) => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      calendarApi.changeView(newView);
      setView(newView);
    }
  };

  const handleClickDatePrev = () => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      calendarApi.prev();

      calendarApi.select(calendarApi.getDate());
      setDate(calendarApi.getDate());
      refreshViewRange(calendarEl);
    }
  };

  const handleClickDateNext = () => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      calendarApi.next();

      calendarApi.select(calendarApi.getDate());
      setDate(calendarApi.getDate());
      refreshViewRange(calendarEl);
    }
  };

  const handleSelectDate = (arg: DateSelectArg) => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      setDate(arg.start);
    }

    setPage(0);
    dispatch(selectRange({ start: arg.start, end: arg.end }));
    dispatch(filterPlannings());
  };

  const handleAdd = () => {
    dispatch(selectPlanning({ id: null }));
  };

  const handleSelectEvent = (arg: EventClickArg) => {
    const id = Number(arg.event.id);

    dispatch(selectPlanning({ id }));
  };

  const handleCloseModal = (refresh: boolean) => {
    dispatch(closeModal());

    if (refresh) {
      refreshData(viewRange);
    }
  };

  const handleDialogDelete = async () => {
    if (!currentPlanning) {
      return;
    }

    await handleDeleteRow(currentPlanning.id);
    enqueueSnackbar('Delete success!');
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

  const [openUploadDialog, setOpenUploadDialog] = useState<boolean>(false);

  const handleUploadClose = (success?: boolean) => {
    if (success) {
      refreshData(viewRange);
      enqueueSnackbar('Upload completed');
    }

    setOpenUploadDialog(false);
  };

  return (
    <Page title="Plannings">
      <Container maxWidth={false}>
        <HeaderBreadcrumbs
          heading="Plannings"
          links={[
            { name: 'Home', href: '/' },
            {
              name: 'Plannings',
            },
          ]}
          action={
            <Stack spacing={1} direction="row">
              <Button variant="outlined" component="label" onClick={() => setOpenUploadDialog(true)}>
                Import Excel
              </Button>

              <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={() => handleAdd()}>
                New
              </Button>
            </Stack>
          }
        />

        <Stack spacing={3}>
          <Card>
            <PlanningCalendarStyle>
              <PlanningCalendarToolbar
                date={date}
                view={view}
                onNextDate={handleClickDateNext}
                onPrevDate={handleClickDatePrev}
                onToday={handleClickToday}
                onChangeView={handleChangeView}
              />
              <FullCalendar
                weekends
                // editable
                // droppable
                selectable
                unselectAuto={false}
                events={events}
                ref={calendarRef}
                rerenderDelay={10}
                initialDate={date}
                initialView={view}
                dayMaxEventRows={3}
                eventDisplay="block"
                headerToolbar={false}
                allDayMaintainDuration
                // eventResizableFromStart
                select={handleSelectDate}
                // eventDrop={handleDropEvent}
                eventClick={handleSelectEvent}
                // eventResize={handleResizeEvent}
                height={isDesktop ? 720 : 'auto'}
                plugins={[listPlugin, dayGridPlugin, timelinePlugin, timeGridPlugin, interactionPlugin]}
              />
            </PlanningCalendarStyle>
          </Card>

          <Card>
            <PlanningTableToolbar filterName={filterName} onFilterName={handleFilterName} onSearch={handleSearch} />
            <Scrollbar>
              <TableContainer sx={{ minWidth: 800, mt: 1 }}>
                {selected.length > 0 && (
                  <TableSelectedActions
                    dense={dense}
                    numSelected={selected.length}
                    rowCount={filteredPlannings.length}
                    onSelectAllRows={(checked) =>
                      onSelectAllRows(
                        checked,
                        filteredPlannings.map((row) => row.id),
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
                    // order={order}
                    // orderBy={orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={filteredPlannings.length}
                    numSelected={selected.length}
                    // onSort={onSort}
                    onSelectAllRows={(checked) =>
                      onSelectAllRows(
                        checked,
                        filteredPlannings.map((row) => row.id),
                      )
                    }
                  />

                  <TableBody>
                    {(isLoading ? [...Array(rowsPerPage)] : filteredPlannings)
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row, index) =>
                        row ? (
                          <PlanningTableRow
                            key={'row_' + row.id}
                            row={row}
                            selected={selected.includes(row.id)}
                            onSelectRow={() => onSelectRow(row.id)}
                            onDeleteRow={() => handleOpenDeleteDialog([row.id])}
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
                rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                component="div"
                count={filteredPlannings.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={onChangePage}
                onRowsPerPageChange={onChangeRowsPerPage}
              />
            </Box>
          </Card>
        </Stack>

        <DialogAnimate open={isOpenModal} onClose={() => handleCloseModal(false)}>
          <DialogTitle>{currentPlanning ? 'Edit Event' : 'Add Event'}</DialogTitle>

          <PlanningCalendarForm
            currentPlanning={currentPlanning}
            range={selectedRange}
            onDelete={handleDialogDelete}
            onClose={(refresh) => handleCloseModal(refresh)}
          />
        </DialogAnimate>

        <DeleteConfirmationDialog
          id="confirmDeleting"
          title="Confirmation"
          content="Do you want to delete?"
          keepMounted
          open={openDeleteDialog}
          onClose={handleConfirmDelete}
        />

        <PlanningCalendarUploadDialog keepMounted open={openUploadDialog} onClose={handleUploadClose} />
      </Container>
    </Page>
  );
}
