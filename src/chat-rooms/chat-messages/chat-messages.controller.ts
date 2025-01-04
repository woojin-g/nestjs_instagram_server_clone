import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from "@nestjs/common";
import { ChatMessagesService } from "./chat-messages.service";
import { ChatMessagesPaginationRequestDto } from "./dto/chat-messages-pagination.dto";
import { AccessTokenGuard } from "src/auth/guard/bearer-token.guard";
import { AuthService } from "src/auth/auth.service";
import { UsersService } from "src/users/users.service";

@Controller('chat-rooms/:roomId/messages')
export class ChatMessagesController {
  constructor(
    private readonly chatMessagesService: ChatMessagesService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) { }

  @Get()
  @UseGuards(AccessTokenGuard)
  getChatMessages(
    @Param('roomId', ParseIntPipe) chatRoomId: number,
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