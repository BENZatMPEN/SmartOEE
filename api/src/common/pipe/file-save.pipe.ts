import { Injectable, PipeTransform } from '@nestjs/common';
import { FileService } from '../services/file.service';

@Injectable()
export class FileSavePipe implements PipeTransform<Express.Multer.File, Promise<string>> {
  constructor(private readonly fileService: FileService) {}

  async transform(file: Express.Multer.File): Promise<string> {
    if (!file) {
      return null;
    }

    return this.fileService.saveFile(file);
  }
}
