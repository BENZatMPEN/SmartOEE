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
import { ClassSerializerInterceptor, Inject, Logger, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { SocketService } from '../common/services/socket.service';
import { WsAuthGuard } from '../auth/ws-auth.guard';
import * as jwt from 'jsonwebtoken';
import { AuthUserDto } from '../auth/dto/auth-user.dto';
import { Read } from '../common/type/read';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TagReadEntity } from '../common/entities/tag-read.entity';
import configuration from '../configuration';
import { ConfigType } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { SiteService } from '../site/site.service';

@UseGuards(WsAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(configuration.KEY)
    private readonly config: ConfigType<typeof configuration>,
    private readonly siteService: SiteService,
    private readonly userService: UserService,
    private readonly socketService: SocketService,
    @InjectRepository(TagReadEntity)
    private readonly tagReadRepository: Repository<TagReadEntity>,
  ) {}

  @WebSocketServer()
  socket: Server;

  private readonly logger = new Logger(EventGateway.name);

  afterInit(server: any): any {
    this.socketService.socket = server;
  }

  async handleConnection(client: any, ...args: any[]): Promise<any> {
    const authorization = client?.request.headers.authorization;
    if (!authorization) {
      return;
    }

    try {
      const authUser = jwt.verify(authorization, this.config.token.secret) as AuthUserDto;
      const user = await this.userService.findById(authUser.id);
      const sites = user.isAdmin ? await this.siteService.findAll() : user.sites;
      (sites || []).forEach((site) => {
        client.join(`site_${site.id}`);
      });

      this.logger.log(`Client connected`);
    } catch {}
  }

  handleDisconnect(client: any): any {
    this.logger.log(`Client disconnected`);
  }

  @SubscribeMessage('tagReads')
  async onTagReads(@Request() req, @ConnectedSocket() socket: Socket, @MessageBody() data: Read) {
    const { siteId, timestamp } = data;
    this.socket.to(`site_${siteId}`).emit('tag-reads.updated', data);
    await this.tagReadRepository.save({
      siteId,
      timestamp,
      read: data,
    });
  }
}
