import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';
import { SiteService } from '../../site/site.service';

@Injectable()
export class SiteValidationInterceptor implements NestInterceptor {
  constructor(private readonly siteService: SiteService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const { query } = request;

    // TODO: might need to move to Guard
    if ('siteId' in query) {
      this.siteService
        .findById(Number(0))
        .then((site) => {
          if (!site) {
            return next.handle().pipe(catchError((err) => throwError(() => new BadRequestException())));
          }
          return next.handle();
        })
        .catch((error) => {
          return next.handle().pipe(catchError((err) => throwError(() => new InternalServerErrorException())));
        });
    }

    return next.handle().pipe(catchError((err) => throwError(() => new BadRequestException())));
  }
}
