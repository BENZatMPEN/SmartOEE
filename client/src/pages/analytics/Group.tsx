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
import { useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { AnalyticGroupCriteriaDetailItem } from '../../@types/analytic';
import { FormProvider } from '../../components/hook-form';
import { RHFDatePicker } from '../../components/hook-form/RHFDateTimePicker';
import Iconify from '../../components/Iconify';
import Page from '../../components/Page';
import AnalyticChart from '../../sections/analytics/AnalyticChart';
import AnalyticGroupCriteriaForm from '../../sections/analytics/group/AnalyticGroupCriteriaForm';

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

export default function AnalyticGroup() {
  const [criteriaList, setCriteriaList] = useState<AnalyticGroupCriteriaDetailItem[]>([]);

  const handleRefresh = () => {
    // console.log(data);
  };

  const handleCriteriaAdded = (criteria: AnalyticGroupCriteriaDetailItem[], clear: boolean) => {
    if (clear) {
      setCriteriaList([...criteria]);
    } else {
      setCriteriaList([...criteriaList, ...criteria]);
    }
  };

  const [isOpenCriteria, setIsOpenCriteria] = useState<boolean>(false);

  const handleOpenCriteria = (index: number) => {
    setIsOpenCriteria(true);
    const { fromDate, toDate } = criteriaList[index];
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

  const a = {
    className: 'layout',
    rowHeight: 550,
    cols: { lg: 2, md: 2, sm: 1, xs: 1, xxs: 1 },
    draggableHandle: '.chart-header',
  };

  return (
    <Page title="Group Analytics">
      <Container maxWidth={false}>
        <Stack spacing={3}>
          <AnalyticGroupCriteriaForm
            criteriaList={criteriaList}
            onCriteriaAdded={handleCriteriaAdded}
            onRefresh={handleRefresh}
          />

          {criteriaList.length > 0 && (
            <Card>
              <CardContent>
                <ResponsiveGridLayout
                  {...a}
                  onLayoutChange={(currentLayout, allLayouts) => {
                    console.log(currentLayout);
                  }}
                >
                  {criteriaList.map((criteria, index) => (
                    <div
                      key={`${criteria.criteriaId}_${index}`}
                      data-grid={{ x: index % 2, y: 0, w: 1, h: 1, resizeHandles: ['e'] }}
                    >
                      <Stack spacing={3}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle1" className="chart-header">
                            {criteria.title}
                          </Typography>

                          <Box sx={{ flexGrow: 1 }} />

                          <IconButton color="primary" onClick={() => handleOpenCriteria(index)}>
                            <Iconify icon={'eva:calendar-fill'} />
                          </IconButton>

                          <IconButton color="error" onClick={() => handleDelete(index)}>
                            <Iconify icon={'eva:trash-2-outline'} />
                          </IconButton>
                        </Stack>

                        <Box>
                          <AnalyticChart />
                        </Box>
                      </Stack>
                    </div>
                  ))}
                </ResponsiveGridLayout>
              </CardContent>
            </Card>
          )}
        </Stack>

        <Dialog fullWidth maxWidth="xs" open={isOpenCriteria} onClose={handleCloseCriteria}>
          <DialogTitle>Change Date</DialogTitle>

          <Stack spacing={3} sx={{ p: 3 }}>
            <FormProvider methods={methods}>
              <Grid container spacing={3}>
                <Grid item sm={6}>
                  <RHFDatePicker name="fromDate" label="From Date" />
                </Grid>

                <Grid item sm={6}>
                  <RHFDatePicker name="toDate" label="To Date" />
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
