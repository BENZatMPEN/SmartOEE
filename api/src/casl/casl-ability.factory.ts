import { Ability, AbilityBuilder, AbilityClass, InferSubjects } from '@casl/ability';
import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthUserDto } from '../auth/dto/auth-user.dto';
import { RoleAction, RoleSubject } from '../common/type/role-setting';
import { AuthService } from '../auth/auth.service';
import { RoleEntity } from '../common/entities/role.entity';

type Subjects = InferSubjects<RoleSubject> | 'all';

export type AppAbility = Ability<[RoleAction, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: AuthUserDto, role: RoleEntity) {
    const { can, cannot, build } = new AbilityBuilder<Ability<[RoleAction, Subjects]>>(
      Ability as AbilityClass<AppAbility>,
    );

    if (!user) {
      cannot(RoleAction.Manage, RoleSubject.All);
      return build();
    }

    // if (user.isAdmin) {
    //   can([RoleAction.Manage], RoleSubject.All);
    // } else {
    if (!role) {
      cannot(RoleAction.Manage, RoleSubject.All);
    } else {
      for (const sub of role.roles) {
        can(sub.actions, sub.subject);
      }
    }
    // }

    return build({
      // Read https://casl.js.org/v5/en/guide/subject-type-detection#use-classes-as-subject-types for details
      // detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}

interface IPolicyHandler {
  handle(ability: AppAbility): boolean;
}

type PolicyHandlerCallback = (ability: AppAbility) => boolean;

export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;

export const CHECK_POLICIES_KEY = 'check_policy';
export const CheckPolicies = (...handlers: PolicyHandler[]) => SetMetadata(CHECK_POLICIES_KEY, handlers);

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers = this.reflector.get<PolicyHandler[]>(CHECK_POLICIES_KEY, context.getHandler()) || [];
    const { user, query } = context.switchToHttp().getRequest();
    const role: RoleEntity = null;

    // if (!user.isAdmin) {
    const { siteId } = query;
    if (siteId) {
      // TODO: get user role
      // role = await this.authService.findRoleByUserIdAndSiteId(user.id, Number(siteId));
    }
    // }

    const ability = this.caslAbilityFactory.createForUser(user, role);

    return policyHandlers.every((handler) => this.execPolicyHandler(handler, ability));
  }

  private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
    if (typeof handler === 'function') {
      return handler(ability);
    }
    return handler.handle(ability);
  }
}

// export class ReadArticlePolicyHandler implements IPolicyHandler {
//   handle(ability: AppAbility) {
//     // check ability
//     console.log(ability.can(RoleAction.Read, RoleSubject.Dashboard));
//     return ability.can(RoleAction.Read, RoleSubject.Dashboard);
//   }
// }
//
// export class UpdateArticlePolicyHandler implements IPolicyHandler {
//   handle(ability: AppAbility) {
//     // check ability
//     console.log(ability.can(RoleAction.Update, RoleSubject.Dashboard));
//     return ability.can(RoleAction.Update, RoleSubject.Dashboard);
//   }
// }
