import { Module } from '@nestjs/common';
import { ChatRoomsService } from './chat-rooms.service';
import { ChatRoomsController } from './chat-rooms.controller';
import { ChatRoomsGateway } from './chat-rooms.gateway';
import { ChatRoomModel } from './entity/chat-rooms.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';
import { ChatMessagesService } from './chat-messages/chat-messages.service';
import { ChatMessageModel } from './chat-messages/entity/chat-messages.entity';
import { ChatMessagesController } from './chat-messages/chat-messages.controller';

@Module({
  imports: [
    // 모듈 내에서 Repository 패턴에 사용할 엔티티 등록
    // Provider에 해당 엔티티의 Repository를 주입
    TypeOrmModule.forFeature([
      // ChatRoomsService, ChatRoomsGateway 에 주입하기 위함
      ChatRoomModel,
      // ChatMessagesService 에 주입하기 위함
      ChatMessageModel,
    ]),
    CommonModule,
  ],
  controllers: [
    ChatRoomsController,
    ChatMessagesController,
  ],
  providers: [
    ChatRoomsService,
    ChatRoomsGateway,
    ChatMessagesService,
  ],
})
export class ChatRoomsModule { }
