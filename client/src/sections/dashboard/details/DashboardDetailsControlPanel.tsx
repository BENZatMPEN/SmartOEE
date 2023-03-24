import { Button, Stack } from '@mui/material';
import { ThreeDButton } from '../../../components/ThreeDButton';
import {
  initialOeeStats,
  OEE_BATCH_STATUS_MC_SETUP,
  OEE_BATCH_STATUS_PLANNED,
  OEE_BATCH_STATUS_RUNNING,
} from '../../../constants';
import useQuery from '../../../hooks/useQuery';
import useToggle from '../../../hooks/useToggle';
import { updateBatch } from '../../../redux/actions/oeeBatchAction';
import { RootState, useDispatch, useSelector } from '../../../redux/store';
import axios from '../../../utils/axios';
import DashboardDetailsCreateBatchDialog from './DashboardDetailsCreateBatchDialog';
import DashboardDetailsEnableEditingBatchDialog from './DashboardDetailsEnableEditingBatchDialog';
import DashboardDetailsEndBatchDialog from './DashboardDetailsEndBatchDialog';
import DashboardDetailsPlannedDowntimeDetails from './DashboardDetailsPlannedDowntimeDetails';
import DashboardDetailsPlannedDowntimeDialog from './DashboardDetailsPlannedDowntimeDialog';
import { useContext } from 'react';
import { AbilityContext } from '../../../caslContext';
import { RoleAction, RoleSubject } from '../../../@types/role';

const downtimeStatus = [OEE_BATCH_STATUS_MC_SETUP, OEE_BATCH_STATUS_PLANNED];

export default function DashboardDetailsControlPanel() {
  const query = useQuery();

  const dispatch = useDispatch();

  const { selectedOee } = useSelector((state: RootState) => state.oeeDashboard);

  const { currentBatch } = useSelector((state: RootState) => state.oeeBatch);

  const { batchStartedDate, batchStoppedDate, status, toBeStopped } = currentBatch || {
    oeeStats: initialOeeStats,
    status: '',
    toBeStopped: false,
  };

  const { toggle: openCreateBatch, onOpen: onOpenCreateBatch, onClose: onCloseCreateBatch } = useToggle();

  const { toggle: openEnableEditing, onOpen: onOpenEnableEditing, onClose: onCloseEnableEditing } = useToggle();

  const { toggle: openPlannedDowntime, onOpen: onOpenPlannedDowntime, onClose: onClosePlannedDowntime } = useToggle();

  const { toggle: openEndBatch, onOpen: onOpenEndBatch, onClose: onCloseEndBatch } = useToggle();

  const handleStartBatch = async () => {
    if (!selectedOee || !currentBatch) {
      return;
    }

    try {
      const response = await axios.put(`/oee-batches/${currentBatch.id}/start`, null, {
        params: { oeeId: selectedOee.id },
      });

      const { data: batchStartedDate } = response;
      dispatch(
        updateBatch({
          batchStartedDate: new Date(batchStartedDate),
        }),
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleStopBatch = async (endBatch: boolean) => {
    if (!selectedOee || !currentBatch || !endBatch) {
      onCloseEndBatch();
      return;
    }

    try {
      const response = await axios.put(`/oee-batches/${currentBatch.id}/end`, null, {
        params: { oeeId: selectedOee.id },
      });

      const { data: toBeStopped } = response;
      dispatch(
        updateBatch({
          toBeStopped,
        }),
      );
    } catch (error) {
      console.log(error);
    }

    onCloseEndBatch();
  };

  const handleContinueBatch = async () => {
    if (!selectedOee || !currentBatch) {
      return;
    }

    try {
      await axios.put(`/oee-batches/${currentBatch.id}/remove-planned-downtime`, null, {
        params: { oeeId: selectedOee.id },
      });
      dispatch(
        updateBatch({
          status: OEE_BATCH_STATUS_RUNNING,
        }),
      );
    } catch (error) {
      console.log(error);
    }
  };

  const stoppedBatch = batchStoppedDate || toBeStopped;

  const ability = useContext(AbilityContext);

  if (!selectedOee) {
    return <></>;
  }

  return currentBatch ? (
    <Stack spacing={3}>
      {!stoppedBatch ? (
        <>
          {!batchStartedDate ? (
            <ThreeDButton color="#103996" shadowColor="#2065D1" onClick={handleStartBatch} label="Start" />
          ) : (
            <Stack spacing={3}>
              {downtimeStatus.indexOf(status) < 0 ? (
                <>
                  <ThreeDButton
                    color="#103996"
                    shadowColor="#2065D1"
                    onClick={onOpenPlannedDowntime}
                    label="Plan Downtime"
                  />

                  <ThreeDButton color="#103996" shadowColor="#2065D1" onClick={onOpenEndBatch} label="End Batch" />

                  <DashboardDetailsEndBatchDialog open={openEndBatch} onClose={handleStopBatch} />

                  <DashboardDetailsPlannedDowntimeDialog
                    oeeBatch={currentBatch}
                    open={openPlannedDowntime}
                    onClose={onClosePlannedDowntime}
                  />
                </>
              ) : (
                <>
                  <ThreeDButton
                    color="#103996"
                    shadowColor="#2065D1"
                    onClick={handleContinueBatch}
                    label="Continue Batch"
                  />

                  <DashboardDetailsPlannedDowntimeDetails oeeBatch={currentBatch} />
                </>
              )}
            </Stack>
          )}
        </>
      ) : (
        <>
          {query.get('batchId') && (
            <Button
              onClick={() => {
                window.location.href = `/dashboard/${selectedOee.id}`;
              }}
            >
              Go to latest batch
            </Button>
          )}

          {ability.can(RoleAction.Create, RoleSubject.Dashboard) && (
            <ThreeDButton color="#103996" shadowColor="#2065D1" onClick={onOpenCreateBatch} label="New Batch" />
          )}

          {ability.can(RoleAction.Update, RoleSubject.Dashboard) && (
            <ThreeDButton color="#103996" shadowColor="#2065D1" onClick={onOpenEnableEditing} label="Edit Batch" />
          )}

          <DashboardDetailsCreateBatchDialog oee={selectedOee} open={openCreateBatch} onClose={onCloseCreateBatch} />

          <DashboardDetailsEnableEditingBatchDialog
            oeeBatch={currentBatch}
            open={openEnableEditing}
            onClose={onCloseEnableEditing}
          />
        </>
      )}
    </Stack>
  ) : (
    <Stack spacing={3}>
      {ability.can(RoleAction.Create, RoleSubject.Dashboard) && (
        <ThreeDButton color="#103996" shadowColor="#2065D1" onClick={onOpenCreateBatch} label="New Batch" />
      )}

      <DashboardDetailsCreateBatchDialog oee={selectedOee} open={openCreateBatch} onClose={onCloseCreateBatch} />
    </Stack>
  );
}
