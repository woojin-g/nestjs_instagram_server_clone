import { IsNumber } from "class-validator";
import { numberValidationMessage } from "src/common/validation-pipe/validation-pipe-message";

export class CreateChatRoomDto {
  @IsNumber({}, { each: true, message: numberValidationMessage })
  userIds: number[];
}
