import { Module } from '@nestjs/common';
import { EventGateway } from './event.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagReadEntity } from '../common/entities/tag-read-entity';
import { WsStrategy } from '../auth/ws.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([TagReadEntity])],
  providers: [EventGateway, WsStrategy],
})
export class EventModule {}
