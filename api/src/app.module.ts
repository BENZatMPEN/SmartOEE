import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaslModule } from './casl/casl.module';
import { AuthModule } from './auth/auth.module';
import { User } from './common/entities/user';
import { RoleModule } from './role/role.module';
import { Role } from './common/entities/role';
import { SiteModule } from './site/site.module';
import { Site } from './common/entities/site';
import { SiteService } from './site/site.service';
import { ContentModule } from './common/content/content.module';
import { PlannedDowntimeModule } from './planned-downtime/planned-downtime.module';
import { PlannedDowntime } from './common/entities/planned-downtime';
import { PlannedDowntimeService } from './planned-downtime/planned-downtime.service';
import { DeviceModelModule } from './device-model/device-model.module';
import { DeviceModelService } from './device-model/device-model.service';
import { DeviceModel } from './common/entities/device-model';
import { DeviceModelTag } from './common/entities/device-model-tag';
import { DeviceModule } from './device/device.module';
import { Device } from './common/entities/device';
import { DeviceTag } from './common/entities/device-tag';
import { DeviceService } from './device/device.service';
import { Product } from './common/entities/product';
import { ProductModule } from './product/product.module';
import { ProductService } from './product/product.service';
import { MachineService } from './machine/machine.service';
import { MachineModule } from './machine/machine.module';
import { Machine } from './common/entities/machine';
import { MachineParameter } from './common/entities/machine-parameter';
import { OeeModule } from './oee/oee.module';
import { OeeService } from './oee/oee.service';
import { OeeMachine } from './common/entities/oee-machine';
import { OeeProduct } from './common/entities/oee-product';
import { Oee } from './common/entities/oee';
import { Faq } from './common/entities/faq';
import { FaqAttachment } from './common/entities/faq-attachment';
import { Attachment } from './common/entities/attachment';
import { FaqModule } from './faq/faq.module';
import { FaqService } from './faq/faq.service';
import { ProblemSolution } from './common/entities/problem-solution';
import { ProblemSolutionAttachment } from './common/entities/problem-solution-attachment';
import { ProblemSolutionTask } from './common/entities/problem-solution-task';
import { ProblemSolutionTaskAttachment } from './common/entities/problem-solution-task-attachment';
import { ProblemSolutionModule } from './problem-solution/problem-solution.module';
import { ProblemSolutionTaskModule } from './problem-solution-task/problem-solution-task.module';
import { ProblemSolutionService } from './problem-solution/problem-solution.service';
import { EventModule } from './event/event.module';
import { OeeBatch } from './common/entities/oee-batch';
import { OeeBatchModule } from './oee-batch/oee-batch.module';
import { OeeBatchA } from './common/entities/oee-batch-a';
import { OeeBatchP } from './common/entities/oee-batch-p';
import { OeeBatchQ } from './common/entities/oee-batch-q';
import { OeeBatchPlannedDowntime } from './common/entities/oee-batch-planned-downtime';
import { Widget } from './common/entities/widget';
import { OeeBatchService } from './oee-batch/oee-batch.service';
import { TagRead } from './common/entities/tag-read';
import { OeeBatchHistory } from './common/entities/oee-batch-history';
import { ScheduleModule } from '@nestjs/schedule';
import { Alarm } from './common/entities/alarm';
import { AlarmModule } from './alarm/alarm.module';
import { Planning } from './common/entities/planning';
import { PlanningModule } from './planning/planning.module';
import configuration, { Config } from './configuration';
import { HistoryLog } from './common/entities/history-log';
import { HistoryLogModule } from './history-logs/history-log.module';
import { AnalyticModule } from './analytic/analytic.module';
import { Analytic } from './common/entities/analytic';
import { SocketModule } from './common/services/socket.module';
import { OeeStatsJob } from './common/jobs/oee-stats.job';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { OeeBatchStatsTimeline } from './common/entities/oee-batch-stats-timeline';
import { OeeBatchStats } from './common/entities/oee-batch-stats';
import { OeeBatchLog } from './common/entities/oee-batch-logs';
import { AnalyticStats } from './common/entities/analytic-stats';
import { TagReadJob } from './common/jobs/tag-read.job';
import { AnalyticJob } from './common/jobs/analytic.job';
import { UserRole } from './common/entities/user-role';
import { NotificationModule } from './common/services/notification.module';
import { BatchEventsListener } from './common/listeners/batch-events.listener';
import { BatchOeeCalculateListener } from './common/listeners/batch-oee-calculate.listener';
import { AnalyticService } from './analytic/analytic.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const config = configService.get<Config>('config');
        return {
          type: 'mysql',
          host: config.db.host,
          port: config.db.port,
          username: config.db.username,
          password: config.db.password,
          database: config.db.name,
          // entities: [__dirname + '/**/entities/*{.ts,.js}'],
          entities: [
            User,
            UserRole,
            Site,
            Role,
            PlannedDowntime,
            DeviceModel,
            DeviceModelTag,
            Device,
            DeviceTag,
            Product,
            Machine,
            MachineParameter,
            Oee,
            OeeMachine,
            OeeProduct,
            OeeBatch,
            OeeBatchA,
            OeeBatchP,
            OeeBatchQ,
            OeeBatchPlannedDowntime,
            OeeBatchHistory,
            OeeBatchStatsTimeline,
            OeeBatchStats,
            OeeBatchLog,
            Faq,
            FaqAttachment,
            Attachment,
            ProblemSolution,
            ProblemSolutionAttachment,
            ProblemSolutionTask,
            ProblemSolutionTaskAttachment,
            Widget,
            TagRead,
            Alarm,
            Planning,
            HistoryLog,
            Analytic,
            AnalyticStats,
          ],
          synchronize: true,
          // logging: 'all',
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      User,
      UserRole,
      Site,
      Role,
      PlannedDowntime,
      DeviceModel,
      DeviceModelTag,
      Device,
      DeviceTag,
      Product,
      Machine,
      MachineParameter,
      Oee,
      OeeMachine,
      OeeProduct,
      OeeBatch,
      OeeBatchA,
      OeeBatchP,
      OeeBatchQ,
      OeeBatchPlannedDowntime,
      OeeBatchHistory,
      OeeBatchStatsTimeline,
      OeeBatchStats,
      OeeBatchLog,
      Faq,
      FaqAttachment,
      Attachment,
      ProblemSolution,
      ProblemSolutionAttachment,
      ProblemSolutionTask,
      ProblemSolutionTaskAttachment,
      Widget,
      TagRead,
      Alarm,
      HistoryLog,
      Analytic,
      AnalyticStats,
    ]),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const config = configService.get<Config>('config');
        return {
          transport: {
            host: config.email.host,
            port: config.email.port,
            secure: config.email.useSSL,
            auth:
              config.email.username || config.email.password
                ? {
                    user: config.email.username,
                    pass: config.email.password,
                  }
                : undefined,
          },
          defaults: {
            from: config.email.defaultFrom,
          },
          template: {
            dir: './templates',
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
    ContentModule,
    OeeModule,
    OeeBatchModule,
    MachineModule,
    ProductModule,
    EventModule,
    ProblemSolutionModule,
    ProblemSolutionTaskModule,
    FaqModule,
    PlannedDowntimeModule,
    DeviceModelModule,
    DeviceModule,
    SiteModule,
    UserModule,
    CaslModule,
    AuthModule,
    RoleModule,
    AlarmModule,
    PlanningModule,
    HistoryLogModule,
    AnalyticModule,
    SocketModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [
    // TODO: remove this in production
    ProductService,
    MachineService,
    OeeService,
    ProblemSolutionService,
    FaqService,
    PlannedDowntimeService,
    DeviceModelService,
    DeviceService,
    SiteService,
    OeeBatchService,
    AnalyticService,
    OeeStatsJob,
    TagReadJob,
    AnalyticJob,
    BatchEventsListener,
    BatchOeeCalculateListener,
  ],
})
export class AppModule {}
