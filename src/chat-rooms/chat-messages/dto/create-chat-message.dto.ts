import { PickType } from "@nestjs/mapped-types";
import { ChatMessageModel } from "../entity/chat-messages.entity";
import { IsNumber } from "class-validator";
import { numberValidationMessage } from "src/common/validation-message/validation-message";

export class CreateChatMessageDto extends PickType(ChatMessageModel, ['message']) {
  @IsNumber({}, { message: numberValidationMessage })
  chatRoomId: number;

  @IsNumber({}, { message: numberValidationMessage })
  authorId: number;
}