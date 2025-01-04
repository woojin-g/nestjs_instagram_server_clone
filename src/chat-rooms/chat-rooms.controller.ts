import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ChatRoomsService } from './chat-rooms.service';
import { ChatRoomsPaginationRequestDto } from './dto/chat-rooms-pagination.dto';
import { CursorPaginationResponseDto } from 'src/common/dto/base-pagination.dto';
import { ChatRoomModel } from './entity/chat-rooms.entity';
import { PagePaginationResponseDto } from 'src/common/dto/base-pagination.dto';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';

@Controller('chat-rooms')
export class ChatRoomsController {
  constructor(
    private readonly chatRoomsService: ChatRoomsService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) { }

  @Get()
  @UseGuards(AccessTokenGuard)
  getChatRooms(
    @Query() dto: ChatRoomsPaginationRequestDto,
  ): Promise<CursorPaginationResponseDto<ChatRoomModel> | PagePaginationResponseDto<ChatRoomModel>> {
    return this.chatRoomsService.paginateChatRooms(dto);
  }
}
