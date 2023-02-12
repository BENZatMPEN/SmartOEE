import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogTitle,
  Grid,
  IconButton,
  ListItemButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { Analytic, AnalyticGroupCriteriaDetailItem, AnalyticGroupCriteriaItem } from '../../../@types/analytic';
import HeaderBreadcrumbs from '../../../components/HeaderBreadcrumbs';
import { FormProvider, RHFTextField } from '../../../components/hook-form';
import Iconify from '../../../components/Iconify';
import Scrollbar from '../../../components/Scrollbar';
import {
  createAnalytic,
  deleteAnalytic,
  getAnalytics,
  getGroupAnalytics,
  updateAnalytic,
  updateCurrentAnalytics,
} from '../../../redux/actions/analyticAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import { PATH_ANALYTICS } from '../../../routes/paths';
import { Layouts } from 'react-grid-layout';

interface FormValuesProps extends Partial<Analytic> {}

type Props = {
  criteriaList: AnalyticGroupCriteriaDetailItem[];
  criteriaLayouts: Layouts;
  onCriteriaAdded: (criteria: AnalyticGroupCriteriaDetailItem[]) => void;
  onRefresh: () => void;
};

export default function AnalyticGroupCriteriaForm({
  criteriaList,
  criteriaLayouts,
  onCriteriaAdded,
  onRefresh,
}: Props) {
  const dispatch = useDispatch();

  const { enqueueSnackbar } = useSnackbar();

  const { selectedSite } = useSelector((state: RootState) => state.userSite);

  const { isLoading, analytics, isGroupLoading, groupAnalytics, currentAnalytics } = useSelector(
    (state: RootState) => state.analytic,
  );

  const [selectingGroupAnalytic, setSelectingGroupAnalytic] = useState<Analytic | null>(null);

  const [selectingSavedAnalytic, setSelectingSavedAnalytic] = useState<Analytic | null>(null);

  const criteriaScheme = Yup.object().shape({
    name: Yup.string().max(500).required('name is required'),
  });

  const methods = useForm({
    resolver: yupResolver(criteriaScheme),
    defaultValues: {
      name: 'New Group Analytics',
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const [isOpenSave, setIsOpenSave] = useState<boolean>(false);

  const [isOpenLoad, setIsOpenLoad] = useState<boolean>(false);

  const [isOpenAdd, setIsOpenAdd] = useState<boolean>(false);

  useEffect(() => {
    if (!currentAnalytics) {
      return;
    }

    reset({ name: currentAnalytics.name });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAnalytics]);

  const handleOpenSave = () => {
    setIsOpenSave(true);
  };

  const handleCloseSave = () => {
    setIsOpenSave(false);
  };

  const handleOpenLoad = async () => {
    setIsOpenLoad(true);
    await dispatch(getGroupAnalytics());
  };

  const handleCloseLoad = () => {
    setIsOpenLoad(false);
    setSelectingGroupAnalytic(null);
  };

  const handleOpenAdd = async () => {
    setIsOpenAdd(true);
    await dispatch(getAnalytics());
  };

  const handleCloseAdd = () => {
    setIsOpenAdd(false);
  };

  const handleRefresh = () => {
    onRefresh();
  };

  const getCriteriaDetailList = (): AnalyticGroupCriteriaItem[] => {
    return criteriaList.map((item) => {
      return {
        criteriaId: item.criteriaId,
        fromDate: item.fromDate,
        toDate: item.toDate,
      };
    });
  };

  const createNewGroupAnalytics = async (data: FormValuesProps) => {
    try {
      await dispatch(
        createAnalytic({
          name: data.name,
          data: {
            criteria: getCriteriaDetailList(),
            layouts: criteriaLayouts,
          },
          group: true,
          siteId: selectedSite?.id,
        }),
      );

      enqueueSnackbar('Create success!');
    } catch (error) {
      console.log(error);
    }
  };

  const updateGroupAnalytics = async (data: FormValuesProps) => {
    if (!currentAnalytics) {
      return;
    }

    try {
      await dispatch(
        updateAnalytic(currentAnalytics.id, {
          ...currentAnalytics,
          name: data.name,
          data: {
            criteria: getCriteriaDetailList(),
            layouts: criteriaLayouts,
          },
        }),
      );

      enqueueSnackbar('Update success!');
    } catch (error) {
      console.log(error);
    }
  };

  const deleteDeleteGroupAnalytics = async () => {
    if (!currentAnalytics) {
      return;
    }

    try {
      await dispatch(deleteAnalytic(currentAnalytics.id, true));
      enqueueSnackbar('Delete success!');
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddSavedCriteria = () => {
    if (!selectingSavedAnalytic) {
      return;
    }

    const criteria: AnalyticGroupCriteriaDetailItem = {
      ...selectingSavedAnalytic.data,
      criteriaId: selectingSavedAnalytic.id,
      fromDate: new Date(),
      toDate: new Date(),
    };

    onCriteriaAdded([criteria]);
    handleCloseAdd();
  };

  const handleLoad = async () => {
    if (!selectingGroupAnalytic) {
      return;
    }

    dispatch(updateCurrentAnalytics(selectingGroupAnalytic));
    reset(selectingGroupAnalytic);
    handleCloseLoad();
  };

  return (
    <>
      <HeaderBreadcrumbs
        heading="Group Analytic"
        links={[
          { name: 'Home', href: '/' },
          { name: 'Analytics', href: PATH_ANALYTICS.root },
          {
            name: currentAnalytics?.name || 'Group Analytic',
          },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<Iconify icon="eva:refresh-outline" />} onClick={handleRefresh}>
              Refresh
            </Button>

            <Button variant="outlined" startIcon={<Iconify icon="eva:plus-outline" />} onClick={handleOpenAdd}>
              Add
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
              <Grid item sm={12}>
                <RHFTextField name="name" label="Title" InputLabelProps={{ shrink: true }} />
              </Grid>
            </Grid>
          </FormProvider>
        </CardContent>
      </Card>

      <Dialog fullWidth maxWidth="xs" open={isOpenAdd} onClose={handleCloseAdd}>
        <DialogTitle>Add</DialogTitle>

        <Stack spacing={3} sx={{ p: 3 }}>
          <Stack spacing={2} direction="row">
            <TextField fullWidth label="Search" size="small" InputLabelProps={{ shrink: true }} />

            <IconButton color="primary" onClick={() => {}}>
              <Iconify icon={'eva:search-fill'} />
            </IconButton>
          </Stack>

          <Scrollbar sx={{ maxHeight: 400 }}>
            {!isLoading &&
              (analytics || []).map((item) => {
                const { data } = item;
                return (
                  <ListItemButton
                    key={item.id}
                    selected={selectingSavedAnalytic?.id === item.id}
                    onClick={() => setSelectingSavedAnalytic(item)}
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'primary.main', my: 0.5, fontWeight: 'fontWeightMedium' }}>
                      {data.title}
                    </Typography>
                  </ListItemButton>
                );
              })}
          </Scrollbar>
        </Stack>

        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={handleCloseAdd}>
            Cancel
          </Button>

          <LoadingButton variant="contained" onClick={handleAddSavedCriteria}>
            Add
          </LoadingButton>
        </DialogActions>
      </Dialog>

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
            {!isGroupLoading &&
              (groupAnalytics || []).map((item) => {
                return (
                  <ListItemButton
                    key={item.id}
                    selected={selectingGroupAnalytic?.id === item.id}
                    onClick={() => setSelectingGroupAnalytic(item)}
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
                );
              })}
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
                handleSubmit(updateGroupAnalytics)();
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
              handleSubmit(createNewGroupAnalytics)();
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
                await deleteDeleteGroupAnalytics();
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
