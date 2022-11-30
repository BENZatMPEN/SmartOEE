// @mui
import { SxProps } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { ReactNode } from 'react';
import { DropzoneOptions } from 'react-dropzone';

// ----------------------------------------------------------------------

export interface CustomFile extends File {
  path?: string;
  preview?: string;
}

export interface UploadProps extends DropzoneOptions {
  error?: boolean;
  currentFile?: string;
  file: CustomFile | string | null;
  helperText?: ReactNode;
  sx?: SxProps<Theme>;
  dropZoneSx?: SxProps<Theme>;
  dropZoneDesc?: boolean;
}

export interface UploadMultiFileProps extends DropzoneOptions {
  error?: boolean;
  files: (File | string)[];
  showPreview: boolean;
  onRemove: (file: File | string) => void;
  onRemoveAll: VoidFunction;
  sx?: SxProps<Theme>;
  helperText?: ReactNode;
}
