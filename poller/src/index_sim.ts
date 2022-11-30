import 'dotenv/config';
import * as https from 'https';
import * as fs from 'fs/promises';
import axios from './utils/axios';
import { SITE_ID } from './config';
import { Site } from './@types/site';
import ModbusRTU from 'modbus-serial';
import { Device } from './@types/device';
import * as dayjs from 'dayjs';
import * as WebSocket from 'ws';
// import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
// dayjs.extend(isSameOrBefore);

const bootstrap = async () => {
  const sslRootCaPath = process.env.SSL_ROOT_CA_PATH;

  if (sslRootCaPath) {
    https.globalAgent.options.ca = await fs.readFile(sslRootCaPath);
  }
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
  connect: boolean;
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

type OeeA = {
  seconds: number;
  startAt: dayjs.Dayjs;
};

type OeeP = {
  seconds: number;
  startAt: dayjs.Dayjs;
};

type OeeQ = {
  key: number;
  startAt: dayjs.Dayjs;
};

type Batch = {
  startTime: dayjs.Dayjs;
  endTime: dayjs.Dayjs;
  secPerPiece: number;
  oeeAs: OeeA[];
  oeePs: OeeP[];
  oeeQs: OeeQ[];
};

const snooze = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

bootstrap()
  .then(async () => {
    console.log('App started');

    try {
      const authResponse = await axios.post<Token>('auth/login', {
        email: 'user1@user.com',
        password: 'P@ssword1',
      });
      const token = authResponse.data;
      axios.defaults.headers.common.Authorization = `Bearer ${token.accessToken}`;

      const response = await axios.get<Site>(`sites/${SITE_ID}`);
      const site = response.data;

      if (site.sync) {
        console.log('sync');
        const response = await axios.get(`sites/${SITE_ID}/devices`);
        const siteJson = JSON.stringify(response.data);
        await fs.writeFile('./site-infos.json', siteJson);
        await axios.put(`sites/${SITE_ID}/synced`);
      }
    } catch (error) {
      throw new Error('cannot authenticate');
    }

    let wsConnect = false;
    let ws: WebSocket;

    const handleOpen = () => {
      console.log('websocket open');
      wsConnect = true;
    };

    const handleClose = () => {
      console.log('websocket close');
      wsConnect = false;

      setTimeout(() => {
        connect();
      }, 2000);
    };

    const connect = () => {
      ws = new WebSocket('wss://localhost:3020');
      ws.on('close', handleClose);
      ws.on('open', handleOpen);
      ws.on('error', (error) => {
        console.log('websocket error', error);
        ws.close();
      });
    };

    connect();

    try {
      const siteJson = await fs.readFile('./site-infos.json', { encoding: 'utf8' });
      const site = JSON.parse(siteJson) as Site;

      const deviceConnections: DeviceConnection[] = [];

      for (const device of site.devices) {
        deviceConnections.push({ device, client: null });
      }

      const batch: Batch = {
        secPerPiece: 3,
        startTime: dayjs('2022-07-31T13:00:00.000Z'),
        endTime: dayjs('2022-07-31T15:00:00.000Z'),
        oeeAs: [
          {
            seconds: 17,
            startAt: dayjs('2022-07-31T13:30:00.000Z'),
          },
          {
            seconds: 20,
            startAt: dayjs('2022-07-31T13:52:00.000Z'),
          },
          {
            seconds: 16,
            startAt: dayjs('2022-07-31T14:17:00.000Z'),
          },
          {
            seconds: 19,
            startAt: dayjs('2022-07-31T14:27:00.000Z'),
          },
        ],
        oeePs: [
          {
            seconds: 11,
            startAt: dayjs('2022-07-31T13:05:00.000Z'),
          },
          {
            seconds: 8,
            startAt: dayjs('2022-07-31T13:32:00.000Z'),
          },
          {
            seconds: 5,
            startAt: dayjs('2022-07-31T13:39:00.000Z'),
          },
          {
            seconds: 9,
            startAt: dayjs('2022-07-31T13:45:00.000Z'),
          },
          {
            seconds: 13,
            startAt: dayjs('2022-07-31T14:02:00.000Z'),
          },
          {
            seconds: 11,
            startAt: dayjs('2022-07-31T14:09:00.000Z'),
          },
          {
            seconds: 6,
            startAt: dayjs('2022-07-31T14:29:00.000Z'),
          },
          {
            seconds: 12,
            startAt: dayjs('2022-07-31T14:44:00.000Z'),
          },
        ],
        oeeQs: [
          {
            key: 6,
            startAt: dayjs('2022-07-31T13:02:00.000Z'),
          },
          {
            key: 6,
            startAt: dayjs('2022-07-31T13:34:00.000Z'),
          },
          {
            key: 8,
            startAt: dayjs('2022-07-31T14:11:00.000Z'),
          },
          {
            key: 12,
            startAt: dayjs('2022-07-31T14:15:00.000Z'),
          },
          {
            key: 13,
            startAt: dayjs('2022-07-31T14:56:00.000Z'),
          },
        ],
      };

      const seconds = batch.endTime.diff(batch.startTime, 'second');
      let total = 0;
      let totalNg = 0;
      let ng1 = 0;
      let ng2 = 0;
      let ng3 = 0;
      let ng4 = 0;
      let ng5 = 0;
      let ng6 = 0;
      let ng7 = 0;
      let ng8 = 0;
      let ng9 = 0;
      let ng10 = 0;
      let count = 1;
      let stop = false;

      for (let i = 1; i <= seconds; i++) {
        for (const item of deviceConnections) {
          const now = batch.startTime.add(i, 'second');
          const tagResult: TagResult = {
            siteId: item.device.siteId,
            connect: true,
            deviceId: item.device.id,
            timestamp: now.toDate(),
            reads: [],
          };

          const stopIdx = [...batch.oeeAs, ...batch.oeePs].findIndex(
            (item) =>
              now.toDate() >= item.startAt.toDate() && now.toDate() < item.startAt.add(item.seconds, 'second').toDate(),
          );

          stop = stopIdx > -1;

          const ngIdx = batch.oeeQs.findIndex((item) => now.isSame(item.startAt, 'second'));

          for (const tag of item.device.tags) {
            switch (tag.id) {
              case 1: // Machine State
                tagResult.reads.push({
                  tagId: 1,
                  read: '2',
                });
                break;

              case 2: // Total
                if (!stop) {
                  if (count === batch.secPerPiece) {
                    total++;
                    count = 1;
                  } else {
                    count++;
                  }
                }

                tagResult.reads.push({
                  tagId: 2,
                  read: total.toString(),
                });
                break;

              case 3: // Total NG
                totalNg = ngIdx > -1 ? totalNg + 1 : totalNg;
                tagResult.reads.push({
                  tagId: 3,
                  read: totalNg.toString(),
                });
                break;

              case 4: // NG 1
                ng1 = ngIdx > -1 && batch.oeeQs[ngIdx].key === 4 ? ng1 + 1 : ng1;
                tagResult.reads.push({
                  tagId: 4,
                  read: ng1.toString(),
                });
                break;

              case 5: // NG 2
                ng2 = ngIdx > -1 && batch.oeeQs[ngIdx].key === 5 ? ng2 + 1 : ng2;
                tagResult.reads.push({
                  tagId: 5,
                  read: ng2.toString(),
                });
                break;

              case 6: // NG 3
                ng3 = ngIdx > -1 && batch.oeeQs[ngIdx].key === 6 ? ng3 + 1 : ng3;
                tagResult.reads.push({
                  tagId: 6,
                  read: ng3.toString(),
                });
                break;

              case 7: // NG 4
                ng4 = ngIdx > -1 && batch.oeeQs[ngIdx].key === 7 ? ng4 + 1 : ng4;
                tagResult.reads.push({
                  tagId: 7,
                  read: ng4.toString(),
                });
                break;

              case 8: // NG 5
                ng5 = ngIdx > -1 && batch.oeeQs[ngIdx].key === 8 ? ng5 + 1 : ng5;
                tagResult.reads.push({
                  tagId: 8,
                  read: ng5.toString(),
                });
                break;

              case 9: // NG 6
                ng6 = ngIdx > -1 && batch.oeeQs[ngIdx].key === 9 ? ng6 + 1 : ng6;
                tagResult.reads.push({
                  tagId: 9,
                  read: ng6.toString(),
                });
                break;

              case 10: // NG 7
                ng7 = ngIdx > -1 && batch.oeeQs[ngIdx].key === 10 ? ng7 + 1 : ng7;
                tagResult.reads.push({
                  tagId: 10,
                  read: ng7.toString(),
                });
                break;

              case 11: // NG 8
                ng8 = ngIdx > -1 && batch.oeeQs[ngIdx].key === 11 ? ng8 + 1 : ng8;
                tagResult.reads.push({
                  tagId: 11,
                  read: ng8.toString(),
                });
                break;

              case 12: // NG 9
                ng9 = ngIdx > -1 && batch.oeeQs[ngIdx].key === 12 ? ng9 + 1 : ng9;
                tagResult.reads.push({
                  tagId: 12,
                  read: ng9.toString(),
                });
                break;

              case 13: // NG 10
                ng10 = ngIdx > -1 && batch.oeeQs[ngIdx].key === 13 ? ng10 + 1 : ng10;
                tagResult.reads.push({
                  tagId: 13,
                  read: ng10.toString(),
                });
                break;
            }
          }

          if (wsConnect) {
            ws.send(
              JSON.stringify({
                event: 'tagReads',
                data: tagResult,
              }),
            );
          }

          console.log(tagResult);
          await snooze(10);
        }
      }

      // await fs.writeFile('./2022-01-01-reads.json', JSON.stringify(dayResults, null, 2));

      // console.log(results);
    } catch (error) {
      console.log(error);
    }
  })
  .catch((reason) => {
    console.log('App error', reason);
  });
