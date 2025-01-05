import { Injectable } from "@nestjs/common";
import { FindManyOptions, FindOptionsWhere, Repository } from "typeorm";
import { ChatMessageModel } from "./entity/chat-messages.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CommonService } from "src/common/common.service";
import { ChatMessagesPaginationRequestDto } from "./dto/chat-messages-pagination.dto";
import { CursorPaginationResponseDto, PagePaginationResponseDto } from "src/common/dto/base-pagination.dto";
import { CreateChatMessageDto } from "./dto/create-chat-message.dto";

@Injectable()
export class ChatMessagesService {
  constructor(
    @InjectRepository(ChatMessageModel)
    private readonly chatMessagesRepository: Repository<ChatMessageModel>,
    private readonly commonService: CommonService,
  ) { }

  paginateChatMessages(
    chatRoomId: number,
    dto: ChatMessagesPaginationRequestDto,
  ): Promise<PagePaginationResponseDto<ChatMessageModel> | CursorPaginationResponseDto<ChatMessageModel>> {
    return this.commonService.paginate(
      dto,
      this.chatMessagesRepository,
      {
        where: {
          chatRoom: { id: chatRoomId },
        },
        relations: {
          author: true,
        }
      },
      `chat-rooms/${chatRoomId}/messages`,
    );
  }

  async createMessage(
    dto: CreateChatMessageDto,
    authorId: number,
  ): Promise<ChatMessageModel> {
    const message = await this.chatMessagesRepository.save({
      chatRoom: { id: dto.chatRoomId },
      author: { id: authorId },
      message: dto.message,
    });

    return this.chatMessagesRepository.findOne({
      where: { id: message.id },
      relations: { chatRoom: true, author: true },
    });
  }
}
