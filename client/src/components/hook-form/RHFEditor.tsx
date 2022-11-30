import { FormHelperText } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import Editor, { Props as EditorProps } from '../editor';

interface RHFEditorProps extends EditorProps {
  name: string;
}

export default function RHFEditor({ name, ...other }: RHFEditorProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Editor
          id={name}
          value={field.value}
          onChange={field.onChange}
          error={!!error}
          helperText={
            <FormHelperText error sx={{ px: 2, textTransform: 'capitalize' }}>
              {error?.message}
            </FormHelperText>
          }
          {...other}
        />
      )}
    />
  );
}
