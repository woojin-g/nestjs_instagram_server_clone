import { ConnectedSocket, MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { CreateChatRoomDto as CreateChatRoomDto } from "./dto/create-chat-room.dto";
import { ChatRoomsService } from "./chat-rooms.service";
import { EnterChatRoomsDto as EnterChatRoomDto } from "./dto/enter-chat-rooms.dto";
import { ErrorCode } from "src/common/const/error.const";
import { CreateChatMessageDto } from "./chat-messages/dto/create-chat-message.dto";
import { ChatMessagesService } from "./chat-messages/chat-messages.service";

@WebSocketGateway({
  // ws://localhost:3000/chat-rooms
  namespace: 'chat-rooms',
})
export class ChatRoomsGateway implements OnGatewayConnection {
  constructor(
    private readonly chatsService: ChatRoomsService,
    private readonly chatMessagesService: ChatMessagesService,
  ) { }

  // NestJS 프레임워크에서 제공하는 서버 인스턴스
  @WebSocketServer()
  server: Server;

  // 소켓(클라이언트) 연결 시 호출됨
  handleConnection(socket: Socket) {
    console.log(`${socket.id} has connected`);
  }

  // ! 실제 개발 시에는 REST API를 활용하는 것이 더 적절하다.
  @SubscribeMessage('create_chat_room')
  async createChatRoom(
    @MessageBody() body: CreateChatRoomDto,
  ) {
    const chatRoom = await this.chatsService.createChatRoom(body);
  }

  @SubscribeMessage('enter_chat_room')
  async enterChatRoom(
    // 채팅방 ID들을 받는다.
    @MessageBody() body: EnterChatRoomDto,
    @ConnectedSocket() socket: Socket,
  ) {
    for (const chatRoomId of body.chatRoomIds) {
      await this.chatsService.checkIfChatRoomExistsAndThrow(chatRoomId);
    }
    await socket.join(body.chatRoomIds.map((chatRoomId) => chatRoomId.toString()));
  }

  // 소켓으로부터 'send_message' 이벤트 수신 시 호출됨
  @SubscribeMessage('send_message')
  async onMessageReceived(
    @MessageBody() dto: CreateChatMessageDto,
    @ConnectedSocket() socket: Socket,
  ) {
    console.log(`Message received from ${socket.id} to ${dto.chatRoomId}: ${dto.message}`);

    await this.chatsService.checkIfChatRoomExistsAndThrow(dto.chatRoomId);
    const message = await this.chatMessagesService.createMessage(dto);

    // 연결된 모든 소켓에 이벤트 전송
    // this.server.emit('server_event', message.message);

    // 특정 채팅방에 있는 모든 소켓에 이벤트 전송
    // this.server
    //   .in(message.chatRoomId.toString())
    //   .emit('server_event', message.message);

    // 특정 채팅방에 있는 모든 소켓에 이벤트를 전송하되, 발신자에 해당하는 소켓은 제외
    socket
      .to(dto.chatRoomId.toString())
      .emit('on_broadcast', message.message);

    console.log(`Message has been broadcasted to ${dto.chatRoomId}: ${message.message}`);
  }
}

