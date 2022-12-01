import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ClassSerializerInterceptor, Logger, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { SocketService } from '../common/services/socket.service';
import { WsAuthGuard } from '../auth/ws-auth.guard';
import * as jwt from 'jsonwebtoken';
import { jwtConstants } from '../auth/constants';
import { AuthUserDto } from '../auth/dto/auth-user.dto';
import { Read } from '../common/type/read';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TagRead } from '../common/entities/tag-read';

@UseGuards(WsAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly socketService: SocketService,
    @InjectRepository(TagRead)
    private readonly tagReadRepository: Repository<TagRead>,
  ) {}

  @WebSocketServer()
  socket: Server;

  private readonly logger = new Logger(EventGateway.name);

  afterInit(server: any): any {
    this.socketService.socket = server;
  }

  handleConnection(client: any, ...args: any[]): any {
    const user = jwt.verify(client.request.headers.authorization, jwtConstants.secret) as AuthUserDto;
    (user.sites || []).forEach((id) => {
      client.join(`site_${id}`);
    });

    this.logger.log(`Client connected`);
  }

  handleDisconnect(client: any): any {
    this.logger.log(`Client disconnected`);
  }

  @SubscribeMessage('tagReads')
  async onTagReads(@Req() req, @ConnectedSocket() socket: Socket, @MessageBody() data: Read) {
    const { siteId, timestamp } = data;
    this.socket.to(`site_${siteId}`).emit('tag-reads.updated', data);
    await this.tagReadRepository.save({
      siteId,
      timestamp,
      read: data,
    });
  }
}
