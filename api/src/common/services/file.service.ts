import { Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import * as path from 'path';
import * as fsPromises from 'fs/promises';
import { FileInfo } from '../type/file-info';
import sharp from 'sharp';

@Injectable()
export class FileService {
  async saveFile(file: Express.Multer.File): Promise<string> {
    const folderName = './uploads';
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const fileName = `${Date.now()}-${originalName}`;
    const filePath = path.resolve(path.join(folderName, `${fileName}`));

    if (file.mimetype.match(/^image/)) {
      await sharp(file.buffer, { animated: true }).toFile(filePath);
    } else {
      await fsPromises.writeFile(filePath, file.stream);
    }

    return fileName;
  }

  async saveFileInfo(file: Express.Multer.File): Promise<FileInfo> {
    const folderName = './uploads';
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const fileName = `${Date.now()}-${originalName}`;
    const filePath = path.resolve(path.join(folderName, `${fileName}`));

    if (file.mimetype.match(/^image/)) {
      await sharp(file.buffer, { animated: true }).toFile(filePath);
    } else {
      await fsPromises.writeFile(filePath, file.buffer);
    }

    return {
      name: originalName,
      fileName: fileName,
      length: file.buffer.length,
      mime: file.mimetype,
    };
  }

  async deleteFile(imageName: string): Promise<void> {
    const imagePath = path.resolve(path.join('./uploads', imageName));
    try {
      if (existsSync(imagePath)) {
        await fsPromises.unlink(imagePath);
      }
    } catch (err) {
      console.log(err);
    }
  }
}
