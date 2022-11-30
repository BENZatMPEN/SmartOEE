import 'dotenv/config';
import * as fs from 'fs';
import axios from './utils/axios';
import { BASE_API_URL, READ_INTERVAL, SITE_ID, SYNC_INTERVAL } from './config';
import { Site } from './@types/site';
import { scheduleJob } from 'node-schedule';
import ModbusRTU from 'modbus-serial';
import { Device } from './@types/device';
import { io, ManagerOptions, SocketOptions } from 'socket.io-client';
import * as dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

// TODO: consider using Awilix for DI https://github.com/jeffijoe/awilix

const bootstrap = async () => {
  // const sslRootCaPath = process.env.SSL_ROOT_CA_PATH;
  // if (sslRootCaPath) {
  //   https.globalAgent.options.ca = await fs.readFile(sslRootCaPath);
  // }
};

// TODO: Graceful Shutdown
// process.on('SIGINT', function () {
//   schedule.gracefulShutdown()
//     .then(() => process.exit(0))
// }

type DeviceConnection = {
  device: Device;
  client: ModbusRTU;
};

type ReadItem = {
  tagId: number;
  read: string;
};

type TagResult = {
  siteId: number;
  timestamp: Date;
  deviceId: number;
  reads: ReadItem[];
};

type Token = {
  accessToken: string;
  user: AuthUser;
};

type AuthUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
};

bootstrap()
  .then(async () => {
    console.log('App started');

    const authResp = await axios.post<Token>('auth/login', {
      email: 'user1@user.com',
      password: 'P@ssword1',
    });

    const { data: token } = authResp;
    axios.defaults.headers.common.Authorization = `Bearer ${token.accessToken}`;

    const handleOpen = () => {
      console.log('websocket open');
    };

    const handleClose = () => {
      console.log('websocket close');
    };

    const socketOptions: Partial<SocketOptions & ManagerOptions> = {
      rejectUnauthorized: false,
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: token.accessToken,
          },
        },
      },
    };

    const socket = io(BASE_API_URL, socketOptions);
    socket.on('disconnect', handleClose);
    socket.on('connect', handleOpen);

    socket.io.on('reconnect_attempt', () => {
      console.log('reconnect_attempt');
    });

    socket.io.on('reconnect', () => {
      console.log('reconnect');
    });

    const readModbusBuffer = (dataType: string, resultBuffer: Buffer): number => {
      switch (dataType) {
        case 'int16':
        case 'int16s':
          return resultBuffer.readInt16BE();
        case 'int16u':
          return resultBuffer.readUInt16BE();
        case 'int32':
        case 'int32s':
          return resultBuffer.readInt32BE();
        case 'int32u':
          return resultBuffer.readUInt32BE();
        case 'float':
          return resultBuffer.readFloatBE();
        default:
          return 0;
      }
    };

    const handleModbus = async (device) => {
      const { id, siteId, deviceId, address, port } = device;
      const jobId = uuidv4();

      console.log(jobId, '-', 'start reading', dayjs().format('HH:mm:ss:SSS'));

      const tagResult: TagResult = {
        siteId: siteId,
        deviceId: id,
        timestamp: dayjs().startOf('s').toDate(),
        reads: [],
      };

      try {
        const client = new ModbusRTU();
        await client.connectTCP(address, { port });
        await client.setID(deviceId);

        for (const tag of device.tags) {
          try {
            const result = await client.readHoldingRegisters(tag.deviceModelTag.address, tag.deviceModelTag.length);

            tagResult.reads.push({
              tagId: tag.id,
              read: String(readModbusBuffer(tag.deviceModelTag.dataType, result.buffer)),
            });
          } catch (readErr) {
            console.log('read error', readErr);
          }
        }

        client.close(() => {
          console.log(jobId, '- close', device.address, device.port);
        });
      } catch (modbusErr) {
        console.log('modbus error', modbusErr);
      }

      try {
        socket.emit('tagReads', tagResult);
        console.log(tagResult);
      } catch (socketErr) {
        console.log('sending error', socketErr);
      }

      console.log(jobId, '-', 'end reading', dayjs().format('HH:mm:ss:SSS'));
    };

    scheduleJob(READ_INTERVAL, () => {
      console.log('reading...');

      try {
        // TODO: support multiple sites???
        fs.readFile('./site-infos.json', { encoding: 'utf-8' }, (fileErr, siteJson) => {
          if (fileErr) {
            console.error(fileErr);
            return;
          }

          const site = JSON.parse(siteJson) as Site;
          const { devices } = site;

          devices.forEach(async (device) => {
            const { address, port, stopped, deviceModel } = device;
            if (stopped) {
              console.log(address, port, 'has been stopped.');
              return;
            }

            if (deviceModel.modelType === 'modbus') {
              await handleModbus(device);
            } else if (deviceModel.modelType === 'opcua') {
              console.log('OPC UA had been implemented yet.');
              // TODO: implement here
            }
          });
        });
      } catch (readErr) {
        console.log(readErr);
      }
    });

    scheduleJob(SYNC_INTERVAL, async () => {
      console.log('syncing...');

      try {
        const siteResp = await axios.get<Site>(`sites/${SITE_ID}`);
        const { data: site } = siteResp;

        if (!site.sync) {
          console.log('nothing to sync.');
          return;
        }

        console.log('started syncing.');
        const devicesResp = await axios.get<Device[]>(`sites/${SITE_ID}/devices`);
        const { data: devices } = devicesResp;
        const siteJson = JSON.stringify(devices);
        fs.writeFile('./site-infos.json', siteJson, (fileErr) => {
          if (fileErr) {
            console.log(fileErr);
          }
        });
        await axios.put(`sites/${SITE_ID}/synced`);
        console.log('ended syncing.');
      } catch (requestErr) {
        console.log(requestErr);
      }
    });
  })
  .catch((reason) => {
    console.log('App error', reason);
  });
