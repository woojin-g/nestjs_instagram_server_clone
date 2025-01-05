import { SetMetadata } from "@nestjs/common";
import { UserRoleType } from "../const/users.const";

export const USER_ROLE_KEY = 'user_role';

// RBAC(Role Based Access Control) 적용을 위한 데코레이터
// - @UserRole(UserRoleType.ADMIN) 방식으로 데코레이터 지정 가능
// - 해당 데코레이터를 통해, USER_ROLE_KEY를 키로 하고, role을 값으로 갖는 메타데이터를 설정하면,
//   이후 실행될 Guard 등에서 이 메타데이터를 접근하여 활용할 수 있다.
// - SetMetadata : NestJS에서 제공하는 메타데이터 설정 데코레이터
export const UserRole = (role: UserRoleType) => SetMetadata(USER_ROLE_KEY, role);