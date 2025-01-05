import { IsNumber } from "class-validator";
import { numberValidationMessage } from "src/common/validation-pipe/validation-pipe-message";

export class EnterChatRoomsDto {
  @IsNumber({}, { each: true, message: numberValidationMessage })
  chatRoomIds: number[];
}
