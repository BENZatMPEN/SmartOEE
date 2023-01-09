import { applyDecorators, UseInterceptors, UsePipes } from '@nestjs/common';
import { InjectUserInterceptor, REQUEST_USER } from '../interceptors/request-user.interceptor';
import { InjectParamIdInterceptor, REQUEST_PARAM_ID } from '../interceptors/request-param.interceptor';
import { StripRequestContextPipe } from '../pipe/strip-request-context.pipe';

export function InjectUserTo(context: 'query' | 'body' | 'params') {
  return applyDecorators(
    UseInterceptors(new InjectUserInterceptor(context)),
    UsePipes(new StripRequestContextPipe(REQUEST_USER)),
  );
}

export function InjectParamIdTo(context: 'query' | 'body' | 'params') {
  return applyDecorators(
    UseInterceptors(new InjectParamIdInterceptor(context)),
    UsePipes(new StripRequestContextPipe(REQUEST_PARAM_ID)),
  );
}
