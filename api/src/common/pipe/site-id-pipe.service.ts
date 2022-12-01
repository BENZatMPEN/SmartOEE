import { ArgumentMetadata, Injectable, PipeTransform, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class SiteIdPipe implements PipeTransform<any, Promise<number>> {
  async transform(req: any, metadata: ArgumentMetadata): Promise<number> {
    if (!req.query['siteId']) {
      throw new UnauthorizedException();
    }

    return Number(req.query['siteId']);
  }
}
