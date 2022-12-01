import { RoleSetting } from '../../common/type/role-setting';

export class CreateRoleDto {
  readonly name: string;
  readonly remark: string;
  readonly roles: RoleSetting[];
  readonly siteId: number;
}
