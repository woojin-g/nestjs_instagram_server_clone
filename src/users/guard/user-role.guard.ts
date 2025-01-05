import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { USER_ROLE_KEY } from "../decorator/user-role.decorator";
import { ErrorCode } from "src/common/const/error.const";
import { CustomException } from "src/common/exception-filter/custom-exception";

@Injectable()
export class UserRoleGuard implements CanActivate {
  // Reflector
  //  - NestJS의 IoC 컨테이너가 자동으로 주입한다.
  //  - 데코레이터를 통해 설정된 메타데이터를 런타임에 조회할 수 있다.
  constructor(private readonly reflector: Reflector) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRole = this.reflector.getAllAndOverride(
      USER_ROLE_KEY,
      [
        // @UserRole('ADMIN')
        // class UserController {
        //   @UserRole('USER')
        //   getUsers() { }  // requiredRole은 'USER'가 됨 (메서드가 우선)
        // }

        // 메서드 레벨의 메타데이터를 1순위로 확인
        context.getHandler(),

        // 클래스 레벨의 메타데이터를 2순위로 확인
        context.getClass(),

        // 메타데이터가 없으면 undefined 반환
      ],
    );

    // UserRole 데코레이터가 없으면(메타데이터가 없으면) 모든 사용자가 접근 가능
    if (!requiredRole) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new CustomException(
        ErrorCode.UNAUTHORIZED,
        'UserRoleGuard를 사용하려면 AccessTokenGuard를 사용해야 합니다.',
      );
    }
    if (user.role !== requiredRole) {
      throw new CustomException(ErrorCode.FORBIDDEN, `${requiredRole} 권한이 필요합니다.`);
    }
    return true;
  }
}
