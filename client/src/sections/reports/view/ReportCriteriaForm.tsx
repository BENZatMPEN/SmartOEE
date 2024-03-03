import { Autocomplete, CardContent, Grid, MenuItem, Stack, TextField } from "@mui/material";
import HeaderBreadcrumbs from "../../../components/HeaderBreadcrumbs";
import { Card, Button } from "@mui/material";
import { FormProvider, RHFSelect } from "../../../components/hook-form";
import { ReportChartType, ReportComparisonType, ReportCriteria, ReportDuration, ReportType, ReportViewType } from "../../../@types/report";
import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from 'yup';
import dayjs from 'dayjs';
import { useEffect, useState } from "react";
import { fAnalyticComparisonTypeText, fReportTypeText } from "../../../utils/textHelper";
import { OptionItem } from "../../../@types/option";
import { RootState, useSelector } from "../../../redux/store";
import { fCode } from "../../../utils/formatNumber";
import { RHFDatePicker, RHFDateTimePicker } from "../../../components/hook-form/RHFDateTimePicker";
import Iconify from "../../../components/Iconify";
import { useDispatch } from "react-redux";
import { getReportBatchOpts, getReportOeeOpts, getReportProductOpts, updateCurrentCriteria } from "../../../redux/actions/reportAction";

const COMPARISON_TYPES: ReportComparisonType[] = ['oee', 'product', 'batch'];
const REPORT_TYPES: ReportType[] = ['daily', 'monthly', 'yearly'];

interface Props {
  name: string;
}

// const ReportCriteriaForm: React.FC<Props> = (props) => {
export default function ReportCriteriaForm({ name }: Props) {
  const defaultValues: ReportCriteria = {
    title: `Report ${name}`,
    comparisonType: 'oee',
    oees: [],
    products: [],
    batches: [],
    reportType: 'daily',
    date: dayjs(new Date()).endOf('d').toDate(),
    fromDate: dayjs(new Date()).endOf('d').toDate(),
    toDate: dayjs(new Date()).endOf('d').toDate(),
  };

  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      await dispatch(getReportOeeOpts());
    })();
  }, [dispatch]);

  useEffect(() => {
    (async () => {
      await dispatch(getReportProductOpts());
    })();
  }, [dispatch]);

  useEffect(() => {
    (async () => {
      await dispatch(getReportBatchOpts());
    })();
  }, [dispatch]);

  const handleComparisonTypeChanged = (comparisonType: ReportComparisonType): void => {
    setValue('comparisonType', comparisonType);
    setValue('oees', []);
    setValue('products', []);
    setValue('batches', []);
  };

  const handleReportTypeChanged = (reportType: ReportType): void => {
    setValue('reportType', reportType);
  }
  const { selectedSite } = useSelector((state: RootState) => state.userSite);

  const { oeeOpts, productOpts, batchOpts, currentCriteria } = useSelector(
    (state: RootState) => state.report,
  );

  const criteriaScheme = Yup.object().shape({
    title: Yup.string().max(500).required('Title is required'),
  });

  const methods = useForm<ReportCriteria>({
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

  useEffect(() => {
    return () => {
      dispatch(updateCurrentCriteria(null));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const values = watch();

  const handleOEEsSelected = (values: number[]): void => {
    setValue('oees', values);
  };

  const handleProductsSelected = (values: number[]): void => {
    setValue('products', values);
  };

  const handleBatchesSelected = (values: number[]): void => {
    setValue('batches', values);
  };

  const isMultipleSelect = (
    viewType: ReportViewType,
    chartType: ReportChartType,
    chartSubType: string,
  ): boolean => {
    if (viewType === 'object') {
      return !(['a', 'p', 'q'].indexOf(chartType) >= 0 && chartSubType === 'pareto');
    }

    return false;
  };

  const findSingleOption = (id: number, list: OptionItem[]): OptionItem | null => {
    const filtered = list.filter((item) => item.id === id);
    return filtered.length > 0 ? filtered[0] : null;
  };

  const getFromPicker = (type: ReportType) => {
    if (type === 'daily') {
      return <RHFDatePicker key="fromDateDaily" name="fromDate" label="Date" />;
    } else if (type === 'monthly') {
      return <RHFDatePicker key="fromDateMonthly" name="fromDate" label="Date" views={['year', 'month']} />;
    } else if (type === 'yearly') {
      return <RHFDatePicker key="fromDateYearly" name="fromDate" label="Date" views={['year']} />;
    } else {
      return <></>;
    }
  };

  const handleRefresh = () => {
    const criteria = getValues();
    if (criteria.reportType === 'daily') {
      criteria.fromDate = dayjs(criteria.fromDate).startOf('day').toDate();
      criteria.toDate = dayjs(criteria.fromDate).endOf('day').toDate();
    } else if (criteria.reportType === 'monthly') {
      criteria.fromDate = dayjs(criteria.fromDate).startOf('month').toDate();
      criteria.toDate = dayjs(criteria.fromDate).endOf('month').toDate();
    } else if (criteria.reportType === 'yearly') {
      criteria.fromDate = dayjs(criteria.fromDate).startOf('year').toDate();
      criteria.toDate = dayjs(criteria.fromDate).endOf('year').toDate();
    }
    dispatch(updateCurrentCriteria(criteria));
  };

  return (
    <>
      <HeaderBreadcrumbs
        heading={`Report ${name}`}
        links={[
          { name: 'Reports' },
          { name: `Report ${name}`, href: `/reports/${name}` },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<Iconify icon="eva:refresh-outline" />} onClick={handleRefresh}>
              Refresh
            </Button>
          </Stack>
        }
      >
      </HeaderBreadcrumbs>

      <Card>
        <CardContent>
          <FormProvider methods={methods}>
            <Grid container spacing={3}>
              <Grid item sm={3}>
                <RHFSelect
                  name="comparisonType"
                  label="Compare By"
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{ native: false }}
                  onChange={(event) => handleComparisonTypeChanged(event.target.value as ReportComparisonType)}
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
                      {fAnalyticComparisonTypeText(item)}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>
              <Grid item sm={9}>
                {values.comparisonType === 'oee' ?
                  (
                    <Autocomplete
                      key={`oeeOpts_single`}
                      options={oeeOpts}
                      value={(values.oees || []).length > 0 ? findSingleOption(values.oees[0], oeeOpts) : null}
                      getOptionLabel={(option) => `${option.name} (${fCode(option.id, '#')})`}
                      renderInput={(params) => <TextField {...params} label="Machines" />}
                      onChange={(event, value) => {
                        handleOEEsSelected(value ? [value.id] : []);
                      }}
                    />)
                  : values.comparisonType === 'product' ?
                    (
                      <Autocomplete
                        key={`productOpts_single`}
                        options={productOpts}
                        value={
                          (values.products || []).length > 0 ? findSingleOption(values.products[0], productOpts) : null
                        }
                        getOptionLabel={(option) => `${option.name} (${fCode(option.id, '#')})`}
                        renderInput={(params) => <TextField {...params} label="Products" />}
                        onChange={(event, value) => {
                          handleProductsSelected(value ? [value.id] : []);
                        }}
                      />)
                    : values.comparisonType === 'batch' ? (
                      <Autocomplete
                        key={`batchOpts_single`}
                        options={batchOpts}
                        value={(values.batches || []).length > 0 ? findSingleOption(values.batches[0], batchOpts) : null}
                        getOptionLabel={(option) => `${option.name}`}
                        renderInput={(params) => <TextField {...params} label="Lots" />}
                        onChange={(event, value) => {
                          handleBatchesSelected(value ? [value.id] : []);
                        }}
                      />
                    ) :
                      (
                        <Autocomplete
                          key={`oeeOpts_single`}
                          options={oeeOpts}
                          value={(values.oees || []).length > 0 ? findSingleOption(values.oees[0], oeeOpts) : null}
                          getOptionLabel={(option) => `${option.name} (${fCode(option.id, '#')})`}
                          renderInput={(params) => <TextField {...params} label="Machines" />}
                          onChange={(event, value) => {
                            handleOEEsSelected(value ? [value.id] : []);
                          }}
                        />
                      )
                }
              </Grid>
              <Grid item sm={3}>
                <RHFSelect
                  name="reportType"
                  label="Report Type"
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{ native: false }}
                  onChange={(event) => handleReportTypeChanged(event.target.value as ReportType)}
                >
                  {REPORT_TYPES.map((item) => (
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
                      {fReportTypeText(item)}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>
              <Grid item sm={3}>
                {getFromPicker(values.reportType)}
              </Grid>
            </Grid>
          </FormProvider>
        </CardContent>
      </Card>
    </>
  )
}

// export default ReportCriteriaForm;
