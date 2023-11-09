import { LoadingButton } from '@mui/lab';
import { Dialog, Divider, MenuItem, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Machine, MachineParameter } from '../../../../@types/machine';
import { OeeBatchP } from '../../../../@types/oeeBatch';
import { FormProvider, RHFSelect } from '../../../../components/hook-form';
import Iconify from '../../../../components/Iconify';
import { OEE_TYPE_P } from '../../../../constants';
import { RootState, useSelector } from '../../../../redux/store';
import axios from '../../../../utils/axios';

type FormValuesProps = {
  machineId: number;
  machineParameterId: number;
  tagId: number;
};

type Props = {
  open: boolean;
  onClose: VoidFunction;
  onUpdate: (oeeBatchP: OeeBatchP) => void;
  editingOeeBatchP: OeeBatchP;
};

export default function DashboardOperatingOeePDialog({ open, onClose, onUpdate, editingOeeBatchP }: Props) {
  const { currentBatch } = useSelector((state: RootState) => state.oeeBatch);

  const methods = useForm<FormValuesProps>({
    defaultValues: {
      machineId: -1,
      machineParameterId: -1,
      tagId: -1,
    },
  });

  const {
    reset,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    try {
      const { machineId, machineParameterId, tagId } = data;
      const response = await axios.patch<OeeBatchP>(`/oee-batches/${editingOeeBatchP.oeeBatchId}/p-param`, {
        id: editingOeeBatchP.id,
        machineId: machineId !== -1 ? machineId : null,
        machineParameterId: machineParameterId !== -1 ? machineParameterId : null,
        tagId: tagId !== -1 ? tagId : null,
      });

      onUpdate(response.data);
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  const [machines, setMachines] = useState<Machine[]>([]);

  const [machineParams, setMachineParams] = useState<MachineParameter[]>([]);

  const filterMachineParams = (machine: Machine): MachineParameter[] => {
    const filtered = machine.parameters.filter((param) => param.oeeType === OEE_TYPE_P);
    setMachineParams(filtered);
    return filtered;
  };

  useEffect(() => {
    if (open) {
      const { machines } = currentBatch || { machines: [] };
      setMachines(machines);

      const { machineId, machineParameterId, tagId } = editingOeeBatchP;
      if (machineId) {
        const filtered = machines.filter((item) => item.id === machineId);
        if (filtered.length > 0) {
          filterMachineParams(filtered[0]);
        }
      } else {
        if (machines.length > 0) {
          filterMachineParams(machines[0]);
        }
      }

      setValue('machineId', machineId ? machineId : machines.length > 0 ? machines[0].id : -1);
      setValue('machineParameterId', machineParameterId ? machineParameterId : -1);
      setValue('tagId', tagId ? tagId : -1);
    }

    return () => {
      reset();
      setMachines([]);
      setMachineParams([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleMachineChange = (machineId: number) => {
    setValue('machineId', -1);
    setValue('machineParameterId', -1);
    setValue('tagId', -1);
    setMachineParams([]);

    setValue('machineId', machineId);
    const filtered = machines.filter((item) => item.id === machineId);
    if (filtered.length > 0) {
      filterMachineParams(filtered[0]);
    }
  };

  const handleMachineParamChange = (machineParamId: number) => {
    setValue('machineParameterId', -1);
    setValue('tagId', -1);
    const filtered = machineParams.filter((item) => item.id === machineParamId);

    if (filtered.length > 0) {
      setValue('machineParameterId', filtered[0].id);
      setValue('tagId', filtered[0].tagId ? filtered[0].tagId : -1);
    }
  };

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack sx={{ p: 3 }} spacing={3}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Set Cause</Typography>

            <LoadingButton
              type="submit"
              size="small"
              variant="outlined"
              loading={isSubmitting}
              startIcon={<Iconify icon="eva:save-fill" />}
              sx={{ alignSelf: 'flex-end' }}
            >
              Save
            </LoadingButton>
          </Stack>

          <RHFSelect
            name="machineId"
            label="Machine"
            size="small"
            InputLabelProps={{ shrink: true }}
            SelectProps={{ native: false }}
            onChange={(event) => {
              handleMachineChange(Number(event.target.value));
            }}
          >
            <MenuItem
              value={-1}
              sx={{
                mx: 1,
                borderRadius: 0.75,
                typography: 'body2',
                fontStyle: 'italic',
                color: 'text.secondary',
              }}
            >
              Other
            </MenuItem>

            <Divider />

            {machines.map((machine) => (
              <MenuItem
                key={machine.id}
                value={machine.id}
                sx={{
                  mx: 1,
                  my: 0.5,
                  borderRadius: 0.75,
                  typography: 'body2',
                }}
              >
                {machine.name}
              </MenuItem>
            ))}
          </RHFSelect>

          <RHFSelect
            name="machineParameterId"
            label="Machine Parameter"
            size="small"
            InputLabelProps={{ shrink: true }}
            SelectProps={{ native: false }}
            onChange={(event) => {
              handleMachineParamChange(Number(event.target.value));
            }}
          >
            <MenuItem
              value={-1}
              sx={{
                mx: 1,
                borderRadius: 0.75,
                typography: 'body2',
                fontStyle: 'italic',
                color: 'text.secondary',
              }}
            >
              Other
            </MenuItem>

            <Divider />

            {machineParams.map((param) => (
              <MenuItem
                key={param.id}
                value={param.id}
                sx={{
                  mx: 1,
                  my: 0.5,
                  borderRadius: 0.75,
                  typography: 'body2',
                }}
              >
                {param.name}
              </MenuItem>
            ))}
          </RHFSelect>
        </Stack>
      </FormProvider>
    </Dialog>
  );
}
