import { IsString } from "class-validator";
import { ChatRoomModel } from "src/chat-rooms/entity/chat-rooms.entity";
import { BaseModel } from "src/common/entity/base.entity";
import { stringValidationMessage } from "src/common/validation-message/validation-message";
import { UserModel } from "src/users/entity/users.entity";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity()
export class ChatMessageModel extends BaseModel {
  @ManyToOne(() => ChatRoomModel, (chatRoom) => chatRoom.messages)
  chatRoom: ChatRoomModel;

  @ManyToOne(() => UserModel, (user) => user.messages)
  author: UserModel;

  @Column()
  @IsString({ message: stringValidationMessage })
  message: string;
}
