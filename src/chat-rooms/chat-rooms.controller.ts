import { Controller, Get, Query } from '@nestjs/common';
import { ChatRoomsService } from './chat-rooms.service';
import { ChatRoomsPaginationRequestDto } from './dto/chat-rooms-pagination.dto';
import { CursorPaginationResponseDto } from 'src/common/dto/base-pagination.dto';
import { ChatRoomModel } from './entity/chat-rooms.entity';
import { PagePaginationResponseDto } from 'src/common/dto/base-pagination.dto';

@Controller('chat-rooms')
export class ChatRoomsController {
  constructor(private readonly chatRoomsService: ChatRoomsService) { }

  @Get()
  getChatRooms(
    @Query() dto: ChatRoomsPaginationRequestDto,
  ): Promise<CursorPaginationResponseDto<ChatRoomModel> | PagePaginationResponseDto<ChatRoomModel>> {
    return this.chatRoomsService.paginateChatRooms(dto);
  }
}
