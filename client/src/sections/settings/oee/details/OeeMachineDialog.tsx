import { Button, Dialog, Divider, ListItemButton, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Machine } from '../../../../@types/machine';
import { OeeMachine } from '../../../../@types/oee';
import { FormProvider, RHFTextField } from '../../../../components/hook-form';
import Iconify from '../../../../components/Iconify';
import Scrollbar from '../../../../components/Scrollbar';
import axios from '../../../../utils/axios';

type FormValuesProps = {
  searchTerm: string;
};

type Props = {
  open: boolean;
  onClose: VoidFunction;
  onSelect: (oeeMachine: OeeMachine) => void;
  editingMachine: OeeMachine | undefined;
};

export default function OeeMachineDialog({ open, onClose, editingMachine, onSelect }: Props) {
  const methods = useForm<FormValuesProps>({
    defaultValues: {
      searchTerm: '',
    },
  });

  const { reset, handleSubmit } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    setSearchTerm(data.searchTerm);
  };

  const [searchTerm, setSearchTerm] = useState<string>('');

  const [selectedMachine, setSelectedMachine] = useState<OeeMachine | undefined>(undefined);

  const [machines, setMachines] = useState<Machine[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getMachines = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<Machine[]>('/machines/all');
      setMachines(response.data);
      setIsLoading(false);
    } catch {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (open) {
        reset();

        await getMachines();
        setSelectedMachine(editingMachine);
      }
    })();

    return () => {
      setSearchTerm('');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSelectOeeMachine = () => {
    if (selectedMachine) {
      onSelect(selectedMachine);
      onClose();
    }
  };

  const handleSelectItem = (machineId: number) => {
    (async () => {
      try {
        const response = await axios.get<Machine>(`/machines/${machineId}`);
        setSelectedMachine({
          machineId: machineId,
          machine: response.data,
        });
      } catch (error) {
        console.log(error);
      }
    })();
  };

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <Stack sx={{ py: 2.5, px: 3 }} spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6"> Select Machine </Typography>

          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="eva:plus-fill" />}
            sx={{ alignSelf: 'flex-end' }}
            onClick={handleSelectOeeMachine}
          >
            OK
          </Button>
        </Stack>

        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2} direction="row">
            <RHFTextField name="searchTerm" label="Search" size="small" InputLabelProps={{ shrink: true }} />

            <Button type="submit" variant="text">
              <Iconify icon="eva:search-fill" />
            </Button>
          </Stack>
        </FormProvider>

        <Divider />

        <Stack spacing={2}>
          <Scrollbar sx={{ maxHeight: 400 }}>
            {(machines || [])
              .filter(
                (machine) =>
                  searchTerm.length === 0 ||
                  machine.name.indexOf(searchTerm) >= 0 ||
                  machine.code.indexOf(searchTerm) >= 0,
              )
              .map((machine) => (
                <ListItemButton
                  key={machine.id}
                  selected={selectedMachine?.machineId === machine.id}
                  onClick={() => handleSelectItem(machine.id)}
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}
                >
                  <Typography variant="subtitle2">{machine.name}</Typography>

                  <Typography variant="caption" sx={{ color: 'primary.main', my: 0.5, fontWeight: 'fontWeightMedium' }}>
                    {machine.code}
                  </Typography>
                </ListItemButton>
              ))}
          </Scrollbar>
        </Stack>
      </Stack>
    </Dialog>
  );
}
