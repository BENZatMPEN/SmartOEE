import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class SiteIdPipe implements PipeTransform<any, Promise<number>> {
  async transform(req: any, metadata: ArgumentMetadata): Promise<number> {
    if (!req.query['siteId']) {
      throw new BadRequestException();
    }

    return Number(req.query['siteId']);
  }
}
