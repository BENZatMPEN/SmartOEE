import { Button, Stack } from '@mui/material';
import { ThreeDButton } from '../../../components/ThreeDButton';
import { initialOeeStats, OEE_BATCH_STATUS_MC_SETUP, OEE_BATCH_STATUS_PLANNED } from '../../../constants';
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

const downtimeStatus = [OEE_BATCH_STATUS_MC_SETUP, OEE_BATCH_STATUS_PLANNED];

export default function DashboardDetailsControlPanel() {
  const query = useQuery();

  const dispatch = useDispatch();

  const { currentOee } = useSelector((state: RootState) => state.oee);

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
    if (!currentOee || !currentBatch) {
      return;
    }

    try {
      const response = await axios.put(`/oee-batches/${currentBatch.id}/start`, null, {
        params: { oeeId: currentOee.id },
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
    if (!currentOee || !currentBatch || !endBatch) {
      onCloseEndBatch();
      return;
    }

    try {
      const response = await axios.put(`/oee-batches/${currentBatch.id}/end`, null, {
        params: { oeeId: currentOee.id },
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
    if (!currentOee || !currentBatch) {
      return;
    }

    try {
      await axios.put(`/oee-batches/${currentBatch.id}/remove-planned-downtime`, null, {
        params: { oeeId: currentOee.id },
      });
    } catch (error) {
      console.log(error);
    }
  };

  if (!currentOee) {
    return <></>;
  }

  const stoppedBatch = batchStoppedDate || toBeStopped;

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
                window.location.href = `/dashboard/${currentOee.id}`;
              }}
            >
              Go to latest batch
            </Button>
          )}

          <ThreeDButton color="#103996" shadowColor="#2065D1" onClick={onOpenCreateBatch} label="New Batch" />

          <ThreeDButton color="#103996" shadowColor="#2065D1" onClick={onOpenEnableEditing} label="Edit Batch" />

          <DashboardDetailsCreateBatchDialog oee={currentOee} open={openCreateBatch} onClose={onCloseCreateBatch} />

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
      <ThreeDButton color="#103996" shadowColor="#2065D1" onClick={onOpenCreateBatch} label="New Batch" />

      <DashboardDetailsCreateBatchDialog oee={currentOee} open={openCreateBatch} onClose={onCloseCreateBatch} />
    </Stack>
  );
}
