import { Box, Card, CardContent, Container, Stack } from '@mui/material';
import { useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { OeeBatchA, OeeBatchP, OeeBatchQ, OeeStats, OeeTimeline } from '../../@types/oeeBatch';
import { NavSectionHorizontal } from '../../components/nav-section';
import Page from '../../components/Page';
import useQuery from '../../hooks/useQuery';
import useWebSocket from '../../hooks/useWebSocket';
import { getOee, resetOee } from '../../redux/actions/oeeAction';
import {
  getOeeBatch,
  getOeeBatchAs,
  getOeeBatchPs,
  getOeeBatchQs,
  getOeeBatchTimeline,
  getOeeLatestBatch,
  resetBatch,
  updateBatch,
  updateBatchParamAs,
  updateBatchParamPs,
  updateBatchParamQs,
  updateBatchTimeline,
} from '../../redux/actions/oeeBatchAction';
import { RootState, useDispatch, useSelector } from '../../redux/store';
import { PATH_DASHBOARD } from '../../routes/paths';
import DashboardDetailsHeader from '../../sections/dashboard/details/DashboardDetailsHeader';
import DashboardDetailsPanel from '../../sections/dashboard/details/DashboardDetailsPanel';

export default function Details() {
  const { id } = useParams();

  const oeeId = id ? Number(id) : -1;

  const query = useQuery();

  const batchId = query.get('batchId') ? Number(query.get('batchId')) : null;

  const params = batchId ? `?batchId=${batchId}` : '';

  const navConfig = [
    {
      subheader: 'Operating Status',
      items: [
        {
          title: 'Operating Status',
          path: PATH_DASHBOARD.item.operating(oeeId.toString()) + params,
        },
      ],
    },
    {
      subheader: 'Machine/Line Status',
      items: [
        {
          title: 'Machine/Line Status',
          path: PATH_DASHBOARD.item.machine(oeeId.toString()) + params,
        },
      ],
    },
    {
      subheader: 'Machine Timeline',
      items: [
        {
          title: 'Machine Timeline',
          path: PATH_DASHBOARD.item.timeline(oeeId.toString()) + params,
        },
      ],
    },
    {
      subheader: 'OEE Graph',
      items: [
        {
          title: 'OEE Graph',
          path: PATH_DASHBOARD.item.oeeGraph(oeeId.toString()) + params,
        },
      ],
    },
    {
      subheader: 'A/P/Q Graph',
      items: [
        {
          title: 'A/P/Q Graph',
          path: PATH_DASHBOARD.item.apqGraph(oeeId.toString()) + params,
        },
      ],
    },
    {
      subheader: 'History',
      items: [
        {
          title: 'History',
          path: PATH_DASHBOARD.item.history(oeeId.toString()) + params,
        },
      ],
    },
  ];

  const { socket } = useWebSocket();

  const dispatch = useDispatch();

  const { selectedOee, isLoading } = useSelector((state: RootState) => state.oee);

  const { currentBatch } = useSelector((state: RootState) => state.oeeBatch);

  const { productionName } = selectedOee ?? {};

  const { id: currentBatchId } = currentBatch || {};

  const title = productionName ? `OEE - ${productionName}` : 'OEE';

  useEffect(() => {
    if (oeeId === -1) {
      return;
    }

    (async () => {
      await dispatch(getOee(oeeId));
    })();

    return () => {
      dispatch(resetOee());
    };
  }, [dispatch, oeeId]);

  useEffect(() => {
    if (oeeId === -1) {
      return;
    }

    (async () => {
      if (batchId) {
        await dispatch(getOeeBatch(oeeId, batchId));
      } else {
        await dispatch(getOeeLatestBatch(oeeId));
      }
    })();

    return () => {
      dispatch(resetBatch());
    };
  }, [dispatch, oeeId, batchId]);

  useEffect(() => {
    if (!currentBatchId) {
      return;
    }

    (async () => {
      await dispatch(getOeeBatchAs(currentBatchId));
    })();
  }, [dispatch, currentBatchId]);

  useEffect(() => {
    if (!currentBatchId) {
      return;
    }

    (async () => {
      await dispatch(getOeeBatchTimeline(currentBatchId));
    })();
  }, [dispatch, currentBatchId]);

  useEffect(() => {
    if (!currentBatchId) {
      return;
    }

    (async () => {
      await dispatch(getOeeBatchPs(currentBatchId));
    })();
  }, [dispatch, currentBatchId]);

  useEffect(() => {
    if (!currentBatchId) {
      return;
    }

    (async () => {
      await dispatch(getOeeBatchQs(currentBatchId));
    })();
  }, [dispatch, currentBatchId]);

  useEffect(() => {
    if (!socket || !currentBatchId) {
      return;
    }

    const updateMcState = (data: any) => {
      dispatch(updateBatch(data));
    };

    const updateStats = (data: OeeStats) => {
      dispatch(
        updateBatch({
          oeeStats: data,
        }),
      );
    };

    const updateAParams = (data: OeeBatchA[]) => {
      dispatch(updateBatchParamAs(data));
    };

    const updatePParams = (data: OeeBatchP[]) => {
      dispatch(updateBatchParamPs(data));
    };

    const updateQParams = (data: OeeBatchQ[]) => {
      dispatch(updateBatchParamQs(data));
    };

    const updateTimeline = (data: OeeTimeline[]) => {
      dispatch(updateBatchTimeline(data));
    };

    socket.on(`mc-state_${currentBatchId}.changed`, updateMcState);
    socket.on(`stats_${currentBatchId}.updated`, updateStats);
    socket.on(`a-params_${currentBatchId}.updated`, updateAParams);
    socket.on(`p-params_${currentBatchId}.updated`, updatePParams);
    socket.on(`q-params_${currentBatchId}.updated`, updateQParams);
    socket.on(`batch-timeline_${currentBatchId}.updated`, updateTimeline);

    return () => {
      socket.off(`mc-state_${currentBatchId}.changed`, updateMcState);
      socket.off(`stats_${currentBatchId}.updated`, updateStats);
      socket.off(`a-params_${currentBatchId}.updated`, updateAParams);
      socket.off(`p-params_${currentBatchId}.updated`, updatePParams);
      socket.off(`q-params_${currentBatchId}.updated`, updateQParams);
      socket.off(`batch-timeline_${currentBatchId}.updated`, updateTimeline);
    };
  }, [socket, currentBatchId, dispatch]);

  const isNotFound = !isLoading && !selectedOee;

  return (
    <Page title={title}>
      <Container maxWidth={false}>
        {isLoading ? (
          <>Loading...</>
        ) : isNotFound ? (
          <>Not found</>
        ) : (
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <DashboardDetailsHeader />
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <DashboardDetailsPanel />
              </CardContent>
            </Card>

            <NavSectionHorizontal navConfig={navConfig} />
            <Box>
              <Outlet />
            </Box>
          </Stack>
        )}
      </Container>
    </Page>
  );
}
