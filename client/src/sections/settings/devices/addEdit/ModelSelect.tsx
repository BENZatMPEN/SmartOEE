import { Divider, MenuItem } from '@mui/material';
import { useEffect, useState } from 'react';
import { DeviceModel } from '../../../../@types/deviceModel';
import { RHFSelect } from '../../../../components/hook-form';
import axios from '../../../../utils/axios';

interface Props {
  onLoading: (isLoading: boolean) => void;
  onSelected: (selectedId: number) => void;
  name: string;
  label: string;
}

const ModelSelect = ({ onSelected, onLoading, ...other }: Props) => {
  const [options, setOptions] = useState<DeviceModel[]>([]);

  useEffect(() => {
    onLoading(true);

    axios
      .get<DeviceModel[]>(`/device-models/all`)
      .then((response) => {
        const { data } = response;
        setOptions(data);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        onLoading(false);
      });

    return () => {
      setOptions([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RHFSelect
      {...other}
      InputLabelProps={{ shrink: true }}
      SelectProps={{ native: false }}
      onChange={(event) => onSelected(Number(event.target.value))}
    >
      <MenuItem
        value={-1}
        sx={{
          mx: 1,
          borderRadius: 0.75,
          typography: 'body1',
          fontStyle: 'italic',
          color: 'text.secondary',
        }}
      >
        None
      </MenuItem>

      <Divider />

      {options.map((deviceModel) => (
        <MenuItem
          key={deviceModel.id}
          value={deviceModel.id}
          sx={{
            mx: 1,
            my: 0.5,
            borderRadius: 0.75,
            typography: 'body1',
          }}
        >
          {deviceModel.name}
        </MenuItem>
      ))}
    </RHFSelect>
  );
};

export default ModelSelect;
