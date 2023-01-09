import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ReqDec = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest();
});
