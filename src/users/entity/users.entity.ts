import { Column, Entity, OneToMany } from 'typeorm';
import { UserRole } from '../const/users.const';
import { PostModel } from 'src/posts/entity/posts.entity';
import { BaseModel } from 'src/common/entity/base.entity';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { IsString } from 'class-validator';
import { emailValidationMessage, lengthValidationMessage, notEmptyValidationMessage, stringValidationMessage } from 'src/common/validation-message/validation-message';
import { Exclude, Expose } from 'class-transformer';

// class-validator와 class-transformer는 Plain Object -> DTO 변환에 사용한다.

@Entity()
// 전체 프로퍼티에 Exclude 데코레이터를 적용하고, API 통신 시 보여줄 데이터만 Expose 데코레이터를 적용하도록 할 수도 있다.
// @Exclude()
export class UserModel extends BaseModel {
  @Column({ length: 20, unique: true })
  @IsString({ message: stringValidationMessage })
  @IsNotEmpty({ message: notEmptyValidationMessage })
  @Length(3, 20, { message: lengthValidationMessage })
  nickname: string;

  @Column({ unique: true })
  @IsEmail({}, { message: emailValidationMessage })
  @IsNotEmpty({ message: notEmptyValidationMessage })
  email: string;

  @Column()
  @IsString({ message: stringValidationMessage })
  @IsNotEmpty({ message: notEmptyValidationMessage })
  @Length(8, 20, { message: lengthValidationMessage })
  // API 통신 시 민감한 정보를 숨기는 데 사용한다.
  @Exclude({
    // toClassOnly
    //   - 클래스 인스턴스로, 즉, DTO로 변할될 때 적용 여부
    //   - Frontend -> Backend 통신 시 (Request)
    //
    // toPlainOnly
    //   - Plain Object로, 즉, JSON으로 변환될 때 적용 여부
    //   - Backend -> Frontend 통신 시 (Response)
    toPlainOnly: true, // Request 시 적용 X, Response 시 적용 O
  })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @OneToMany(() => PostModel, (post) => post.author)
  posts: PostModel[];

  @Column({ nullable: true })
  @Exclude()
  accessToken: string;

  @Column({ nullable: true })
  @Exclude()
  refreshToken: string;

  // API 통신 시 특정 프로퍼티를 추가하고 싶을 때 사용한다.
  @Expose()
  get nicknameAndEmail(): string {
    return `${this.nickname}/${this.email}`;
  }
}
