import { BadRequestException, Controller, Get, HttpStatus, Param, ParseIntPipe, Query } from "@nestjs/common";
import { ChatMessagesService } from "./chat-messages.service";
import { ChatMessagesPaginationRequestDto } from "./dto/chat-messages-pagination.dto";
import { ErrorCode } from "src/common/const/error.const";

@Controller('chat-rooms/:chatRoomId/messages')
export class ChatMessagesController {
  constructor(
    private readonly chatMessagesService: ChatMessagesService,
  ) { }

  @Get()
  getChatMessages(
    @Param('chat-room-id', ParseIntPipe) chatRoomId: number,
    @Query() dto: ChatMessagesPaginationRequestDto,
  ) {
    return this.chatMessagesService.paginateChatMessages(
      dto,
      {
        where: {
          chatRoom: { id: chatRoomId },
        },
      },
    );
  }
}