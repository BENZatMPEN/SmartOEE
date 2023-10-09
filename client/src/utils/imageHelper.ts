import { HOST_API } from '../config';

export function getFileUrl(imageName: string | undefined): string | undefined {
  return imageName ? `${HOST_API}/uploads/${imageName}` : undefined;
}
