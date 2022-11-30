import { IconButton, List, ListItem } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { AnimatePresence, m } from 'framer-motion';
import isString from 'lodash/isString';
import { varFade } from '../animate';
import { GalleryUploadMultiFileProps } from '../hook-form';
import Iconify from '../Iconify';
import Image from '../Image';
import { CustomFile } from './type';

const getFileData = (file: CustomFile | string) => {
  if (typeof file === 'string') {
    return {
      key: file,
    };
  }
  return {
    key: file.name,
    name: file.name,
    size: file.size,
    preview: file.preview,
  };
};

export default function GalleryMultiFilePreview({ files, onRemove }: GalleryUploadMultiFileProps) {
  const hasFile = files?.length > 0;

  return (
    <List disablePadding>
      <AnimatePresence>
        {(files || []).map((file, index) => {
          const { key, name, size, preview } = getFileData(file as CustomFile);

          return (
            <ListItem
              key={key}
              component={m.div}
              {...varFade().inRight}
              sx={{
                p: 0,
                m: 0.5,
                width: 150,
                height: 150,
                borderRadius: 1.25,
                overflow: 'hidden',
                position: 'relative',
                display: 'inline-flex',
                border: (theme) => `solid 1px ${theme.palette.divider}`,
              }}
            >
              <Image alt="preview" src={isString(file) ? file : preview} ratio="1/1" />
              <IconButton
                size="small"
                onClick={() => onRemove(index)}
                sx={{
                  top: 6,
                  p: '2px',
                  right: 6,
                  position: 'absolute',
                  color: 'common.white',
                  bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.grey[900], 0.48),
                  },
                }}
              >
                <Iconify icon={'eva:close-fill'} />
              </IconButton>
            </ListItem>
          );

          // return (
          //   <ListItem
          //     key={key}
          //     component={m.div}
          //     {...varFade().inRight}
          //     sx={{
          //       my: 1,
          //       px: 2,
          //       py: 0.75,
          //       borderRadius: 0.75,
          //       border: (theme) => `solid 1px ${theme.palette.divider}`,
          //     }}
          //   >
          //     <Iconify icon={'eva:file-fill'} sx={{ width: 28, height: 28, color: 'text.secondary', mr: 2 }} />
          //
          //     <ListItemText
          //       primary={isString(file) ? file : name}
          //       secondary={isString(file) ? '' : fData(size || 0)}
          //       primaryTypographyProps={{ variant: 'subtitle2' }}
          //       secondaryTypographyProps={{ variant: 'caption' }}
          //     />
          //
          //     <IconButton edge="end" size="small" onClick={() => onRemove(file)}>
          //       <Iconify icon={'eva:close-fill'} />
          //     </IconButton>
          //   </ListItem>
          // );
        })}
      </AnimatePresence>
    </List>
  );
}
