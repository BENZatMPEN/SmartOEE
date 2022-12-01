import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Client } from 'minio';
import configuration from '../../configuration';

@Injectable()
export class ContentService {
  readonly productBucket: string = 'products';
  readonly machineBucket: string = 'machines';
  readonly oeeBucket: string = 'oees';
  readonly siteBucket: string = 'sites';
  readonly attachmentBucket: string = 'attachments';
  readonly userBucket: string = 'users';
  readonly minioClient: Client;
  readonly minioLocation: string;
  readonly storageUrl: string;

  constructor(
    @Inject(configuration.KEY)
    private readonly config: ConfigType<typeof configuration>,
  ) {
    this.storageUrl = config.storageUrl;
    this.minioLocation = config.minio.location;
    this.minioClient = new Client({
      endPoint: config.minio.endPoint,
      port: config.minio.port,
      useSSL: config.minio.useSSL,
      accessKey: config.minio.accessKey,
      secretKey: config.minio.secretKey,
    });
  }

  async saveProductImage(objectName: string, contentBuffer: Buffer, contentType: string): Promise<string> {
    await this.ensureBucketExists(this.productBucket);
    await this.minioClient.putObject(this.productBucket, objectName, contentBuffer, contentBuffer.length, {
      'Content-Type': contentType,
    });
    return `${this.storageUrl}/${this.productBucket}/${objectName}`;
  }

  async saveMachineImage(objectName: string, contentBuffer: Buffer, contentType: string): Promise<string> {
    await this.ensureBucketExists(this.machineBucket);
    await this.minioClient.putObject(this.machineBucket, objectName, contentBuffer, contentBuffer.length, {
      'Content-Type': contentType,
    });
    return `${this.storageUrl}/${this.machineBucket}/${objectName}`;
  }

  async saveOeeImage(objectName: string, contentBuffer: Buffer, contentType: string): Promise<string> {
    await this.ensureBucketExists(this.oeeBucket);
    await this.minioClient.putObject(this.oeeBucket, objectName, contentBuffer, contentBuffer.length, {
      'Content-Type': contentType,
    });
    return `${this.storageUrl}/${this.oeeBucket}/${objectName}`;
  }

  async saveSiteImage(objectName: string, contentBuffer: Buffer, contentType: string): Promise<string> {
    await this.ensureBucketExists(this.siteBucket);
    await this.minioClient.putObject(this.siteBucket, objectName, contentBuffer, contentBuffer.length, {
      'Content-Type': contentType,
    });
    return `${this.storageUrl}/${this.siteBucket}/${objectName}`;
  }

  async saveAttachment(objectName: string, contentBuffer: Buffer, contentType: string): Promise<string> {
    await this.ensureBucketExists(this.attachmentBucket);
    await this.minioClient.putObject(this.attachmentBucket, objectName, contentBuffer, contentBuffer.length, {
      'Content-Type': contentType,
    });
    return `${this.storageUrl}/${this.attachmentBucket}/${objectName}`;
  }

  async saveUserImage(objectName: string, contentBuffer: Buffer, contentType: string): Promise<string> {
    await this.ensureBucketExists(this.userBucket);
    await this.minioClient.putObject(this.userBucket, objectName, contentBuffer, contentBuffer.length, {
      'Content-Type': contentType,
    });
    return `${this.storageUrl}/${this.userBucket}/${objectName}`;
  }

  private async ensureBucketExists(bucketName: string): Promise<void> {
    const bucketExists = await this.minioClient.bucketExists(bucketName);
    if (bucketExists) {
      return;
    }

    await this.minioClient.makeBucket(bucketName, this.minioLocation);
  }
}
