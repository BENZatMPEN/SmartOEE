import { TextField, Typography } from '@mui/material';

interface Props {
  label: string;
  value: string;
  description: string;
  onChange: (value: string) => void;
}

export default function SiteAlertTemplate({ label, value, description, onChange }: Props) {
  return (
    <>
      <TextField
        fullWidth
        type="text"
        value={value}
        label={label}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />

      <Typography variant="caption">{description}</Typography>
    </>
  );
}
