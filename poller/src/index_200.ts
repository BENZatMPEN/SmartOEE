import 'dotenv/config';
import * as https from 'https';
import * as fs from 'fs/promises';
import { scheduleJob } from 'node-schedule';
import ModbusRTU from 'modbus-serial';
import * as dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

const bootstrap = async () => {
  const sslRootCaPath = process.env.SSL_ROOT_CA_PATH;

  if (sslRootCaPath) {
    https.globalAgent.options.ca = await fs.readFile(sslRootCaPath);
  }
};

type DeviceConnection = {
  device: any;
  client: ModbusRTU;
};

type ReadItem = {
  tagId: number;
  read: string;
};

type TagResult = {
  siteId: number;
  connect: boolean;
  timestamp: Date;
  deviceId: number;
  reads: ReadItem[];
};

bootstrap()
  .then(async () => {
    console.log('App started');

    try {
      const devices = [
        {
          deviceId: 1,
          siteId: 1,
          ip: '192.168.0.210',
          port: 504,
        },
      ];
      const deviceConnections = [] as DeviceConnection[];

      for (const device of devices) {
        // const client = new ModbusRTU();
        // await client.connectTCP(device.ip, { port: device.port });
        // await client.setID(device.deviceId);

        deviceConnections.push({ device, client: null });
      }

      const readResult = (dataType: string, resultBuffer: Buffer): number => {
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

      const myTags = [
        // 0 - 100
        { address: 0, length: 2, dataType: 'float' },
        { address: 2, length: 2, dataType: 'float' },
        { address: 4, length: 2, dataType: 'float' },
        { address: 6, length: 2, dataType: 'float' },
        { address: 8, length: 2, dataType: 'float' },
        { address: 10, length: 2, dataType: 'float' },
        { address: 12, length: 2, dataType: 'float' },
        { address: 14, length: 2, dataType: 'float' },
        { address: 16, length: 2, dataType: 'float' },
        { address: 18, length: 2, dataType: 'float' },
        { address: 20, length: 2, dataType: 'float' },
        { address: 22, length: 2, dataType: 'float' },
        { address: 24, length: 2, dataType: 'float' },
        { address: 26, length: 2, dataType: 'float' },
        { address: 28, length: 2, dataType: 'float' },
        { address: 30, length: 2, dataType: 'float' },
        { address: 32, length: 2, dataType: 'float' },
        { address: 34, length: 2, dataType: 'float' },
        { address: 36, length: 2, dataType: 'float' },
        { address: 38, length: 2, dataType: 'float' },
        { address: 40, length: 2, dataType: 'float' },
        { address: 42, length: 2, dataType: 'float' },
        { address: 44, length: 2, dataType: 'float' },
        { address: 46, length: 2, dataType: 'float' },
        { address: 48, length: 2, dataType: 'float' },
        { address: 50, length: 2, dataType: 'float' },
        { address: 52, length: 2, dataType: 'float' },
        { address: 54, length: 2, dataType: 'float' },
        { address: 56, length: 2, dataType: 'float' },
        { address: 58, length: 2, dataType: 'float' },
        { address: 60, length: 2, dataType: 'float' },
        { address: 62, length: 2, dataType: 'float' },
        { address: 64, length: 2, dataType: 'float' },
        { address: 66, length: 2, dataType: 'float' },
        { address: 68, length: 2, dataType: 'float' },
        { address: 70, length: 2, dataType: 'float' },
        { address: 72, length: 2, dataType: 'float' },
        { address: 74, length: 2, dataType: 'float' },
        { address: 76, length: 2, dataType: 'float' },
        { address: 78, length: 2, dataType: 'float' },
        { address: 80, length: 2, dataType: 'float' },
        { address: 82, length: 2, dataType: 'float' },
        { address: 84, length: 2, dataType: 'float' },
        { address: 86, length: 2, dataType: 'float' },
        { address: 88, length: 2, dataType: 'float' },
        { address: 90, length: 2, dataType: 'float' },
        { address: 92, length: 2, dataType: 'float' },
        { address: 94, length: 2, dataType: 'float' },
        { address: 96, length: 2, dataType: 'float' },
        { address: 98, length: 2, dataType: 'float' },
        // 100 - 200
        { address: 100, length: 2, dataType: 'float' },
        { address: 102, length: 2, dataType: 'float' },
        { address: 104, length: 2, dataType: 'float' },
        { address: 106, length: 2, dataType: 'float' },
        { address: 108, length: 2, dataType: 'float' },
        { address: 110, length: 2, dataType: 'float' },
        { address: 112, length: 2, dataType: 'float' },
        { address: 114, length: 2, dataType: 'float' },
        { address: 116, length: 2, dataType: 'float' },
        { address: 118, length: 2, dataType: 'float' },
        { address: 120, length: 2, dataType: 'float' },
        { address: 122, length: 2, dataType: 'float' },
        { address: 124, length: 2, dataType: 'float' },
        { address: 126, length: 2, dataType: 'float' },
        { address: 128, length: 2, dataType: 'float' },
        { address: 130, length: 2, dataType: 'float' },
        { address: 132, length: 2, dataType: 'float' },
        { address: 134, length: 2, dataType: 'float' },
        { address: 136, length: 2, dataType: 'float' },
        { address: 138, length: 2, dataType: 'float' },
        { address: 140, length: 2, dataType: 'float' },
        { address: 142, length: 2, dataType: 'float' },
        { address: 144, length: 2, dataType: 'float' },
        { address: 146, length: 2, dataType: 'float' },
        { address: 148, length: 2, dataType: 'float' },
        { address: 150, length: 2, dataType: 'float' },
        { address: 152, length: 2, dataType: 'float' },
        { address: 154, length: 2, dataType: 'float' },
        { address: 156, length: 2, dataType: 'float' },
        { address: 158, length: 2, dataType: 'float' },
        { address: 160, length: 2, dataType: 'float' },
        { address: 162, length: 2, dataType: 'float' },
        { address: 164, length: 2, dataType: 'float' },
        { address: 166, length: 2, dataType: 'float' },
        { address: 168, length: 2, dataType: 'float' },
        { address: 170, length: 2, dataType: 'float' },
        { address: 172, length: 2, dataType: 'float' },
        { address: 174, length: 2, dataType: 'float' },
        { address: 176, length: 2, dataType: 'float' },
        { address: 178, length: 2, dataType: 'float' },
        { address: 180, length: 2, dataType: 'float' },
        { address: 182, length: 2, dataType: 'float' },
        { address: 184, length: 2, dataType: 'float' },
        { address: 186, length: 2, dataType: 'float' },
        { address: 188, length: 2, dataType: 'float' },
        { address: 190, length: 2, dataType: 'float' },
        { address: 192, length: 2, dataType: 'float' },
        { address: 194, length: 2, dataType: 'float' },
        { address: 196, length: 2, dataType: 'float' },
        { address: 198, length: 2, dataType: 'float' },
        // 200 - 300
        { address: 200, length: 2, dataType: 'float' },
        { address: 202, length: 2, dataType: 'float' },
        { address: 204, length: 2, dataType: 'float' },
        { address: 206, length: 2, dataType: 'float' },
        { address: 208, length: 2, dataType: 'float' },
        { address: 210, length: 2, dataType: 'float' },
        { address: 212, length: 2, dataType: 'float' },
        { address: 214, length: 2, dataType: 'float' },
        { address: 216, length: 2, dataType: 'float' },
        { address: 218, length: 2, dataType: 'float' },
        { address: 220, length: 2, dataType: 'float' },
        { address: 222, length: 2, dataType: 'float' },
        { address: 224, length: 2, dataType: 'float' },
        { address: 226, length: 2, dataType: 'float' },
        { address: 228, length: 2, dataType: 'float' },
        { address: 230, length: 2, dataType: 'float' },
        { address: 232, length: 2, dataType: 'float' },
        { address: 234, length: 2, dataType: 'float' },
        { address: 236, length: 2, dataType: 'float' },
        { address: 238, length: 2, dataType: 'float' },
        { address: 240, length: 2, dataType: 'float' },
        { address: 242, length: 2, dataType: 'float' },
        { address: 244, length: 2, dataType: 'float' },
        { address: 246, length: 2, dataType: 'float' },
        { address: 248, length: 2, dataType: 'float' },
        { address: 250, length: 2, dataType: 'float' },
        { address: 252, length: 2, dataType: 'float' },
        { address: 254, length: 2, dataType: 'float' },
        { address: 256, length: 2, dataType: 'float' },
        { address: 258, length: 2, dataType: 'float' },
        { address: 260, length: 2, dataType: 'float' },
        { address: 262, length: 2, dataType: 'float' },
        { address: 264, length: 2, dataType: 'float' },
        { address: 266, length: 2, dataType: 'float' },
        { address: 268, length: 2, dataType: 'float' },
        { address: 270, length: 2, dataType: 'float' },
        { address: 272, length: 2, dataType: 'float' },
        { address: 274, length: 2, dataType: 'float' },
        { address: 276, length: 2, dataType: 'float' },
        { address: 278, length: 2, dataType: 'float' },
        { address: 280, length: 2, dataType: 'float' },
        { address: 282, length: 2, dataType: 'float' },
        { address: 284, length: 2, dataType: 'float' },
        { address: 286, length: 2, dataType: 'float' },
        { address: 288, length: 2, dataType: 'float' },
        { address: 290, length: 2, dataType: 'float' },
        { address: 292, length: 2, dataType: 'float' },
        { address: 294, length: 2, dataType: 'float' },
        { address: 296, length: 2, dataType: 'float' },
        { address: 298, length: 2, dataType: 'float' },
        // 300 - 400
        { address: 300, length: 2, dataType: 'float' },
        { address: 302, length: 2, dataType: 'float' },
        { address: 304, length: 2, dataType: 'float' },
        { address: 306, length: 2, dataType: 'float' },
        { address: 308, length: 2, dataType: 'float' },
        { address: 310, length: 2, dataType: 'float' },
        { address: 312, length: 2, dataType: 'float' },
        { address: 314, length: 2, dataType: 'float' },
        { address: 316, length: 2, dataType: 'float' },
        { address: 318, length: 2, dataType: 'float' },
        { address: 320, length: 2, dataType: 'float' },
        { address: 322, length: 2, dataType: 'float' },
        { address: 324, length: 2, dataType: 'float' },
        { address: 326, length: 2, dataType: 'float' },
        { address: 328, length: 2, dataType: 'float' },
        { address: 330, length: 2, dataType: 'float' },
        { address: 332, length: 2, dataType: 'float' },
        { address: 334, length: 2, dataType: 'float' },
        { address: 336, length: 2, dataType: 'float' },
        { address: 338, length: 2, dataType: 'float' },
        { address: 340, length: 2, dataType: 'float' },
        { address: 342, length: 2, dataType: 'float' },
        { address: 344, length: 2, dataType: 'float' },
        { address: 346, length: 2, dataType: 'float' },
        { address: 348, length: 2, dataType: 'float' },
        { address: 350, length: 2, dataType: 'float' },
        { address: 352, length: 2, dataType: 'float' },
        { address: 354, length: 2, dataType: 'float' },
        { address: 356, length: 2, dataType: 'float' },
        { address: 358, length: 2, dataType: 'float' },
        { address: 360, length: 2, dataType: 'float' },
        { address: 362, length: 2, dataType: 'float' },
        { address: 364, length: 2, dataType: 'float' },
        { address: 366, length: 2, dataType: 'float' },
        { address: 368, length: 2, dataType: 'float' },
        { address: 370, length: 2, dataType: 'float' },
        { address: 372, length: 2, dataType: 'float' },
        { address: 374, length: 2, dataType: 'float' },
        { address: 376, length: 2, dataType: 'float' },
        { address: 378, length: 2, dataType: 'float' },
        { address: 380, length: 2, dataType: 'float' },
        { address: 382, length: 2, dataType: 'float' },
        { address: 384, length: 2, dataType: 'float' },
        { address: 386, length: 2, dataType: 'float' },
        { address: 388, length: 2, dataType: 'float' },
        { address: 390, length: 2, dataType: 'float' },
        { address: 392, length: 2, dataType: 'float' },
        { address: 394, length: 2, dataType: 'float' },
        { address: 396, length: 2, dataType: 'float' },
        { address: 398, length: 2, dataType: 'float' },
      ];

      const sendTags = async (id: string, deviceConnection: DeviceConnection) => {
        try {
          const { device } = deviceConnection;
          const client = new ModbusRTU();
          await client.connectTCP(device.ip, { port: device.port });
          await client.setID(device.deviceId);

          const now = dayjs().startOf('s');
          const tagResult: TagResult = {
            siteId: device.siteId,
            connect: true,
            deviceId: device.id,
            timestamp: now.toDate(),
            reads: [],
          };

          let hasError = false;

          for (const tag of myTags) {
            try {
              const result = await client.readHoldingRegisters(tag.address, tag.length);

              tagResult.reads.push({
                tagId: tag.address,
                read: String(readResult(tag.dataType, result.buffer)),
              });
            } catch {
              // TODO: use the last read
              tagResult.reads.push({
                tagId: tag.address,
                read: null,
              });
              tagResult.connect = false;
              hasError = true;
            }
          }

          console.log(JSON.stringify(tagResult));
          client.close(() => {
            console.log('close');
          });
        } catch (err) {
          console.log(err);
        }
      };

      scheduleJob('0/5 * * * * *', () => {
        deviceConnections.forEach(async (deviceConnection) => {
          const id = uuidv4();
          console.log(id, '-', 'start reading', dayjs().format('HH:mm:ss:SSS'));
          await sendTags(id, deviceConnection);
          console.log(id, '-', 'end reading', dayjs().format('HH:mm:ss:SSS'));
        });
      });
    } catch (error) {
      console.log(error);
    }
  })
  .catch((reason) => {
    console.log('App error', reason);
  });
