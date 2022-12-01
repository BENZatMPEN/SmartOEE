import { Module } from '@nestjs/common';
import { EventGateway } from './event.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagRead } from '../common/entities/tag-read';
import { WsStrategy } from '../auth/ws.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([TagRead])],
  providers: [EventGateway, WsStrategy],
})
export class EventModule {}
