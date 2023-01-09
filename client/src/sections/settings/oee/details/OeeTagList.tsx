import { Box, Button, Grid, Stack, Typography } from '@mui/material';
import { OeeTag } from '../../../../@types/oee';
import {
  OEE_TAG_MC_STATE,
  OEE_TAG_OUT_A,
  OEE_TAG_OUT_BATCH_STATUS,
  OEE_TAG_OUT_BREAKING_TIME,
  OEE_TAG_OUT_CYCLE_TIME,
  OEE_TAG_OUT_OEE,
  OEE_TAG_OUT_OPERATING_TIME,
  OEE_TAG_OUT_P,
  OEE_TAG_OUT_PLANNED_DOWNTIME,
  OEE_TAG_OUT_PLANNED_QUANTITY,
  OEE_TAG_OUT_Q,
  OEE_TAG_OUT_RESET,
  OEE_TAG_OUT_TOTAL_NG,
  OEE_TAG_TOTAL,
  OEE_TAG_TOTAL_NG,
} from '../../../../constants';

type Props = {
  tags: OeeTag[];
  onEdit: (tag: OeeTag) => void;
};

export function OeeTagList({ tags, onEdit }: Props) {
  const handleEditTag = (tag: OeeTag) => {
    onEdit(tag);
  };

  const getLabel = (key: string): string => {
    switch (key) {
      case OEE_TAG_MC_STATE:
        return 'M/C State';

      case OEE_TAG_TOTAL:
        return 'Total';

      case OEE_TAG_TOTAL_NG:
        return 'Total NG';

      case OEE_TAG_OUT_BATCH_STATUS:
        return 'Batch Status (Out)';

      case OEE_TAG_OUT_RESET:
        return 'Reset (Out)';

      case OEE_TAG_OUT_OEE:
        return 'OEE (Out)';

      case OEE_TAG_OUT_A:
        return 'A% (Out)';

      case OEE_TAG_OUT_P:
        return 'P% (Out)';

      case OEE_TAG_OUT_Q:
        return 'Q% (Out)';

      case OEE_TAG_OUT_OPERATING_TIME:
        return 'Operating Time (Out)';

      case OEE_TAG_OUT_PLANNED_DOWNTIME:
        return 'Planed Downtime (Out)';

      case OEE_TAG_OUT_BREAKING_TIME:
        return 'Breakdown Time (Out)';

      case OEE_TAG_OUT_TOTAL_NG:
        return 'Total NG (Out)';

      case OEE_TAG_OUT_CYCLE_TIME:
        return 'Standard Cycle Time (Out)';

      case OEE_TAG_OUT_PLANNED_QUANTITY:
        return 'Planned Quantity (Out)';

      default:
        return '';
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {tags.map((tag) => (
          <Grid key={tag.key} item xs={12} sm={4}>
            <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2">{getLabel(tag.key)}</Typography>
              <Button
                onClick={() => {
                  handleEditTag(tag);
                }}
              >
                Edit
              </Button>
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
