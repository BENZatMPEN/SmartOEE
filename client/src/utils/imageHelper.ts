import { HOST_IMAGE } from '../config';

export function getFileUrl(imageName: string | undefined): string | undefined {
  return imageName ? `${HOST_IMAGE}/uploads/${imageName}` : undefined;
}
