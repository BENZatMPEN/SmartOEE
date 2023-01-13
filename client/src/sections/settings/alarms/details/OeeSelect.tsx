import { Checkbox, MenuItem } from '@mui/material';
import { useEffect, useState } from 'react';
import { Oee } from '../../../../@types/oee';
import { OptionItem } from '../../../../@types/option';
import { RHFSelect } from '../../../../components/hook-form';
import axios from '../../../../utils/axios';

interface Props {
  onLoading: (isLoading: boolean) => void;
  onSelected: (selectedIds: number[]) => void;
  selectedValues: number[];
  name: string;
  label: string;
}

const OeeSelect = ({ onSelected, onLoading, selectedValues, ...other }: Props) => {
  const [oeeOpts, setOeeOpts] = useState<OptionItem[]>([]);

  useEffect(() => {
    onLoading(true);

    axios
      .get<Oee[]>(`/oees/all`)
      .then((response) => {
        const { data: oees } = response;
        setOeeOpts(
          oees.map((oee) => ({
            id: oee.id,
            name: oee.productionName,
          })),
        );
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        onLoading(false);
      });

    return () => {
      setOeeOpts([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RHFSelect
      {...other}
      fullWidth
      SelectProps={{
        native: false,
        multiple: true,
        value: selectedValues,
        renderValue: (selected: any) => (
          <>
            {oeeOpts
              .filter((item) => selected.indexOf(item.id) > -1)
              .map((item) => item.name)
              .join(', ')}
          </>
        ),
        onChange: (event) => {
          onSelected(event.target.value as number[]);
        },
      }}
    >
      {oeeOpts.map((item) => (
        <MenuItem
          key={item.id}
          value={item.id}
          sx={{
            mx: 1,
            my: 0.5,
            borderRadius: 0.75,
            typography: 'body2',
          }}
        >
          <Checkbox checked={selectedValues.indexOf(item.id) > -1} />
          {item.name}
        </MenuItem>
      ))}
    </RHFSelect>
  );
};

export default OeeSelect;
