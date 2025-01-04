import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatRoomModel } from './entity/chat-rooms.entity';
import { Repository } from 'typeorm';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { CommonService } from 'src/common/common.service';
import { ChatRoomsPaginationRequestDto } from './dto/chat-rooms-pagination.dto';
import { CursorPaginationResponseDto, PagePaginationResponseDto } from 'src/common/dto/base-pagination.dto';
import { ErrorCode } from 'src/common/const/error.const';
import { CustomException } from 'src/common/exception-filter/custom-exception';

@Injectable()
export class ChatRoomsService {
  constructor(
    @InjectRepository(ChatRoomModel)
    private readonly chatRoomsRepository: Repository<ChatRoomModel>,
    private readonly commonService: CommonService,
  ) { }

  async createChatRoom(dto: CreateChatRoomDto): Promise<ChatRoomModel> {
    const chatRoom = await this.chatRoomsRepository.save({
      users: dto.userIds.map((id) => ({ id })),
    });
    return this.chatRoomsRepository.findOne({
      where: { id: chatRoom.id },
      relations: { users: true },
    });
  }

  async paginateChatRooms(dto: ChatRoomsPaginationRequestDto)
    : Promise<CursorPaginationResponseDto<ChatRoomModel> | PagePaginationResponseDto<ChatRoomModel>> {
    return this.commonService.paginate(
      dto,
      this.chatRoomsRepository,
      {
        relations: {
          users: true,
        },
      },
      'chat-rooms',
    );
  }

  checkIfChatRoomExists(chatRoomId: number): Promise<boolean> {
    return this.chatRoomsRepository.existsBy({ id: chatRoomId });
  }

  async checkIfChatRoomExistsAndThrow(chatRoomId: number): Promise<void> {
    if (!(await this.checkIfChatRoomExists(chatRoomId))) {
      throw new CustomException(
        ErrorCode.NOT_FOUND__CHAT_ROOM,
        `존재하지 않는 채팅방입니다 - chatRoomId: ${chatRoomId}`,
      );
    }
  }
}
