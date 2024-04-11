import { faker } from '@faker-js/faker';
import { Controller, Get } from '@nestjs/common';
import { SiteEntity } from './common/entities/site.entity';
import { EntityManager } from 'typeorm';
import { UserService } from './user/user.service';
import { RoleService } from './role/role.service';
import {
  defaultAlertTemplate,
  defaultPercentSettings,
  defaultRoles,
  OEE_PARAM_TYPE_A,
  OEE_PARAM_TYPE_P,
  OEE_PARAM_TYPE_Q,
  OEE_TAG_MC_STATE,
  OEE_TAG_TOTAL,
  OEE_TAG_TOTAL_NG,
  OEE_TIME_UNIT_MINUTE,
  OEE_TIME_UNIT_SECOND,
  OEE_TYPE_CONTINUOUS,
  OEE_TYPE_STANDALONE,
  PLANNED_DOWNTIME_TIMING_AUTO,
  PLANNED_DOWNTIME_TIMING_MANUAL,
  PLANNED_DOWNTIME_TIMING_TIMER,
  PLANNED_DOWNTIME_TYPE_MC_SETUP,
  PLANNED_DOWNTIME_TYPE_PLANNED,
  TASK_STATUS_ON_APPROVED,
  TASK_STATUS_ON_COMPLETE,
  TASK_STATUS_ON_PROCESS,
  TASK_STATUS_ON_WAITING,
} from './common/constant';
import { PlannedDowntimeService } from './planned-downtime/planned-downtime.service';
import { DeviceModelTagDto } from './device-model/dto/device-model-tag.dto';
import { DeviceModelService } from './device-model/device-model.service';
import { DeviceEntity } from './common/entities/device.entity';
import { DeviceService } from './device/device.service';
import { DeviceTagDto } from './device/dto/device-tag.dto';
import { ProductService } from './product/product.service';
import { ProductEntity } from './common/entities/product.entity';
import { MachineService } from './machine/machine.service';
import { MachineParameterDto } from './machine/dto/machine-parameter.dto';
import { DeviceTagEntity } from './common/entities/device-tag.entity';
import { MachineEntity } from './common/entities/machine.entity';
import { OeeProductEntity } from './common/entities/oee-product.entity';
import { OeeMachineEntity } from './common/entities/oee-machine.entity';
import { OeeService } from './oee/oee.service';
import { FaqService } from './faq/faq.service';
import { ProblemSolutionService } from './problem-solution/problem-solution.service';
import { OeeEntity } from './common/entities/oee.entity';
import { OeeBatchService } from './oee-batch/oee-batch.service';
import * as dayjs from 'dayjs';
import { AnalyticService } from './analytic/analytic.service';
import { AdminUserService } from './admin-user/admin-user.service';
import { AdminSiteService } from './admin-site/admin-site.service';
import { OeeMachineDto } from './oee/dto/oee-machine.dto';

@Controller()
export class AppController {
  constructor(
    private readonly oeeService: OeeService,
    private readonly oeeBatchService: OeeBatchService,
    private readonly faqService: FaqService,
    private readonly deviceService: DeviceService,
    private readonly deviceModelService: DeviceModelService,
    private readonly plannedDowntimeService: PlannedDowntimeService,
    private readonly problemSolutionService: ProblemSolutionService,
    private readonly productService: ProductService,
    private readonly machineService: MachineService,
    private readonly adminSiteService: AdminSiteService,
    private readonly adminUserService: AdminUserService,
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly analyticService: AnalyticService,
    private readonly entityManager: EntityManager,
  ) { }

  // @Get('cal')
  // async testCal(): Promise<string> {
  //   await this.analyticService.recalculateAll();
  //   return 'done';
  // }

  @Get('hello')
  async getHello(): Promise<string> {
    await this.entityManager.query('SET FOREIGN_KEY_CHECKS = 0');

    await this.entityManager.query('delete from oees');
    await this.entityManager.query('truncate table oees');
    await this.entityManager.query('truncate table oeeBatchPlannedDowntimes');
    await this.entityManager.query('truncate table oeeBatchChanges');
    await this.entityManager.query('truncate table oeeBatchAs');
    await this.entityManager.query('truncate table oeeBatchPs');
    await this.entityManager.query('truncate table oeeBatchQs');
    await this.entityManager.query('truncate table oeeBatches');
    await this.entityManager.query('truncate table oeeProducts');
    await this.entityManager.query('truncate table oeeMachines');

    await this.entityManager.query('truncate table faqAttachments');
    await this.entityManager.query('truncate table faqs');

    await this.entityManager.query('truncate table problemSolutionTaskAttachments');
    await this.entityManager.query('truncate table problemSolutionTasks');
    await this.entityManager.query('truncate table problemSolutionAttachments');
    await this.entityManager.query('truncate table problemSolutions');

    await this.entityManager.query('truncate table deviceTags');
    await this.entityManager.query('truncate table devices');

    await this.entityManager.query('truncate table deviceModelTags');
    await this.entityManager.query('truncate table deviceModels');

    await this.entityManager.query('truncate table machineParameters');
    await this.entityManager.query('truncate table machines');

    await this.entityManager.query('truncate table products');

    await this.entityManager.query('truncate table plannedDowntimes');
    await this.entityManager.query('truncate table attachments');

    await this.entityManager.query('truncate table users');
    await this.entityManager.query('truncate table roles');
    await this.entityManager.query('truncate table sites');

    await this.entityManager.query('truncate table tagReads');

    await this.entityManager.query('SET FOREIGN_KEY_CHECKS = 1');

    const sites = [] as SiteEntity[];

    for (let i = 0; i < 5; i++) {
      const site = await this.adminSiteService.create(
        {
          name: faker.company.catchPhrase(),
          remark: faker.commerce.productDescription(),
          branch: '',
          address: '',
          lng: 0,
          lat: 0,
          active: false,
          sync: false,
          defaultPercentSettings: defaultPercentSettings,
          oeeLimit: -1,
          userLimit: -1,
          mcLimit: -1,
          cutoffTime: new Date(),
          alertTemplate: defaultAlertTemplate,
        },
        null,
      );

      sites.push(site);
    }

    await this.adminUserService.create(
      {
        email: 'superadmin@user.com',
        password: 'P@ssword1',
        firstName: 'Super',
        lastName: 'Admin',
        phoneNumber: '',
        lineId: '',
        isAdmin: true,
        siteIds: [],
      },
      null,
    );

    const pollerRole = await this.roleService.create(
      {
        name: 'Poller',
        remark: '',
        roles: defaultRoles,
      },
      sites[0].id,
    );

    await this.userService.create(
      {
        email: 'poller@user.com',
        password: 'P@ssword1',
        firstName: 'Poller',
        lastName: 'User',
        phoneNumber: '',
        lineId: '',
        siteIds: [sites[0].id],
        roleId: pollerRole.id,
      },
      null,
      sites[0].id,
    );

    const modelTypes = ['opcua', 'modbus'];
    const connectionTypes = ['tpc', 'serial'];
    const lengths = [16, 32];
    const dataTypes = ['int16', 'int16s', 'int16u', 'int32', 'int32s', 'int32u', 'float'];
    const devices = [] as DeviceEntity[];

    // real device
    const realDeviceModel = await this.deviceModelService.create(
      {
        name: 'PLC_1',
        remark: 'PLC Machine',
        connectionType: 'tpc',
        modelType: 'modbus',
        tags: [
          {
            id: 0,
            deviceModelId: 0,
            name: 'Machine State',
            address: '0',
            length: 1,
            dataType: 'int16u',
            readFunc: 3,
            writeState: false,
            writeFunc: 0,
            factor: 1,
            compensation: 0,
          },
          {
            id: 0,
            deviceModelId: 0,
            name: 'Total',
            address: '1',
            length: 2,
            dataType: 'int32u',
            readFunc: 3,
            writeState: false,
            writeFunc: 0,
            factor: 1,
            compensation: 0,
          },
          {
            id: 0,
            deviceModelId: 0,
            name: 'Total NG',
            address: '3',
            length: 2,
            dataType: 'int32u',
            readFunc: 3,
            writeState: false,
            writeFunc: 0,
            factor: 1,
            compensation: 0,
          },
          {
            id: 0,
            deviceModelId: 0,
            name: 'NG 1',
            address: '5',
            length: 2,
            dataType: 'int32u',
            readFunc: 3,
            writeState: false,
            writeFunc: 0,
            factor: 1,
            compensation: 0,
          },
          {
            id: 0,
            deviceModelId: 0,
            name: 'NG 2',
            address: '7',
            length: 2,
            dataType: 'int32u',
            readFunc: 3,
            writeState: false,
            writeFunc: 0,
            factor: 1,
            compensation: 0,
          },
          {
            id: 0,
            deviceModelId: 0,
            name: 'NG 3',
            address: '9',
            length: 2,
            dataType: 'int32u',
            readFunc: 3,
            writeState: false,
            writeFunc: 0,
            factor: 1,
            compensation: 0,
          },
          {
            id: 0,
            deviceModelId: 0,
            name: 'NG 4',
            address: '11',
            length: 2,
            dataType: 'int32u',
            readFunc: 3,
            writeState: false,
            writeFunc: 0,
            factor: 1,
            compensation: 0,
          },
          {
            id: 0,
            deviceModelId: 0,
            name: 'NG 5',
            address: '13',
            length: 2,
            dataType: 'int32u',
            readFunc: 3,
            writeState: false,
            writeFunc: 0,
            factor: 1,
            compensation: 0,
          },
          {
            id: 0,
            deviceModelId: 0,
            name: 'NG 6',
            address: '15',
            length: 2,
            dataType: 'int32u',
            readFunc: 3,
            writeState: false,
            writeFunc: 0,
            factor: 1,
            compensation: 0,
          },
          {
            id: 0,
            deviceModelId: 0,
            name: 'NG 7',
            address: '17',
            length: 2,
            dataType: 'int32u',
            readFunc: 3,
            writeState: false,
            writeFunc: 0,
            factor: 1,
            compensation: 0,
          },
          {
            id: 0,
            deviceModelId: 0,
            name: 'NG 8',
            address: '19',
            length: 2,
            dataType: 'int32u',
            readFunc: 3,
            writeState: false,
            writeFunc: 0,
            factor: 1,
            compensation: 0,
          },
          {
            id: 0,
            deviceModelId: 0,
            name: 'NG 9',
            address: '21',
            length: 2,
            dataType: 'int32u',
            readFunc: 3,
            writeState: false,
            writeFunc: 0,
            factor: 1,
            compensation: 0,
          },
          {
            id: 0,
            deviceModelId: 0,
            name: 'NG 10',
            address: '23',
            length: 2,
            dataType: 'int32u',
            readFunc: 3,
            writeState: false,
            writeFunc: 0,
            factor: 1,
            compensation: 0,
          },
        ],
      },
      sites[0].id,
    );

    const reloadRealDeviceModel = await this.deviceModelService.findById(realDeviceModel.id, realDeviceModel.siteId);
    const realDevice = await this.deviceService.create(
      {
        name: 'PLC_200',
        remark: 'PLC 192.168.0.200',
        address: '192.168.0.200',
        port: 503,
        deviceId: 1,
        deviceModelId: reloadRealDeviceModel.id,
        stopped: false,
        tags: reloadRealDeviceModel.tags.map((deviceModelTag) => {
          return {
            id: 0,
            name: deviceModelTag.name,
            deviceModelTagId: deviceModelTag.id,
            spLow: 0,
            spHigh: 0,
            record: true,
            updateInterval: '0/5 * * * * *',
          } as DeviceTagDto;
        }),
      },
      reloadRealDeviceModel.siteId,
    );

    const reloadRealDevice = await this.deviceService.findById(realDevice.id, realDevice.siteId);
    const realMc = await this.machineService.create(
      {
        name: 'Machine 1',
        code: 'MC001',
        location: 'Bangkok',
        remark: faker.commerce.productDescription(),
        parameters: [
          // a
          ...reloadRealDevice.tags
            .filter((deviceTag) => deviceTag.name.startsWith('Breakdown'))
            .map((deviceTag, idx) => {
              return {
                name: `A สาเหตุ ${idx + 1} (A)`,
                oeeType: OEE_PARAM_TYPE_A,
                deviceId: deviceTag.deviceId,
                tagId: deviceTag.id,
              };
            }),
          ...[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((val) => {
            return {
              name: `A สาเหตุ ${val} (M)`,
              oeeType: OEE_PARAM_TYPE_A,
            };
          }),
          // p
          ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((val) => {
            return {
              name: `P สาเหตุ ${val} (M)`,
              oeeType: OEE_PARAM_TYPE_P,
            };
          }),
          // q
          ...reloadRealDevice.tags
            .filter((deviceTag) => deviceTag.name.startsWith('NG'))
            .map((deviceTag, idx) => {
              return {
                name: `Q สาเหตุ ${idx + 1} (A)`,
                oeeType: OEE_PARAM_TYPE_Q,
                deviceId: deviceTag.deviceId,
                tagId: deviceTag.id,
              };
            }),
          ...[11, 12].map((val) => {
            return {
              name: `Q สาเหตุ ${val} (M)`,
              oeeType: OEE_PARAM_TYPE_Q,
            };
          }),
        ] as MachineParameterDto[],
      },
      null,
      sites[0].id,
    );

    const realPd1 = await this.productService.create(
      {
        sku: 'SKU001',
        name: 'Product 1',
        remark: faker.commerce.productDescription(),
        activePcs: false,
        pscGram: 0,
      },
      null,
      sites[0].id,
    );

    const realPd2 = await this.productService.create(
      {
        sku: 'SKU002',
        name: 'Product 2',
        remark: faker.commerce.productDescription(),
        activePcs: false,
        pscGram: 0,
      },
      null,
      sites[0].id,
    );

    const realPd3 = await this.productService.create(
      {
        sku: 'SKU003',
        name: 'Product 3',
        remark: faker.commerce.productDescription(),
        activePcs: false,
        pscGram: 0,
      },
      null,
      sites[0].id,
    );

    await this.oeeService.create(
      {
        oeeCode: 'OEE001',
        oeeType: OEE_TYPE_STANDALONE,
        minorStopSeconds: 10,
        breakdownSeconds: 15,
        location: faker.address.city(),
        productionName: faker.commerce.productName(),
        remark: faker.commerce.productDescription(),
        percentSettings: null,
        useSitePercentSettings: true,
        tags: [
          {
            deviceId: 1,
            tagId: 1,
            key: OEE_TAG_MC_STATE,
            data: {
              running: '2',
              standby: '1',
              off: '0',
            },
          },
          {
            deviceId: 1,
            tagId: 2,
            key: OEE_TAG_TOTAL,
            data: null,
          },
          {
            deviceId: 1,
            tagId: 3,
            key: OEE_TAG_TOTAL_NG,
            data: null,
          },
        ],
        timeUnit: OEE_TIME_UNIT_SECOND,
        oeeProducts: [
          {
            productId: realPd1.id,
            standardSpeedSeconds: 3,
          } as OeeProductEntity,
          {
            productId: realPd2.id,
            standardSpeedSeconds: 3,
          } as OeeProductEntity,
          {
            productId: realPd3.id,
            standardSpeedSeconds: 3,
          } as OeeProductEntity,
        ],
        oeeMachines: [
          {
            machineId: realMc.id,
          } as OeeMachineDto,
        ],
        operators: []
      },
      null,
      sites[0].id,
    );

    await this.plannedDowntimeService.create(
      {
        name: 'ประชุม (auto)',
        type: PLANNED_DOWNTIME_TYPE_PLANNED,
        timing: PLANNED_DOWNTIME_TIMING_AUTO,
        seconds: 0,
      },
      sites[0].id,
    );

    await this.plannedDowntimeService.create(
      {
        name: 'พักเที่ยง (manual)',
        type: PLANNED_DOWNTIME_TYPE_PLANNED,
        timing: PLANNED_DOWNTIME_TIMING_MANUAL,
        seconds: 0,
      },
      sites[0].id,
    );

    await this.plannedDowntimeService.create(
      {
        name: 'เปลี่ยน Mold (mc_setup & timer 30 นาที)',
        type: PLANNED_DOWNTIME_TYPE_MC_SETUP,
        timing: PLANNED_DOWNTIME_TIMING_TIMER,
        seconds: 60 * 30,
      },
      sites[0].id,
    );

    await this.plannedDowntimeService.create(
      {
        name: 'อัพเดทงาน (timer 15 นาที)',
        type: PLANNED_DOWNTIME_TYPE_PLANNED,
        timing: PLANNED_DOWNTIME_TIMING_TIMER,
        seconds: 60 * 15,
      },
      sites[0].id,
    );

    //-----------------------------------------------------

    for (let i = 0; i < 20; i++) {
      const deviceModel = await this.deviceModelService.create(
        {
          name: faker.company.catchPhrase(),
          remark: faker.commerce.productDescription(),
          connectionType: connectionTypes[faker.datatype.number({ min: 0, max: 1 })],
          modelType: modelTypes[faker.datatype.number({ min: 0, max: 1 })],
          tags: [...Array(5)].map(() => {
            return {
              name: faker.commerce.productMaterial(),
              address: `${faker.datatype.number({ min: 0, max: 20 })}`,
              length: lengths[faker.datatype.number({ min: 0, max: 1 })],
              dataType: dataTypes[faker.datatype.number({ min: 0, max: 6 })],
              readFunc: faker.datatype.number({ min: 3, max: 16 }),
              writeState: false,
              writeFunc: 0,
              factor: 0,
              compensation: 0,
            } as DeviceModelTagDto;
          }),
        },
        sites[1].id,
      );

      const reloadDeviceModel = await this.deviceModelService.findById(deviceModel.id, deviceModel.siteId);
      const device = await this.deviceService.create(
        {
          name: reloadDeviceModel.name,
          remark: reloadDeviceModel.remark,
          address: '',
          port: 0,
          deviceId: 0,
          deviceModelId: reloadDeviceModel.id,
          stopped: false,
          tags: reloadDeviceModel.tags.map((deviceModelTag) => {
            return {
              name: deviceModelTag.name,
              deviceModelTagId: deviceModelTag.id,
              spLow: 0,
              spHigh: 0,
              record: true,
              updateInterval: '0/5 * * * * *',
            } as DeviceTagDto;
          }),
        },
        reloadDeviceModel.siteId,
      );

      devices.push(await this.deviceService.findById(device.id, device.siteId));
    }

    const products = [] as ProductEntity[];

    for (let i = 0; i < 20; i++) {
      const product = await this.productService.create(
        {
          sku: 'S' + faker.datatype.number({ min: 100000, max: 999999 }),
          name: faker.commerce.productName(),
          remark: faker.commerce.productDescription(),
          activePcs: false,
          pscGram: 0,
        },
        null,
        sites[1].id,
      );

      products.push(product);
    }

    const oeeParamTypes = [OEE_PARAM_TYPE_A, OEE_PARAM_TYPE_P];
    const deviceTags = devices.reduce((previousValue, current) => {
      return [...previousValue, ...current.tags];
    }, [] as DeviceTagEntity[]);
    const machines = [] as MachineEntity[];

    for (let i = 0; i < 10; i++) {
      const machine = await this.machineService.create(
        {
          name: faker.company.catchPhrase(),
          code: 'MC' + faker.datatype.number({ min: 10000, max: 99999 }),
          location: faker.address.city(),
          remark: faker.commerce.productDescription(),
          parameters: [
            ...[...Array(10)].map((item, idx) => {
              const deviceTag = deviceTags[10 * i + idx];
              return {
                name: faker.commerce.productName(),
                oeeType: oeeParamTypes[faker.datatype.number({ min: 0, max: 1 })],
                deviceId: deviceTag.deviceId,
                tagId: deviceTag.id,
              } as MachineParameterDto;
            }),
            ...[...Array(24)].map((item, idx) => {
              return {
                name: faker.commerce.productName(),
                oeeType: OEE_PARAM_TYPE_Q,
                deviceId: null,
                tagId: null,
              } as MachineParameterDto;
            }),
          ],
        },
        null,
        sites[1].id,
      );

      machines.push(machine);
    }

    const oeeTypes = [OEE_TYPE_STANDALONE, OEE_TYPE_CONTINUOUS];
    const timeUnits = [OEE_TIME_UNIT_SECOND, OEE_TIME_UNIT_MINUTE];
    const oees: OeeEntity[] = [];

    for (let i = 0; i < 5; i++) {
      const timeUnit = timeUnits[faker.datatype.number({ min: 0, max: 1 })];
      oees.push(
        await this.oeeService.create(
          {
            oeeCode: 'OEE' + faker.datatype.number({ min: 100, max: 999 }),
            oeeType: oeeTypes[faker.datatype.number({ min: 0, max: 1 })],
            minorStopSeconds: timeUnit == OEE_TIME_UNIT_MINUTE
              ? faker.datatype.number({ min: 60, max: 720, precision: 60 })
              : faker.datatype.number({ min: 1, max: 200 }),
            breakdownSeconds: timeUnit == OEE_TIME_UNIT_MINUTE
              ? faker.datatype.number({ min: 60, max: 720, precision: 60 })
              : faker.datatype.number({ min: 1, max: 200 }),
            location: faker.address.city(),
            productionName: faker.commerce.productName(),
            remark: faker.commerce.productDescription(),
            percentSettings: null,
            useSitePercentSettings: true,
            timeUnit: timeUnit,
            tags: null,
            oeeProducts: [...Array(3)].map((item, idx) => {
              const product = products[3 * i + idx];
              return {
                standardSpeedSeconds: faker.datatype.number({ min: 200, max: 1000 }),
                productId: product.id,
              } as OeeProductEntity;
            }),
            oeeMachines: [
              {
                machineId: machines[i].id,
              } as OeeMachineDto,
            ],
            operators: []
          },
          null,
          sites[1].id,
        ),
      );
    }

    const oeeBatch = await this.oeeBatchService.create(
      2,
      {
        oeeId: 2,
        productId: 4,
        lotNumber: 'Test Lot',
        plannedQuantity: 5000,
        startDate: new Date(),
        endDate: new Date(),
      },
      'admin@user.com',
    );

    await this.oeeBatchService.startBatch(oeeBatch.id);
    for (let i = 0; i < 24; i++) {
      await this.oeeBatchService.createBatchA({
        oeeBatchId: oeeBatch.id,
        seconds: oees[0].breakdownSeconds + faker.datatype.number({ min: 10, max: 20 }),
        machineId: null,
        tagId: null,
        machineParameterId: null,
        timestamp: dayjs()
          .add(i + 15, 'm')
          .toDate(),
      });
    }

    for (let i = 0; i < 24; i++) {
      await this.oeeBatchService.createBatchP({
        isSpeedLoss: false,
        oeeBatchId: oeeBatch.id,
        seconds: oees[0].minorStopSeconds + faker.datatype.number({ min: 10, max: 20 }),
        machineId: null,
        tagId: null,
        machineParameterId: null,
        timestamp: dayjs()
          .add(i + 15, 'm')
          .toDate(),
      });
    }

    const projectStatus = [
      TASK_STATUS_ON_PROCESS,
      TASK_STATUS_ON_WAITING,
      TASK_STATUS_ON_APPROVED,
      TASK_STATUS_ON_COMPLETE,
    ];

    for (let i = 0; i < 10; i++) {
      await this.problemSolutionService.create(
        {
          name: faker.company.catchPhrase(),
          remark: faker.commerce.productDescription(),
          date: new Date(),
          headProjectUserId: null,
          approvedByUserId: null,
          oeeId: null,
          startDate: new Date(),
          endDate: new Date(),
          status: projectStatus[faker.datatype.number({ min: 0, max: projectStatus.length - 1 })],
        },
        sites[1].id,
        null,
        null,
        null,
        null,
      );
    }

    for (let i = 0; i < 10; i++) {
      await this.faqService.create(
        {
          topic: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          remark: faker.commerce.productDescription(),
          createdByUserId: null,
          approvedByUserId: null,
          date: new Date(),
          startDate: new Date(),
          endDate: new Date(),
          status: projectStatus[faker.datatype.number({ min: 0, max: projectStatus.length - 1 })],
        },
        sites[1].id,
        null,
        null,
      );
    }

    const downtimeTypes = [PLANNED_DOWNTIME_TYPE_PLANNED, PLANNED_DOWNTIME_TYPE_MC_SETUP];
    const downtimeTimings = [
      PLANNED_DOWNTIME_TIMING_AUTO,
      PLANNED_DOWNTIME_TIMING_MANUAL,
      PLANNED_DOWNTIME_TIMING_TIMER,
    ];

    for (let i = 0; i < 15; i++) {
      const timing = downtimeTimings[faker.datatype.number({ min: 0, max: downtimeTimings.length - 1 })];
      await this.plannedDowntimeService.create(
        {
          name: faker.commerce.productName(),
          type: downtimeTypes[faker.datatype.number({ min: 0, max: downtimeTypes.length - 1 })],
          timing: timing,
          seconds: timing === PLANNED_DOWNTIME_TIMING_TIMER ? faker.datatype.number({ min: 60, max: 300 }) * 60 : 0,
        },
        sites[1].id,
      );
    }

    return 'Hello, World!';
  }
}
