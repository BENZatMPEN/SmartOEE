import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Layouts, Responsive, WidthProvider } from 'react-grid-layout';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { Analytic, AnalyticDuration, AnalyticGroupCriteriaDetailItem } from '../../@types/analytic';
import { FormProvider } from '../../components/hook-form';
import { RHFDatePicker, RHFDateTimePicker } from '../../components/hook-form/RHFDateTimePicker';
import Iconify from '../../components/Iconify';
import Page from '../../components/Page';
import AnalyticChart from '../../sections/analytics/AnalyticChart';
import AnalyticGroupCriteriaForm from '../../sections/analytics/group/AnalyticGroupCriteriaForm';
import { RootState, useDispatch, useSelector } from '../../redux/store';
import axios from '../../utils/axios';
import { updateCurrentAnalytics } from '../../redux/actions/analyticAction';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const ResponsiveGridLayout = WidthProvider(Responsive);

type ItemCriteria = {
  fromDate: Date;
  toDate: Date;
  index: number;
};

const initDateCriteria: ItemCriteria = {
  fromDate: new Date(),
  toDate: new Date(),
  index: -1,
};

function keyGen(): string {
  return uuidv4().replace('-', '');
}

export default function AnalyticGroup() {
  const { currentAnalytics } = useSelector((state: RootState) => state.analytic);

  const dispatch = useDispatch();

  const { id } = useParams();

  const [chartKey, setChartKey] = useState<string>(keyGen());

  const [criteriaList, setCriteriaList] = useState<AnalyticGroupCriteriaDetailItem[]>([]);

  const [criteriaLayouts, setCriteriaLayouts] = useState<Layouts>({});

  const [selectedCriteria, setSelectedCriteria] = useState<AnalyticGroupCriteriaDetailItem | null>(null);

  const defaultGridLayout = {
    className: 'layout',
    rowHeight: 680,
    cols: { lg: 2, md: 2, sm: 1, xs: 1, xxs: 1 },
    draggableHandle: '.chart-header',
  };

  const [gridLayouts, setGridLayouts] = useState<any>(defaultGridLayout);

  useEffect(() => {
    if (!id) {
      return;
    }

    (async () => {
      const response = await axios.get<Analytic>(`/oee-analytics/${id}`);
      const { data } = response;
      await refresh(data);

      dispatch(updateCurrentAnalytics(data));
    })();

    return () => {
      setCriteriaList([]);
      setCriteriaLayouts({});
      setSelectedCriteria(null);
      dispatch(updateCurrentAnalytics(null));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const refresh = async (analytic: Analytic) => {
    const { criteria, layouts } = analytic?.data || { criteria: [], layouts: [] };
    const result: AnalyticGroupCriteriaDetailItem[] = [];

    for (const item of criteria) {
      const response = await axios.get<Analytic>(`/oee-analytics/${item.criteriaId}`);
      const { data: analytic } = response;
      result.push({ ...analytic.data, ...item });
    }

    setGridLayouts({
      ...defaultGridLayout,
      layouts,
    });
    setCriteriaList(result);
  };

  const handleRefresh = async () => {
    if (!currentAnalytics) {
      return;
    }

    setChartKey(keyGen());
    await refresh(currentAnalytics);
  };

  const handleCriteriaAdded = (criteria: AnalyticGroupCriteriaDetailItem[]) => {
    setCriteriaList([...criteriaList, ...criteria]);
  };

  const [isOpenCriteria, setIsOpenCriteria] = useState<boolean>(false);

  const handleOpenCriteria = (index: number) => {
    setIsOpenCriteria(true);
    const criteria = criteriaList[index];
    setSelectedCriteria(criteria);
    const { fromDate, toDate } = criteria;
    reset({
      fromDate,
      toDate,
      index,
    });
  };

  const handleCloseCriteria = () => {
    setIsOpenCriteria(false);
  };

  const handleSaveCriteria = () => {
    handleSubmit((data) => {
      console.log(data);
      const updatingCriteria = criteriaList[data.index];
      updatingCriteria.fromDate = data.fromDate;
      updatingCriteria.toDate = data.toDate;
      setCriteriaList([...criteriaList]);
    })();

    handleCloseCriteria();
  };

  const handleDelete = (index: number) => {
    criteriaList.splice(index, 1);
    setCriteriaList([...criteriaList]);
  };

  const criteriaScheme = Yup.object().shape({
    // name: Yup.string().max(500).required('name is required'),
  });

  const methods = useForm({
    resolver: yupResolver(criteriaScheme),
    defaultValues: initDateCriteria,
  });

  const { reset, handleSubmit } = methods;

  const getToPicker = (duration: AnalyticDuration) => {
    if (duration === 'hourly') {
      return <RHFDateTimePicker key="fromDateHourly" name="toDate" label="To Date" />;
    } else if (duration === 'daily') {
      return <RHFDatePicker key="fromDateDaily" name="toDate" label="To Date" />;
    } else if (duration === 'monthly') {
      return <RHFDatePicker key="fromDateMonthly" name="toDate" label="To Date" views={['year', 'month']} />;
    } else {
      return <></>;
    }
  };

  const getFromPicker = (duration: AnalyticDuration) => {
    if (duration === 'hourly') {
      return <RHFDateTimePicker key="fromDateHourly" name="fromDate" label="From Date" />;
    } else if (duration === 'daily') {
      return <RHFDatePicker key="fromDateDaily" name="fromDate" label="From Date" />;
    } else if (duration === 'monthly') {
      return <RHFDatePicker key="fromDateMonthly" name="fromDate" label="From Date" views={['year', 'month']} />;
    } else {
      return <></>;
    }
  };

  return (
    <Page title="Group Analytics">
      <Container maxWidth={false}>
        <Stack spacing={3}>
          <AnalyticGroupCriteriaForm
            criteriaList={criteriaList}
            criteriaLayouts={criteriaLayouts}
            onCriteriaAdded={handleCriteriaAdded}
            onRefresh={handleRefresh}
          />

          {criteriaList.length > 0 && (
            <Card>
              <CardContent>
                <ResponsiveGridLayout
                  {...gridLayouts}
                  onLayoutChange={(currentLayout, allLayouts) => {
                    setCriteriaLayouts(allLayouts);
                  }}
                >
                  {criteriaList.map((criteria, index) => (
                    <div
                      key={`${criteria.criteriaId}_${index}`}
                      data-grid={{ x: index % 2, y: 0, w: 1, h: 1, resizeHandles: ['e'] }}
                    >
                      <Stack spacing={3}>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          bgcolor={(theme) => theme.palette.grey.A100}
                          padding={1}
                          borderRadius={1}
                          className="chart-header"
                        >
                          <Typography variant="subtitle1">{criteria.title}</Typography>

                          <Box sx={{ flexGrow: 1 }} />

                          <IconButton color="primary" onClick={() => handleOpenCriteria(index)}>
                            <Iconify icon={'eva:calendar-fill'} />
                          </IconButton>

                          <IconButton color="error" onClick={() => handleDelete(index)}>
                            <Iconify icon={'eva:trash-2-outline'} />
                          </IconButton>
                        </Stack>

                        <Box>
                          <AnalyticChart key={chartKey} criteria={criteria} group={true} />
                        </Box>
                      </Stack>
                    </div>
                  ))}
                </ResponsiveGridLayout>
              </CardContent>
            </Card>
          )}
        </Stack>

        <Dialog fullWidth maxWidth="sm" open={isOpenCriteria} onClose={handleCloseCriteria}>
          <DialogTitle>Change Date</DialogTitle>

          <Stack spacing={3} sx={{ p: 3 }}>
            <FormProvider methods={methods}>
              <Grid container spacing={3}>
                <Grid item sm={6}>
                  {selectedCriteria && getFromPicker(selectedCriteria.duration)}
                </Grid>

                <Grid item sm={6}>
                  {selectedCriteria && getToPicker(selectedCriteria.duration)}
                </Grid>
              </Grid>
            </FormProvider>
          </Stack>

          <DialogActions>
            <Button variant="outlined" color="inherit" onClick={handleCloseCriteria}>
              Cancel
            </Button>

            <LoadingButton variant="contained" onClick={handleSaveCriteria}>
              Save
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Container>
    </Page>
  );
}
