export function getFileUrl(imageName: string | undefined): string | undefined {
  return imageName ? `/uploads/${imageName}` : undefined;
}
