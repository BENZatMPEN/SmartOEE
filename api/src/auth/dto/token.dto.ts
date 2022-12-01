import { AuthUserDto } from './auth-user.dto';

export class TokenDto {
  readonly accessToken: string;
  readonly user: AuthUserDto;
}
