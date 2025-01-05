import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from "@nestjs/common";
import { ChatMessagesService } from "./chat-messages.service";
import { ChatMessagesPaginationRequestDto } from "./dto/chat-messages-pagination.dto";
import { AuthService } from "src/auth/auth.service";
import { UsersService } from "src/users/users.service";
import { CursorPaginationResponseDto } from "src/common/dto/base-pagination.dto";
import { PagePaginationResponseDto } from "src/common/dto/base-pagination.dto";
import { ChatMessageModel } from "./entity/chat-messages.entity";

@Controller('chat-rooms/:roomId/messages')
export class ChatMessagesController {
  constructor(
    private readonly chatMessagesService: ChatMessagesService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) { }

  @Get()
  getChatMessages(
    @Param('roomId', ParseIntPipe) chatRoomId: number,
    @Query() dto: ChatMessagesPaginationRequestDto,
  ): Promise<PagePaginationResponseDto<ChatMessageModel> | CursorPaginationResponseDto<ChatMessageModel>> {
    return this.chatMessagesService.paginateChatMessages(
      chatRoomId,
      dto,
    );
  }
}