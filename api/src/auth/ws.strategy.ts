import { Inject, Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import * as jwt from 'jsonwebtoken';
import { AuthUserDto } from './dto/auth-user.dto';
import { WsException } from '@nestjs/websockets';
import configuration from '../configuration';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class WsStrategy extends PassportStrategy(Strategy, 'ws') {
  private readonly logger = new Logger(WsStrategy.name);
  private readonly invalidMessage = 'Invalid credentials';

  constructor(
    @Inject(configuration.KEY)
    private readonly config: ConfigType<typeof configuration>,
  ) {
    super();
  }

  validate(req: Request, payload: any) {
    if ('handshake' in req) {
      const { headers } = req['handshake'];
      const { authorization } = headers;

      if (!authorization) {
        throw new WsException(this.invalidMessage);
      }

      try {
        return jwt.verify(authorization, this.config.token.secret) as AuthUserDto;
      } catch (err) {
        throw new WsException(this.invalidMessage);
      }
    }

    throw new WsException(this.invalidMessage);
  }
}
