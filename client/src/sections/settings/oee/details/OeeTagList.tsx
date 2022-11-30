import { Box, Button, Grid, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { OeeTag } from '../../../../@types/oee';
import { OEE_TAG_MC_STATE, OEE_TAG_TOTAL, OEE_TAG_TOTAL_NG } from '../../../../constants';

type Props = {
  tags: OeeTag[];
  onEdit: (tag: OeeTag) => void;
};

export function OeeTagList({ tags, onEdit }: Props) {
  const theme = useTheme();

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

      default:
        return '';
    }
  };

  return (
    <Box>
      <Grid container spacing={theme.spacing(3)}>
        {tags.map((tag) => (
          <Grid key={tag.key} item xs={12} md={4}>
            <Stack direction="row" spacing={theme.spacing(3)} alignItems="center" justifyContent="center">
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
