import { Box, Button, Grid, Stack, Typography } from '@mui/material';
import { OeeTag } from '../../../../@types/oee';
import { fOeeTabLabel } from '../../../../utils/textHelper';

type Props = {
  tags: OeeTag[];
  onEdit: (tag: OeeTag) => void;
};

export function OeeTagList({ tags, onEdit }: Props) {
  const handleEditTag = (tag: OeeTag) => {
    onEdit(tag);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {tags.map((tag) => (
          <Grid key={tag.key} item xs={12} sm={4}>
            <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2">{fOeeTabLabel(tag.key)}</Typography>
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
