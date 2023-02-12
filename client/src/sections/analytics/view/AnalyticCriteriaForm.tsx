import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import {
  Autocomplete,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogTitle,
  Grid,
  IconButton,
  ListItemButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import {
  Analytic,
  AnalyticChartType,
  AnalyticComparisonType,
  AnalyticCriteria,
  AnalyticDuration,
  AnalyticViewType,
} from '../../../@types/analytic';
import HeaderBreadcrumbs from '../../../components/HeaderBreadcrumbs';
import { FormProvider, RHFSelect, RHFTextField } from '../../../components/hook-form';
import { RHFDatePicker, RHFDateTimePicker } from '../../../components/hook-form/RHFDateTimePicker';
import Iconify from '../../../components/Iconify';
import Scrollbar from '../../../components/Scrollbar';
import {
  createAnalytic,
  deleteAnalytic,
  getAnalyticBatchOpts,
  getAnalyticOeeOpts,
  getAnalyticProductOpts,
  getAnalytics,
  updateAnalytic,
  updateCurrentAnalytics,
  updateCurrentCriteria,
} from '../../../redux/actions/analyticAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import { PATH_ANALYTICS } from '../../../routes/paths';
import { fCode } from '../../../utils/formatNumber';
import {
  getAnalyticChartSubTypeText,
  getAnalyticChartTypeText,
  getAnalyticComparisonTypeText,
  getAnalyticDurationText,
  getAnalyticViewTypeText,
} from '../../../utils/formatText';
import { OptionItem } from '../../../@types/option';

const VIEW_TYPES: AnalyticViewType[] = ['object', 'time'];

const COMPARISON_TYPES: AnalyticComparisonType[] = ['oee', 'product', 'batch'];

const CHART_TYPES: AnalyticChartType[] = ['oee', 'mc', 'a', 'p', 'q'];

const DURATIONS: AnalyticDuration[] = ['hourly', 'daily', 'monthly'];

const defaultValues: AnalyticCriteria = {
  title: 'New Analytic',
  chartType: 'oee',
  chartSubType: 'bar',
  fromDate: dayjs(new Date()).add(-7, 'd').startOf('d').toDate(),
  toDate: dayjs(new Date()).endOf('d').toDate(),
  oees: [],
  products: [],
  batches: [],
  comparisonType: 'oee',
  viewType: 'object',
  duration: 'hourly',
};

const getChartSubType = (charType: AnalyticChartType, viewType: AnalyticViewType): string[] => {
  const key = `${charType}-${viewType}`;
  switch (key) {
    case 'oee-time':
      return ['bar'];

    case 'oee-object':
      return ['bar', 'bar_min_max'];

    case 'mc-time':
    case 'mc-object':
      return ['stack', 'pie'];

    case 'a-time':
      return ['bar', 'line', 'pie', 'stack'];

    case 'a-object':
      return ['bar', 'bar_min_max', 'line', 'pareto'];

    case 'p-time':
      return ['bar', 'line', 'pie', 'stack'];

    case 'p-object':
      return ['bar', 'bar_min_max', 'line', 'pareto'];

    case 'q-time':
      return ['bar', 'line', 'pie', 'stack'];

    case 'q-object':
      return ['bar', 'bar_min_max', 'line', 'pareto'];

    default:
      return [];
  }
};

interface FormValuesProps extends Partial<AnalyticCriteria> {}

export default function AnalyticCriteriaForm() {
  const { enqueueSnackbar } = useSnackbar();

  const dispatch = useDispatch();

  const { selectedSite } = useSelector((state: RootState) => state.userSite);

  const { isLoading, analytics, currentAnalytics, oeeOpts, productOpts, batchOpts } = useSelector(
    (state: RootState) => state.analytic,
  );

  useEffect(() => {
    return () => {
      dispatch(updateCurrentAnalytics(null));
      dispatch(updateCurrentCriteria(null));
    };
  }, [dispatch]);

  useEffect(() => {
    (async () => {
      await dispatch(getAnalyticOeeOpts());
    })();
  }, [dispatch]);

  useEffect(() => {
    (async () => {
      await dispatch(getAnalyticProductOpts());
    })();
  }, [dispatch]);

  useEffect(() => {
    (async () => {
      await dispatch(getAnalyticBatchOpts());
    })();
  }, [dispatch]);

  const [selectingAnalytic, setSelectingAnalytic] = useState<Analytic | null>(null);

  const criteriaScheme = Yup.object().shape({
    title: Yup.string().max(500).required('Title is required'),
    // fromDate: Yup.date(),
    // toDate: Yup.date().when(['fromDate'], {
    //   is: (fromDate: Date) => {
    //     // dayjs(fromDate).isAfter(toDate);
    //     console.log('fromDate', fromDate);
    //     // console.log('toDate', toDate);
    //   },
    //   then: Yup.date(),
    // }),
    // TODO: validate date range
  });

  const methods = useForm<AnalyticCriteria>({
    resolver: yupResolver(criteriaScheme),
    defaultValues,
  });

  const {
    reset,
    watch,
    getValues,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const [isOpenSave, setIsOpenSave] = useState<boolean>(false);

  const [isOpenLoad, setIsOpenLoad] = useState<boolean>(false);

  const handleOpenSave = () => {
    setIsOpenSave(true);
  };

  const handleOpenLoad = async () => {
    setIsOpenLoad(true);
    await dispatch(getAnalytics());
  };

  const handleCloseSave = () => {
    setIsOpenSave(false);
  };

  const handleCloseLoad = () => {
    setIsOpenLoad(false);
    setSelectingAnalytic(null);
  };

  const handleLoad = () => {
    if (selectingAnalytic) {
      dispatch(updateCurrentAnalytics(selectingAnalytic));
      reset(selectingAnalytic.data);
    }

    handleCloseLoad();
  };

  const handleRefresh = () => {
    const criteria = getValues();
    criteria.fromDate = dayjs(criteria.fromDate).toDate();
    criteria.toDate = dayjs(criteria.toDate).toDate();
    dispatch(updateCurrentCriteria(criteria));
  };

  const createNewCriteria = async (data: FormValuesProps) => {
    try {
      await dispatch(
        createAnalytic({
          name: data.title,
          data: data,
          group: false,
          siteId: selectedSite?.id,
        }),
      );

      enqueueSnackbar('Create success!');
    } catch (error) {
      console.log(error);
    }
  };

  const updateCriteria = async (data: FormValuesProps) => {
    if (!currentAnalytics) {
      return;
    }

    try {
      await dispatch(
        updateAnalytic(currentAnalytics.id, {
          ...currentAnalytics,
          name: data.title,
          data: data,
        }),
      );

      enqueueSnackbar('Update success!');
    } catch (error) {
      console.log(error);
    }
  };

  const deleteCriteria = async () => {
    if (!currentAnalytics) {
      return;
    }

    try {
      await dispatch(deleteAnalytic(currentAnalytics.id));
      enqueueSnackbar('Delete success!');
    } catch (error) {
      console.log(error);
    }
  };

  const handleComparisonTypeChanged = (comparisonType: AnalyticComparisonType): void => {
    setValue('comparisonType', comparisonType);
    setValue('oees', []);
    setValue('products', []);
    setValue('batches', []);
  };

  const handleChartTypeChanged = (type: AnalyticChartType): void => {
    setValue('chartType', type);
    fillChartSubTypes(type, getValues('viewType'));
  };

  const handleOEEsSelected = (values: number[]): void => {
    setValue('oees', values);
  };

  const handleProductsSelected = (values: number[]): void => {
    setValue('products', values);
  };

  const handleBatchesSelected = (values: number[]): void => {
    setValue('batches', values);
  };

  const handleViewTypeChanged = (type: AnalyticViewType): void => {
    setValue('oees', []);
    setValue('products', []);
    setValue('batches', []);
    setValue('viewType', type);
    setValue('duration', 'hourly');

    fillChartSubTypes(getValues('chartType'), type);
  };

  const handleDurationChanged = (type: AnalyticDuration): void => {
    setValue('duration', type);
  };

  const fillChartSubTypes = (chartType: AnalyticChartType, viewType: AnalyticViewType) => {
    const types = getChartSubType(chartType, viewType);
    setChartSubTypes(types);

    setValue('chartSubType', types[0]);
  };

  const [chartSubTypes, setChartSubTypes] = useState<string[]>(getChartSubType('oee', 'object'));

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

  const isMultipleSelect = (
    viewType: AnalyticViewType,
    chartType: AnalyticChartType,
    chartSubType: string,
  ): boolean => {
    if (viewType === 'object') {
      return !(['a', 'p', 'q'].indexOf(chartType) >= 0 && chartSubType === 'pareto');
    }

    return false;
  };

  return (
    <>
      <HeaderBreadcrumbs
        heading="Analytics"
        links={[
          { name: 'Home', href: '/' },
          { name: 'Analytics', href: PATH_ANALYTICS.root },
          {
            name: values.title,
          },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<Iconify icon="eva:refresh-outline" />} onClick={handleRefresh}>
              Refresh
            </Button>

            <Button variant="contained" startIcon={<Iconify icon="eva:download-outline" />} onClick={handleOpenLoad}>
              Load
            </Button>

            <Button variant="contained" startIcon={<Iconify icon="eva:save-outline" />} onClick={handleOpenSave}>
              Save
            </Button>
          </Stack>
        }
      />

      <Card>
        <CardContent>
          <FormProvider methods={methods}>
            <Grid container spacing={3}>
              <Grid item sm={6}>
                <RHFTextField name="title" label="Title" InputLabelProps={{ shrink: true }} />
              </Grid>

              <Grid item sm={3}>
                <RHFSelect
                  name="chartType"
                  label="Analytic Type"
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{ native: false }}
                  onChange={(event) => handleChartTypeChanged(event.target.value as AnalyticChartType)}
                >
                  {CHART_TYPES.map((item) => (
                    <MenuItem
                      key={item}
                      value={item}
                      sx={{
                        mx: 1,
                        my: 0.5,
                        borderRadius: 0.75,
                        typography: 'body2',
                      }}
                    >
                      {getAnalyticChartTypeText(item)}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              <Grid item sm={3}>
                <RHFSelect
                  name="viewType"
                  label="View By"
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{ native: false }}
                  onChange={(event) => handleViewTypeChanged(event.target.value as AnalyticViewType)}
                >
                  {VIEW_TYPES.map((item) => (
                    <MenuItem
                      key={item}
                      value={item}
                      sx={{
                        mx: 1,
                        my: 0.5,
                        borderRadius: 0.75,
                        typography: 'body2',
                      }}
                    >
                      {getAnalyticViewTypeText(item)}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              <Grid item sm={3}>
                <RHFSelect
                  name="chartSubType"
                  label="Graph Type"
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{ native: false }}
                >
                  {chartSubTypes.map((item) => (
                    <MenuItem
                      key={item}
                      value={item}
                      sx={{
                        mx: 1,
                        my: 0.5,
                        borderRadius: 0.75,
                        typography: 'body2',
                      }}
                    >
                      {getAnalyticChartSubTypeText(item)}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              <Grid item sm={3}>
                <RHFSelect
                  name="duration"
                  label="Duration"
                  disabled={values.viewType === 'object'}
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{ native: false }}
                  onChange={(event) => handleDurationChanged(event.target.value as AnalyticDuration)}
                >
                  {DURATIONS.map((item) => (
                    <MenuItem
                      key={item}
                      value={item}
                      sx={{
                        mx: 1,
                        my: 0.5,
                        borderRadius: 0.75,
                        typography: 'body2',
                      }}
                    >
                      {getAnalyticDurationText(item)}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              <Grid item sm={3}>
                {getFromPicker(values.duration)}
              </Grid>

              <Grid item sm={3}>
                {getToPicker(values.duration)}
              </Grid>

              <Grid item sm={3}>
                <RHFSelect
                  name="comparisonType"
                  label="Compare By"
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{ native: false }}
                  onChange={(event) => handleComparisonTypeChanged(event.target.value as AnalyticComparisonType)}
                >
                  {COMPARISON_TYPES.map((item) => (
                    <MenuItem
                      key={item}
                      value={item}
                      sx={{
                        mx: 1,
                        my: 0.5,
                        borderRadius: 0.75,
                        typography: 'body2',
                      }}
                    >
                      {getAnalyticComparisonTypeText(item)}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              <Grid item sm={9}>
                {values.comparisonType === 'oee' &&
                  (isMultipleSelect(values.viewType, values.chartType, values.chartSubType) ? (
                    <Autocomplete
                      key={`oeeOpts_multi_${values.viewType}`}
                      multiple
                      limitTags={3}
                      options={oeeOpts}
                      value={(currentAnalytics?.data || { oees: [] }).oees.reduce((arr: OptionItem[], id: number) => {
                        const filtered = (oeeOpts || []).filter((item) => item.id === id);
                        if (filtered.length > 0) {
                          arr.push(filtered[0]);
                        }
                        return arr;
                      }, [])}
                      getOptionLabel={(option) => `${option.name} (${fCode(option.id, '#')})`}
                      renderInput={(params) => <TextField {...params} label="Machines" />}
                      onChange={(event, value) => {
                        handleOEEsSelected((value || []).map((item) => item.id));
                      }}
                    />
                  ) : (
                    <Autocomplete
                      key={`oeeOpts_single_${values.viewType}`}
                      options={oeeOpts}
                      value={(currentAnalytics?.data || { oees: [] }).oees.reduce((arr: OptionItem[], id: number) => {
                        const filtered = (oeeOpts || []).filter((item) => item.id === id);
                        if (filtered.length > 0) {
                          arr.push(filtered[0]);
                        }
                        return arr;
                      }, [])}
                      getOptionLabel={(option) => `${option.name} (${fCode(option.id, '#')})`}
                      renderInput={(params) => <TextField {...params} label="Machines" />}
                      onChange={(event, value) => {
                        handleOEEsSelected(value ? [value.id] : []);
                      }}
                    />
                  ))}

                {values.comparisonType === 'product' &&
                  (isMultipleSelect(values.viewType, values.chartType, values.chartSubType) ? (
                    <Autocomplete
                      key={`productOpts_multi_${values.viewType}`}
                      multiple
                      limitTags={3}
                      options={productOpts}
                      value={(currentAnalytics?.data || { products: [] }).products.reduce(
                        (arr: OptionItem[], id: number) => {
                          const filtered = (productOpts || []).filter((item) => item.id === id);
                          if (filtered.length > 0) {
                            arr.push(filtered[0]);
                          }
                          return arr;
                        },
                        [],
                      )}
                      getOptionLabel={(option) => `${option.name} (${fCode(option.id, '#')})`}
                      renderInput={(params) => <TextField {...params} label="Products" />}
                      onChange={(event, value) => {
                        handleProductsSelected((value || []).map((item) => item.id));
                      }}
                    />
                  ) : (
                    <Autocomplete
                      key={`productOpts_single_${values.viewType}`}
                      options={productOpts}
                      value={(currentAnalytics?.data || { products: [] }).products.reduce(
                        (arr: OptionItem[], id: number) => {
                          const filtered = (productOpts || []).filter((item) => item.id === id);
                          if (filtered.length > 0) {
                            arr.push(filtered[0]);
                          }
                          return arr;
                        },
                        [],
                      )}
                      getOptionLabel={(option) => `${option.name} (${fCode(option.id, '#')})`}
                      renderInput={(params) => <TextField {...params} label="Products" />}
                      onChange={(event, value) => {
                        handleProductsSelected(value ? [value.id] : []);
                      }}
                    />
                  ))}

                {values.comparisonType === 'batch' &&
                  (isMultipleSelect(values.viewType, values.chartType, values.chartSubType) ? (
                    <Autocomplete
                      key={`batchOpts_multi_${values.viewType}`}
                      multiple
                      limitTags={3}
                      options={batchOpts}
                      value={(currentAnalytics?.data || { batches: [] }).batches.reduce(
                        (arr: OptionItem[], id: number) => {
                          const filtered = (batchOpts || []).filter((item) => item.id === id);
                          if (filtered.length > 0) {
                            arr.push(filtered[0]);
                          }
                          return arr;
                        },
                        [],
                      )}
                      getOptionLabel={(option) => `${option.name}`}
                      renderInput={(params) => <TextField {...params} label="Lots" />}
                      onChange={(event, value) => {
                        handleBatchesSelected((value || []).map((item) => item.id));
                      }}
                    />
                  ) : (
                    <Autocomplete
                      key={`batchOpts_single_${values.viewType}`}
                      options={batchOpts}
                      value={(currentAnalytics?.data || { batches: [] }).batches.reduce(
                        (arr: OptionItem[], id: number) => {
                          const filtered = (batchOpts || []).filter((item) => item.id === id);
                          if (filtered.length > 0) {
                            arr.push(filtered[0]);
                          }
                          return arr;
                        },
                        [],
                      )}
                      getOptionLabel={(option) => `${option.name}`}
                      renderInput={(params) => <TextField {...params} label="Lots" />}
                      onChange={(event, value) => {
                        handleBatchesSelected(value ? [value.id] : []);
                      }}
                    />
                  ))}
              </Grid>
            </Grid>
          </FormProvider>
        </CardContent>
      </Card>

      <Dialog fullWidth maxWidth="xs" open={isOpenLoad} onClose={handleCloseLoad}>
        <DialogTitle>Load</DialogTitle>

        <Stack spacing={3} sx={{ p: 3 }}>
          <Stack spacing={2} direction="row">
            <TextField fullWidth label="Search" size="small" InputLabelProps={{ shrink: true }} />

            <IconButton color="primary" onClick={() => {}}>
              <Iconify icon={'eva:search-fill'} />
            </IconButton>
          </Stack>

          <Scrollbar sx={{ maxHeight: 400 }}>
            {!isLoading &&
              (analytics || []).map((item) => (
                <ListItemButton
                  key={item.id}
                  selected={selectingAnalytic?.id === item.id}
                  onClick={() => setSelectingAnalytic(item)}
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'primary.main', my: 0.5, fontWeight: 'fontWeightMedium' }}>
                    {item.name}
                  </Typography>
                </ListItemButton>
              ))}
          </Scrollbar>
        </Stack>

        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={handleCloseLoad}>
            Cancel
          </Button>

          <LoadingButton variant="contained" onClick={handleLoad}>
            Load
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog fullWidth maxWidth="xs" open={isOpenSave} onClose={handleCloseSave}>
        <DialogTitle>Save</DialogTitle>

        <Stack spacing={3} sx={{ p: 3 }}>
          {currentAnalytics && (
            <LoadingButton
              variant="contained"
              fullWidth
              loading={isSubmitting}
              onClick={() => {
                handleSubmit(updateCriteria)();
                handleCloseSave();
              }}
            >
              Save the changes
            </LoadingButton>
          )}

          <LoadingButton
            variant="outlined"
            fullWidth
            loading={isSubmitting}
            onClick={() => {
              handleSubmit(createNewCriteria)();
              handleCloseSave();
            }}
          >
            Create a new analytic
          </LoadingButton>

          {currentAnalytics && (
            <LoadingButton
              variant="outlined"
              color="error"
              fullWidth
              loading={isSubmitting}
              onClick={async () => {
                await deleteCriteria();
                handleCloseSave();
              }}
            >
              Delete
            </LoadingButton>
          )}
        </Stack>

        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={handleCloseSave}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
