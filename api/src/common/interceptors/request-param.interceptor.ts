import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

export const REQUEST_PARAM_ID = '_paramId';

@Injectable()
export class InjectParamIdInterceptor implements NestInterceptor {
  constructor(private type: 'query' | 'body' | 'params') {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (this.type && request[this.type]) {
      request[this.type][REQUEST_PARAM_ID] = Number(request?.params.id);
    }

    return next.handle();
  }
}
