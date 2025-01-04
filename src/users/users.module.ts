import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from './entity/users.entity';

@Module({
  imports: [
    // 모듈 내에서 Repository 패턴에 사용할 엔티티 등록
    // Provider에 해당 엔티티의 Repository를 주입
    TypeOrmModule.forFeature([
      UserModel,
    ]),
  ],
  exports: [UsersService],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule { }
