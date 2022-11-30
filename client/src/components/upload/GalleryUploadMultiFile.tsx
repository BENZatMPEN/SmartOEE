import { Box, Card, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDropzone } from 'react-dropzone';
import { GalleryUploadMultiFileProps } from '../hook-form';
import GalleryMultiFilePreview from './GalleryMultiFilePreview';
import RejectionFiles from './RejectionFiles';

const DropZoneStyle = styled('div')(({ theme }) => ({
  outline: 'none',
  width: '150px',
  height: '150px',
  margin: '5px',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.neutral,
  border: `1px dashed ${theme.palette.grey[500_32]}`,
  '&:hover': { opacity: 0.72, cursor: 'pointer' },
}));

export default function GalleryUploadMultiFile({
  error,
  files,
  onRemove,
  helperText,
  sx,
  ...other
}: GalleryUploadMultiFileProps) {
  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    ...other,
  });

  return (
    <Card sx={{ width: '100%', p: 2, display: 'flex', alignItems: 'start', ...sx }}>
      <DropZoneStyle
        {...getRootProps()}
        sx={{
          ...(isDragActive && { opacity: 0.72 }),
          ...((isDragReject || error) && {
            color: 'error.main',
            borderColor: 'error.light',
            bgcolor: 'error.lighter',
          }),
        }}
      >
        <input {...getInputProps()} />

        <Stack
          spacing={2}
          alignItems="center"
          justifyContent="center"
          direction={{ xs: 'column', md: 'row' }}
          sx={{ width: 1, textAlign: { xs: 'center', md: 'left' } }}
        >
          {/*<UploadIllustration sx={{ width: '150px' }} />*/}

          <Box sx={{ p: 3, width: '150px' }}>
            <Typography gutterBottom variant="h5">
              Drop or Select file
            </Typography>

            {/*<Typography variant="body2" sx={{ color: 'text.secondary' }}>*/}
            {/*  Drop files here or click&nbsp;*/}
            {/*  <Typography variant="body2" component="span" sx={{ color: 'primary.main', textDecoration: 'underline' }}>*/}
            {/*    browse*/}
            {/*  </Typography>*/}
            {/*  &nbsp;thorough your machine*/}
            {/*</Typography>*/}
          </Box>
        </Stack>
      </DropZoneStyle>

      {fileRejections.length > 0 && <RejectionFiles fileRejections={fileRejections} />}

      <GalleryMultiFilePreview files={files} onRemove={onRemove} />

      {helperText && helperText}
    </Card>
  );
}
