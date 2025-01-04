import { BaseModel } from "src/common/entity/base.entity";
import { UserModel } from "src/users/entity/users.entity";
import { Entity, ManyToMany, OneToMany } from "typeorm";
import { ChatMessageModel } from "../chat-messages/entity/chat-messages.entity";

@Entity()
export class ChatRoomModel extends BaseModel {
  @ManyToMany(() => UserModel, (user) => user.chatRooms)
  users: UserModel[];

  @OneToMany(() => ChatMessageModel, (message) => message.chatRoom)
  messages: ChatMessageModel[];

}