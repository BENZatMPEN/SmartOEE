export class ChangePasswordDto {
  readonly userId: number;
  readonly currentPassword: string;
  readonly newPassword: string;
}
