export class UpdateUserDto {
  readonly id: number;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly roleIds: number[];
}
