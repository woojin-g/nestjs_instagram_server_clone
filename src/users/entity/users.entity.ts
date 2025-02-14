import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { UserRoleType } from '../const/users.const';
import { PostModel } from 'src/posts/entity/posts.entity';
import { BaseModel } from 'src/common/entity/base.entity';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { IsString } from 'class-validator';
import { emailValidationMessage, lengthValidationMessage, notEmptyValidationMessage, stringValidationMessage } from 'src/common/validation-pipe/validation-pipe-message';
import { Exclude, Expose } from 'class-transformer';
import { ChatRoomModel } from 'src/chat-rooms/entity/chat-rooms.entity';
import { ChatMessageModel } from 'src/chat-rooms/chat-messages/entity/chat-messages.entity';
import { CommentModel } from 'src/posts/comments/entity/comments.entity';
import { FollowRelationModel } from './follow-relation.entity';

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
    enum: UserRoleType,
    default: UserRoleType.USER,
  })
  role: UserRoleType;

  @OneToMany(() => PostModel, (post) => post.author)
  posts: PostModel[];

  @OneToMany(() => CommentModel, (comment) => comment.author)
  comments: CommentModel[];

  @ManyToMany(() => ChatRoomModel, (chatRoom) => chatRoom.users)
  @JoinTable()
  chatRooms: ChatRoomModel[];

  @OneToMany(() => ChatMessageModel, (message) => message.author)
  messages: ChatMessageModel[];

  // 나를 팔로우하는 사람
  @OneToMany(() => FollowRelationModel, (relation) => relation.followee)
  followers: FollowRelationModel[];

  // 내가 팔로우하는 사람
  @OneToMany(() => FollowRelationModel, (relation) => relation.follower)
  following: FollowRelationModel[];

  // 팔로워 수와 팔로잉 수는 매번 쿼리를 통해 계산하는 것이 아니라, 따로 컬럼으로 둔다.
  @Column({ default: 0 })
  followerCount: number = 0;

  @Column({ default: 0 })
  followingCount: number = 0;

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
