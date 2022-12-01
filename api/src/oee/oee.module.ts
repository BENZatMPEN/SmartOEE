import { Module } from '@nestjs/common';
import { ContentModule } from '../common/content/content.module';
import { OeeService } from './oee.service';
import { OeeController } from './oee.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Oee } from '../common/entities/oee';
import { OeeProduct } from '../common/entities/oee-product';
import { OeeMachine } from '../common/entities/oee-machine';
import { Site } from '../common/entities/site';
import { OeeBatch } from '../common/entities/oee-batch';
import { SocketService } from '../common/services/socket.service';
import { SocketModule } from '../common/services/socket.module';

@Module({
  imports: [ContentModule, TypeOrmModule.forFeature([Oee, OeeProduct, OeeMachine, OeeBatch, Site])],
  controllers: [OeeController],
  providers: [OeeService],
})
export class OeeModule {}
