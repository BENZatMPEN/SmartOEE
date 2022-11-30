import FullCalendar, { DateSelectArg, EventClickArg } from '@fullcalendar/react';
import { EventInput } from '@fullcalendar/common';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Box,
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
import { useNavigate } from 'react-router-dom';
import { CalendarView, DateRange } from '../../@types/calendar';
import { Planning } from '../../@types/planning';
import { DialogAnimate } from '../../components/animate';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import Iconify from '../../components/Iconify';
import Page from '../../components/Page';
import Scrollbar from '../../components/Scrollbar';
import { TableHeadCustom, TableNoData, TableSelectedActions, TableSkeleton } from '../../components/table';
import { ROWS_PER_PAGE_OPTIONS } from '../../constants';
import useResponsive from '../../hooks/useResponsive';
import useSettings from '../../hooks/useSettings';
import useTable from '../../hooks/useTable';
import {
  PlanningCalendarForm,
  PlanningCalendarStyle,
  PlanningCalendarToolbar,
} from '../../sections/plannings/calendar';
import { PlanningTableRow } from '../../sections/plannings/list';
import axios from '../../utils/axios';

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

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { themeStretch } = useSettings();

  const isDesktop = useResponsive('up', 'sm');

  const calendarRef = useRef<FullCalendar>(null);

  const [date, setDate] = useState(new Date());

  const [view, setView] = useState<CalendarView>(isDesktop ? 'dayGridMonth' : 'listWeek');

  const [plannings, setPlannings] = useState<Planning[]>([]);

  const [events, setEvents] = useState<EventInput[]>([]);

  const [selectedPlanning, setSelectedPlanning] = useState<Planning | null>(null);

  const [selectedRange, setSelectedRange] = useState<DateRange | null>(null);

  const [viewRange, setViewRange] = useState<DateRange | null>(null);

  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

  const refreshViewRange = (calendarEl: FullCalendar | null) => {
    if (!calendarEl) {
      return;
    }

    setViewRange({
      start: calendarEl.getApi().view.activeStart,
      end: calendarEl.getApi().view.activeEnd,
    });
  };

  useEffect(() => {
    refreshViewRange(calendarRef.current);
  }, []);

  useEffect(() => {
    if (!viewRange) {
      return;
    }

    (async () => {
      await refreshData();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewRange]);

  const refreshData = async () => {
    if (!viewRange) {
      return;
    }

    setIsLoading(true);

    try {
      const { start, end } = viewRange;
      const response = await axios.get<Planning[]>('/plannings', { params: { start, end } });
      const { data: plannings } = response;
      setPlannings(plannings);
      setEvents(
        plannings.map((planning) => {
          return {
            id: planning.id.toString(),
            title: planning.title,
            start: planning.startDate,
            end: planning.endDate,
            allDay: planning.allDay,
            textColor: planning.color,
          };
        }),
      );
      setIsLoading(false);
    } catch (error) {
      setPlannings([]);
      setEvents([]);
      setPage(0);
      setIsLoading(false);
      console.log(error);
    }
  };

  const handleDeleteRow = async (id: number) => {
    try {
      await axios.delete(`/plannings/${id}`);
      await refreshData();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteRows = async (selectedIds: number[]) => {
    try {
      await axios.delete(`/plannings`, {
        params: { ids: selectedIds },
      });
      await refreshData();
      setSelected([]);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditRow = (id: number) => {
    setSelectedRange(null);
    setSelectedPlanning(plannings.filter((planning) => planning.id === id)[0]);
    setIsOpenModal(true);
  };

  const handleDuplicateRow = (id: number) => {
    const duplicate = plannings.filter((planning) => planning.id === id)[0];
    duplicate.id = -1;

    setSelectedRange(null);
    setSelectedPlanning(duplicate);
    setIsOpenModal(true);
  };

  const denseHeight = dense ? 60 : 80;

  const isNotFound = !isLoading && !plannings.length;

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
      setDate(calendarApi.getDate());
      refreshViewRange(calendarEl);
    }
  };

  const handleClickDateNext = () => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      calendarApi.next();
      setDate(calendarApi.getDate());
      refreshViewRange(calendarEl);
    }
  };

  const handleSelectDate = (arg: DateSelectArg) => {
    const calendarEl = calendarRef.current;
    if (calendarEl) {
      const calendarApi = calendarEl.getApi();
      calendarApi.unselect();
    }

    setSelectedRange({ start: arg.start, end: arg.end });
    setSelectedPlanning(null);
    setIsOpenModal(true);
  };

  const handleSelectEvent = (arg: EventClickArg) => {
    const id = Number(arg.event.id);

    setSelectedRange(null);
    setSelectedPlanning(plannings.filter((planning) => planning.id === id)[0]);
    setIsOpenModal(true);
  };

  const handleCloseModal = async (refresh: boolean) => {
    setIsOpenModal(false);
    setSelectedRange(null);
    setSelectedPlanning(null);

    if (refresh) {
      await refreshData();
    }
  };

  const handleDialogDelete = async () => {
    if (!selectedPlanning) {
      return;
    }

    await handleDeleteRow(selectedPlanning.id);
    enqueueSnackbar('Delete success!');
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
            <Scrollbar>
              <TableContainer sx={{ minWidth: 800, mt: 1 }}>
                {selected.length > 0 && (
                  <TableSelectedActions
                    dense={dense}
                    numSelected={selected.length}
                    rowCount={plannings.length}
                    onSelectAllRows={(checked) =>
                      onSelectAllRows(
                        checked,
                        plannings.map((row) => row.id),
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

                <Table size={'medium'}>
                  <TableHeadCustom
                    // order={order}
                    // orderBy={orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={plannings.length}
                    numSelected={selected.length}
                    // onSort={onSort}
                    onSelectAllRows={(checked) =>
                      onSelectAllRows(
                        checked,
                        plannings.map((row) => row.id),
                      )
                    }
                  />

                  <TableBody>
                    {(isLoading ? [...Array(rowsPerPage)] : plannings).map((row, index) =>
                      row ? (
                        <PlanningTableRow
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
                rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                component="div"
                count={plannings.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={onChangePage}
                onRowsPerPageChange={onChangeRowsPerPage}
              />
            </Box>
          </Card>
        </Stack>

        <DialogAnimate open={isOpenModal} onClose={() => handleCloseModal(false)}>
          <DialogTitle>{selectedPlanning ? 'Edit Event' : 'Add Event'}</DialogTitle>

          <PlanningCalendarForm
            planning={selectedPlanning}
            range={selectedRange}
            onDelete={handleDialogDelete}
            onCancel={(refresh) => handleCloseModal(refresh)}
          />
        </DialogAnimate>
      </Container>
    </Page>
  );
}
