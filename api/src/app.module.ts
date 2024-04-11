import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserEntity } from './common/entities/user.entity';
import { RoleModule } from './role/role.module';
import { RoleEntity } from './common/entities/role.entity';
import { SiteModule } from './site/site.module';
import { SiteEntity } from './common/entities/site.entity';
import { SiteService } from './site/site.service';
import { PlannedDowntimeModule } from './planned-downtime/planned-downtime.module';
import { PlannedDowntimeEntity } from './common/entities/planned-downtime.entity';
import { PlannedDowntimeService } from './planned-downtime/planned-downtime.service';
import { DeviceModelModule } from './device-model/device-model.module';
import { DeviceModelService } from './device-model/device-model.service';
import { DeviceModelEntity } from './common/entities/device-model.entity';
import { DeviceModelTagEntity } from './common/entities/device-model-tag.entity';
import { DeviceModule } from './device/device.module';
import { DeviceEntity } from './common/entities/device.entity';
import { DeviceTagEntity } from './common/entities/device-tag.entity';
import { DeviceService } from './device/device.service';
import { ProductEntity } from './common/entities/product.entity';
import { ProductModule } from './product/product.module';
import { ProductService } from './product/product.service';
import { MachineService } from './machine/machine.service';
import { MachineModule } from './machine/machine.module';
import { MachineEntity } from './common/entities/machine.entity';
import { MachineParameterEntity } from './common/entities/machine-parameter.entity';
import { OeeModule } from './oee/oee.module';
import { OeeService } from './oee/oee.service';
import { OeeMachineEntity } from './common/entities/oee-machine.entity';
import { OeeProductEntity } from './common/entities/oee-product.entity';
import { OeeEntity } from './common/entities/oee.entity';
import { FaqEntity } from './common/entities/faq.entity';
import { FaqAttachmentEntity } from './common/entities/faq-attachment.entity';
import { AttachmentEntity } from './common/entities/attachment.entity';
import { FaqModule } from './faq/faq.module';
import { FaqService } from './faq/faq.service';
import { ProblemSolutionEntity } from './common/entities/problem-solution.entity';
import { ProblemSolutionAttachmentEntity } from './common/entities/problem-solution-attachment.entity';
import { ProblemSolutionTaskEntity } from './common/entities/problem-solution-task.entity';
import { ProblemSolutionTaskAttachmentEntity } from './common/entities/problem-solution-task-attachment.entity';
import { ProblemSolutionModule } from './problem-solution/problem-solution.module';
import { ProblemSolutionTaskModule } from './problem-solution-task/problem-solution-task.module';
import { ProblemSolutionService } from './problem-solution/problem-solution.service';
import { EventModule } from './event/event.module';
import { OeeBatchEntity } from './common/entities/oee-batch.entity';
import { OeeBatchModule } from './oee-batch/oee-batch.module';
import { OeeBatchAEntity } from './common/entities/oee-batch-a.entity';
import { OeeBatchPEntity } from './common/entities/oee-batch-p.entity';
import { OeeBatchQEntity } from './common/entities/oee-batch-q.entity';
import { OeeBatchPlannedDowntimeEntity } from './common/entities/oee-batch-planned-downtime.entity';
import { WidgetEntity } from './common/entities/widget.entity';
import { OeeBatchService } from './oee-batch/oee-batch.service';
import { TagReadEntity } from './common/entities/tag-read.entity';
import { OeeBatchEditHistoryEntity } from './common/entities/oee-batch-edit-history.entity';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';
import { AlarmEntity } from './common/entities/alarm.entity';
import { AlarmModule } from './alarm/alarm.module';
import { PlanningEntity } from './common/entities/planning.entity';
import { PlanningModule } from './planning/planning.module';
import configuration, { Config } from './configuration';
import { HistoryLogEntity } from './common/entities/history-log.entity';
import { HistoryLogModule } from './history-logs/history-log.module';
import { AnalyticModule } from './analytic/analytic.module';
import { AnalyticEntity } from './common/entities/analytic.entity';
import { SocketModule } from './common/services/socket.module';
import { OeeStatsJob } from './common/jobs/oee-stats.job';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { OeeBatchStatsTimelineEntity } from './common/entities/oee-batch-stats-timeline.entity';
import { OeeBatchStatsEntity } from './common/entities/oee-batch-stats.entity';
import { OeeBatchLogEntity } from './common/entities/oee-batch-logs.entity';
import { TagReadJob } from './common/jobs/tag-read.job';
import { NotificationModule } from './common/services/notification.module';
import { BatchEventsListener } from './common/listeners/batch-events.listener';
import { AnalyticService } from './analytic/analytic.service';
import { AnalyticEventsListener } from './common/listeners/analytic-events.listener';
import { AnalyticStatsParamEntity } from './common/entities/analytic-stats-param.entity';
import { DashboardModule } from './dashboard/dashboard.module';
import { DashboardEntity } from './common/entities/dashboard.entity';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { FileService } from './common/services/file.service';
import { AdminUserService } from './admin-user/admin-user.service';
import { AdminSiteService } from './admin-site/admin-site.service';
import { AdminSiteModule } from './admin-site/admin-site.module';
import { AdminUserModule } from './admin-user/admin-user.module';
import * as path from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { CronJob } from 'cron';
import { DataStoreJob } from './common/jobs/data-store.job';
import { BatchStatsJob } from './common/jobs/batch-stats.job';
import { OeeBatchJobEntity } from './common/entities/oee-batch-job.entity';
import { BatchAEventsListener } from './common/listeners/batch-a-events.listener';
import { BatchPEventsListener } from './common/listeners/batch-p-events.listener';
import { BatchQEventsListener } from './common/listeners/batch-q-events.listener';
import { OeeMachinePlannedDowntimeEntity } from './common/entities/oee-machine-planned-downtime.entity';
import { AutoPlannedDowntimeJob } from './common/jobs/auto-planned-downtime.job';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'client'),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = configService.get<Config>('config');
        return {
          type: 'mysql',
          host: config.db.host,
          port: config.db.port,
          username: config.db.username,
          password: config.db.password,
          database: config.db.name,
          entities: [
            UserEntity,
            SiteEntity,
            RoleEntity,
            PlannedDowntimeEntity,
            DeviceModelEntity,
            DeviceModelTagEntity,
            DeviceEntity,
            DeviceTagEntity,
            ProductEntity,
            MachineEntity,
            MachineParameterEntity,
            OeeEntity,
            OeeMachineEntity,
            OeeMachinePlannedDowntimeEntity,
            OeeProductEntity,
            OeeBatchEntity,
            OeeBatchAEntity,
            OeeBatchPEntity,
            OeeBatchQEntity,
            OeeBatchPlannedDowntimeEntity,
            OeeBatchEditHistoryEntity,
            OeeBatchStatsTimelineEntity,
            OeeBatchStatsEntity,
            OeeBatchLogEntity,
            OeeBatchJobEntity,
            FaqEntity,
            FaqAttachmentEntity,
            AttachmentEntity,
            ProblemSolutionEntity,
            ProblemSolutionAttachmentEntity,
            ProblemSolutionTaskEntity,
            ProblemSolutionTaskAttachmentEntity,
            WidgetEntity,
            TagReadEntity,
            AlarmEntity,
            PlanningEntity,
            HistoryLogEntity,
            AnalyticEntity,
            AnalyticStatsParamEntity,
            DashboardEntity,
          ],
          synchronize: true,
          // logging: 'all',
        };
      },
    }),
    TypeOrmModule.forFeature([
      UserEntity,
      SiteEntity,
      RoleEntity,
      PlannedDowntimeEntity,
      DeviceModelEntity,
      DeviceModelTagEntity,
      DeviceEntity,
      DeviceTagEntity,
      ProductEntity,
      MachineEntity,
      MachineParameterEntity,
      OeeMachinePlannedDowntimeEntity,
      OeeEntity,
      OeeMachineEntity,
      OeeProductEntity,
      OeeBatchEntity,
      OeeBatchAEntity,
      OeeBatchPEntity,
      OeeBatchQEntity,
      OeeBatchPlannedDowntimeEntity,
      OeeBatchEditHistoryEntity,
      OeeBatchStatsTimelineEntity,
      OeeBatchStatsEntity,
      OeeBatchLogEntity,
      OeeBatchJobEntity,
      FaqEntity,
      FaqAttachmentEntity,
      AttachmentEntity,
      ProblemSolutionEntity,
      ProblemSolutionAttachmentEntity,
      ProblemSolutionTaskEntity,
      ProblemSolutionTaskAttachmentEntity,
      WidgetEntity,
      TagReadEntity,
      AlarmEntity,
      HistoryLogEntity,
      AnalyticEntity,
      AnalyticStatsParamEntity,
      DashboardEntity,
      PlanningEntity,
    ]),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    MulterModule.register({
      storage: memoryStorage(),
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const config = configService.get<Config>('config');
        const emailAuth = config.email.hasAuth
          ? {
              auth: {
                user: config.email.username,
                pass: config.email.password,
              },
            }
          : undefined;
        return {
          transport: {
            host: config.email.host,
            port: config.email.port,
            secure: config.email.useSSL,
            ...emailAuth,
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
    AuthModule,
    RoleModule,
    AlarmModule,
    PlanningModule,
    HistoryLogModule,
    AnalyticModule,
    SocketModule,
    NotificationModule,
    DashboardModule,
    AdminSiteModule,
    AdminUserModule,
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
    AutoPlannedDowntimeJob,
    DataStoreJob,
    BatchStatsJob,
    BatchEventsListener,
    BatchAEventsListener,
    BatchPEventsListener,
    BatchQEventsListener,
    AnalyticEventsListener,
    FileService,
    AdminSiteService,
    AdminUserService,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly tagReadJob: TagReadJob,
    private readonly batchStatsJob: BatchStatsJob,
    private readonly dataStoreJob: DataStoreJob,
  ) {}

  onModuleInit() {
    const batchStatsJob = new CronJob(process.env.BATCH_STATS_JOB_INTERVAL, () => {
      (async () => {
        await this.batchStatsJob.handleCron();
      })();
    });
    this.schedulerRegistry.addCronJob('batchStatsJob', batchStatsJob);
    batchStatsJob.start();

    const dataStoreJob = new CronJob(process.env.DATA_STORE_JOB_INTERVAL, () => {
      (async () => {
        await this.dataStoreJob.handleCron();
      })();
    });
    this.schedulerRegistry.addCronJob('dataStoreJob', dataStoreJob);
    dataStoreJob.start();
  }
}
