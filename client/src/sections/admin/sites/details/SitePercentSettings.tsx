import { Box, Grid, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { PercentSetting } from '../../../../@types/percentSetting';

interface IProps {
  percentSetting: PercentSetting;
  onEdit: (percentSetting: PercentSetting) => void;
}

export default function SitePercentSettings({ percentSetting, onEdit }: IProps) {
  const [setting, setSetting] = useState<PercentSetting>(percentSetting);

  useEffect(() => {
    setSetting({ ...percentSetting });
  }, [percentSetting]);

  const getTypeName = (type: string) => {
    switch (type) {
      case 'oee':
        return 'OEE Percent';
      case 'a':
        return 'Availability Percent';
      case 'p':
        return 'Performance Percent';
      case 'q':
        return 'Quality Percent';
    }
  };

  const handleChange = (type: string, setting: string, value: number) => {
    const newPercentSettings = {
      ...percentSetting,
    };

    // @ts-ignore
    newPercentSettings.settings[setting] = value;
    onEdit(newPercentSettings);
    setSetting(newPercentSettings);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1">{getTypeName(setting.type)}</Typography>
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              value={setting.settings.high}
              label="High"
              onChange={(event) => {
                handleChange(setting.type, 'high', Number(event.target.value));
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              value={setting.settings.medium}
              label="Medium"
              onChange={(event) => {
                handleChange(setting.type, 'medium', Number(event.target.value));
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              value={percentSetting.settings.low}
              label="Low"
              onChange={(event) => {
                handleChange(setting.type, 'low', Number(event.target.value));
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </Stack>
  );
}
