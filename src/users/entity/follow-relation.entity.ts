import { BaseModel } from "src/common/entity/base.entity";
import { UserModel } from "./users.entity";
import { Column, Entity, ManyToMany, ManyToOne } from "typeorm";

/**
 * 팔로우 관계
 * 
 * UserModel과 UserModel 사이의 ManyToMany 관계를 표현하기 위한 엔티티
 */
@Entity()
export class FollowRelationModel extends BaseModel {
  // 팔로우 하는 사람
  @ManyToOne(() => UserModel, (user) => user.following)
  follower: UserModel;

  // 팔로우 받는 사람
  @ManyToOne(() => UserModel, (user) => user.followers)
  followee: UserModel;

  @Column({ default: false })
  isConfirmed: boolean = false;
}
