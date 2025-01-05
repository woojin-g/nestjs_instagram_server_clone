import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { CreateChatRoomDto as CreateChatRoomDto } from "./dto/create-chat-room.dto";
import { ChatRoomsService } from "./chat-rooms.service";
import { EnterChatRoomsDto as EnterChatRoomDto } from "./dto/enter-chat-rooms.dto";
import { CreateChatMessageDto } from "./chat-messages/dto/create-chat-message.dto";
import { ChatMessagesService } from "./chat-messages/chat-messages.service";
import { ConsoleLogger, HttpException, UseFilters, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { defaultValidationPipeOptions } from "src/common/validation-pipe/validation-pipe-options";
import { SocketExceptionFilter } from "src/common/exception-filter/socket.exception-filter";
import { UserModel } from "src/users/entity/users.entity";
import { UsersService } from "src/users/users.service";
import { ErrorCode } from "src/common/const/error.const";
import { CustomException, transformHttpExceptionToErrorResponse } from "src/common/exception-filter/custom-exception";
import { TokenPrefix } from "src/auth/const/auth.const";
import { AuthService } from "src/auth/auth.service";

@WebSocketGateway({
  // ws://localhost:3000/chat-rooms
  namespace: 'chat-rooms',
})
export class ChatRoomsGateway implements OnGatewayConnection, OnGatewayInit {
  constructor(
    private readonly chatsService: ChatRoomsService,
    private readonly chatMessagesService: ChatMessagesService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) { }

  // NestJS 프레임워크에서 제공하는 서버 인스턴스
  @WebSocketServer()
  server: Server;

  // 소켓 서버(Gateway) 초기화 후 호출됨
  // server: 위의 server: Server 인스턴스
  afterInit(server: any) {
    console.log('After Gateway Init');
  }

  // 소켓(클라이언트) 연결 시 호출됨
  async handleConnection(socket: Socket & { user: UserModel }) {
    console.log(`${socket.id} has connected`);
    try {
      const headers = socket.handshake.headers;
      const rawToken = headers['authorization'];
      if (!rawToken) {
        throw new CustomException(ErrorCode.UNAUTHORIZED__NO_TOKEN);
      }
      // 소켓에 user 정보 추가(소켓 연결이 지속되는 동안 유지됨)
      // 즉, 최초 연결 시에만 토큰 검증을 실행하면 연결이 해제될 때까지 검증을 다시 할 필요가 없다.
      const token = this.authService.extractTokenFromHeader(rawToken, TokenPrefix.BEARER);
      const payload = this.authService.verifyToken(token);
      const user = await this.usersService.getUserByEmail(payload.email);
      socket.user = user;
    } catch (e) {
      // 클라이언트에 에러 전달 후 연결 해제
      if (e instanceof HttpException) {
        const { status, errorCode, message } = transformHttpExceptionToErrorResponse(e);
        socket.emit('exception', {
          status,
          errorCode,
          message,
        });
      }
      socket.disconnect();
    }
  }

  // 소켓(클라이언트) 연결 해제 시 호출됨
  handleDisconnect(socket: Socket) {
    console.log(`${socket.id} has disconnected`);
  }

  // ! 실제 개발 시에는 REST API를 활용하는 것이 더 적절하다.
  @SubscribeMessage('create_chat_room')
  // ! 현재 NestJS 버전의 경우, 아래에 적용한 ValidationPipe가 SocketIO 통신 시에는 적용되지 않는다. 따라서, 개별 호출 마다 적용해야 한다.
  //  - 개별 Pipe를 적용하지 않으면, 잘못된 타입이 전달되는 경우, 무조건 Internal Server Error가 발생한다.
  //  - 개별 Pipe를 적용하면, 잘못된 타입이 전달되는 경우, Bad Request Exception이 발생하고, WsExceptionsHandler가 이를 처리하여 클라이언트에서는 마찬가지로 Internal Server Error를 받게 된다.
  //  - 따라서, BaseWsExceptionFilter를 상속받아 HttpException 타입의 예외를 'exception' 이벤트로 전달하는 필터를 적용한다.
  @UsePipes(new ValidationPipe(defaultValidationPipeOptions))
  @UseFilters(new SocketExceptionFilter())
  async createChatRoom(
    @MessageBody() body: CreateChatRoomDto,
    @ConnectedSocket() socket: Socket & { user: UserModel },
  ) {
    const chatRoom = await this.chatsService.createChatRoom(body);
  }

  @SubscribeMessage('enter_chat_room')
  @UsePipes(new ValidationPipe(defaultValidationPipeOptions))
  @UseFilters(new SocketExceptionFilter())
  async enterChatRoom(
    // 채팅방 ID들을 받는다.
    @MessageBody() body: EnterChatRoomDto,
    @ConnectedSocket() socket: Socket & { user: UserModel },
  ) {
    for (const chatRoomId of body.chatRoomIds) {
      await this.chatsService.checkIfChatRoomExistsAndThrow(chatRoomId);
    }
    await socket.join(body.chatRoomIds.map((chatRoomId) => chatRoomId.toString()));
  }

  // 소켓으로부터 'send_message' 이벤트 수신 시 호출됨
  @SubscribeMessage('send_message')
  @UsePipes(new ValidationPipe(defaultValidationPipeOptions))
  @UseFilters(new SocketExceptionFilter())
  async onMessageReceived(
    @MessageBody() dto: CreateChatMessageDto,
    @ConnectedSocket() socket: Socket & { user: UserModel },
  ) {
    console.log(`Message received from ${socket.id} to ${dto.chatRoomId}: ${dto.message}`);

    await this.chatsService.checkIfChatRoomExistsAndThrow(dto.chatRoomId);
    const message = await this.chatMessagesService.createMessage(dto, socket.user.id);

    // 연결된 모든 소켓에 이벤트 전송
    // this.server.emit('server_event', message.message);

    // 특정 채팅방에 있는 모든 소켓에 이벤트 전송
    // this.server
    //   .in(message.chatRoomId.toString())
    //   .emit('server_event', message.message);

    // 특정 채팅방에 있는 모든 소켓에 이벤트를 전송하되, 발신자에 해당하는 소켓은 제외
    socket
      .to(message.chatRoom.id.toString())
      .emit('on_message', message.message);

    console.log(`Message has been broadcasted to ${message.chatRoom.id}: ${message.message}`);
  }
}

