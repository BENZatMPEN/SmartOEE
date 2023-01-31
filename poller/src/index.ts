import 'dotenv/config';
import * as fs from 'fs';
import axios from './utils/axios';
import { API_PASS, API_USER, BASE_WS_URL, READ_INTERVAL, SITE_ID, SYNC_INTERVAL } from './config';
import { Site } from './@types/site';
import { scheduleJob } from 'node-schedule';
import ModbusRTU from 'modbus-serial';
import { Device } from './@types/device';
import { io, ManagerOptions, Socket, SocketOptions } from 'socket.io-client';
import * as dayjs from 'dayjs';
import * as crypto from 'crypto';
import { DeviceModelTag } from './@types/deviceModel';

const bootstrap = async () => {
  // Prepare anything before the app running here
};

type ReadItem = {
  tagId: number;
  read: string;
};

type WriteItem = {
  deviceId: number;
  tagId: number;
  value: string;
};

type TagResult = {
  siteId: number;
  timestamp: Date;
  deviceReads: DeviceTagResult[];
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

type DeviceTagResult = {
  deviceId: number;
  reads: ReadItem[];
};

function wait(ms: number) {
  new Promise((r) => setTimeout(r, ms));
}

async function handleModbus(device: Device, writeData: WriteItem[]): Promise<DeviceTagResult | null> {
  const { id, deviceId, address, port } = device;

  console.log(id, address, port, '-', 'start reading', dayjs().format('HH:mm:ss:SSS'));

  const tagResult: DeviceTagResult = {
    deviceId: id,
    reads: [],
  };

  try {
    const client = new ModbusRTU();
    await client.connectTCP(address, { port });
    await client.setID(deviceId);

    if (writeData.length > 0) {
      const writeItem = writeData.shift();
      const tagIndex = device.tags.findIndex((tag) => tag.id === writeItem.tagId);

      if (tagIndex >= 0) {
        await writeModbusRegister(client, device.tags[tagIndex].deviceModelTag, writeItem.value);
      }
    }

    for (const tag of device.tags) {
      try {
        if (!tag.deviceModelTag.writeState) {
          tagResult.reads.push({
            tagId: tag.id,
            read: await readModbusRegister(client, tag.deviceModelTag),
          });
        }
      } catch (readErr) {
        console.log('read error', readErr);
      }
    }

    client.close(() => {
      console.log(id, address, port, '- close', device.address, device.port);
    });

    console.log(id, address, port, '-', 'end reading', dayjs().format('HH:mm:ss:SSS'));
    return tagResult;
  } catch (modbusErr) {
    console.log('modbus error', modbusErr);
    return null;
  }
}

async function readModbusRegister(client: ModbusRTU, modelTag: DeviceModelTag): Promise<string> {
  // FC1 "Read Coil Status"	readCoils(coil, len)
  // FC2 "Read Input Status"	readDiscreteInputs(addr, arg)
  // FC3 "Read Holding Registers"	readHoldingRegisters(addr, len)
  // FC4 "Read Input Registers"	readInputRegisters(addr, len)

  if (modelTag.readFunc === 1) {
    const result = await client.readCoils(modelTag.address, modelTag.length);
    return readModbusBuffer(modelTag.dataType, result.buffer);
  } else if (modelTag.readFunc === 2) {
    const result = await client.readDiscreteInputs(modelTag.address, modelTag.length);
    return readModbusBuffer(modelTag.dataType, result.buffer);
  } else if (modelTag.readFunc === 3) {
    const result = await client.readHoldingRegisters(modelTag.address, modelTag.length);
    return readModbusBuffer(modelTag.dataType, result.buffer);
  } else if (modelTag.readFunc === 4) {
    const result = await client.readInputRegisters(modelTag.address, modelTag.length);
    return readModbusBuffer(modelTag.dataType, result.buffer);
  }

  return '0';
}

function readModbusBuffer(dataType: string, resultBuffer: Buffer): string {
  let result: number = 0;

  switch (dataType) {
    case 'int16':
    case 'int16s':
      result = resultBuffer.readInt16BE();
      break;

    case 'int16u':
      result = resultBuffer.readUInt16BE();
      break;

    case 'int32':
    case 'int32s':
      result = resultBuffer.readInt32BE();
      break;

    case 'int32u':
      result = resultBuffer.readUInt32BE();
      break;

    case 'float':
      result = resultBuffer.readFloatBE();
  }

  return String(result);
}

async function writeModbusRegister(client: ModbusRTU, modelTag: DeviceModelTag, value: any): Promise<void> {
  // FC5 "Force Single Coil"	writeCoil(coil, binary) //NOT setCoil
  // FC6 "Preset Single Register"	writeRegister(addr, value)
  // FC15 "Force Multiple Coil"	writeCoils(addr, valueAry)
  // FC16 "Preset Multiple Registers"	writeRegisters(addr, valueAry)

  if (modelTag.writeFunc === 5) {
    // await client.writeCoil(modelTag.address, value);
  } else if (modelTag.writeFunc === 6) {
    await client.writeRegister(modelTag.address, Number(value));
  } else if (modelTag.writeFunc === 15) {
    // await client.writeCoils(modelTag.address, value);
  } else if (modelTag.writeFunc === 16) {
    // await client.writeRegisters(modelTag.address, value);
  }
}

bootstrap()
  .then(async () => {
    console.log('App started');

    let retries = 0;
    let accessToken = '';

    do {
      try {
        await wait(3000);
        const authResp = await axios.post<Token>('auth/login', {
          email: API_USER,
          password: API_PASS,
        });

        const { data: token } = authResp;
        accessToken = token.accessToken;
        axios.defaults.headers.common.Authorization = `Bearer ${token.accessToken}`;

        retries = -1;
      } catch (err) {
        retries++;
      }
    } while (retries < 5 && retries != -1);

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
            Authorization: accessToken,
          },
        },
      },
    };

    const socket: Socket = io(BASE_WS_URL, socketOptions);
    socket.on('disconnect', handleClose);
    socket.on('connect', handleOpen);

    socket.io.on('reconnect_attempt', () => {
      console.log('reconnect_attempt');
    });

    socket.io.on('reconnect', () => {
      console.log('reconnect');
    });

    // const writeData: { id: number; item: WriteItem }[] = [];

    const writeData: { [deviceId: number]: { id: number; item: WriteItem }[] } = {};

    socket.on('tag_out', (data: WriteItem) => {
      console.log('[incoming]writeData', data);

      if (data.tagId > -1) {
        if (!writeData[data.deviceId]) {
          writeData[data.deviceId] = [];
        }

        writeData[data.deviceId].push({
          id: dayjs().toDate().getTime(),
          item: data,
        });
      }
    });

    scheduleJob(READ_INTERVAL, () => {
      console.log('reading...');

      try {
        fs.readFile('./data/site-infos.json', { encoding: 'utf-8' }, (fileErr, siteJson) => {
          if (fileErr) {
            console.error('site-infos.json is not found.');
            return;
          }

          const site = JSON.parse(siteJson) as Site;
          const { devices } = site;

          const deviceHandlers = devices.map(async (device) => {
            const { id, address, port, stopped, deviceModel } = device;
            if (stopped) {
              console.log(address, port, 'has been stopped.');
              return;
            }

            if (!deviceModel) {
              console.log('Model has been provided.');
              return;
            }

            if (deviceModel.modelType === 'modbus') {
              let writingItems: { id: number; item: WriteItem }[] = [];

              if (writeData[id]) {
                writingItems = writeData[id].filter((item) => item.id <= dayjs().toDate().getTime());
                console.log('[writing]writeData', writingItems);
                writingItems.forEach((item) => {
                  const tempIndex = writeData[id].findIndex((tempItem) => tempItem.id === item.id);
                  if (tempIndex >= 0) {
                    writeData[id].splice(tempIndex, 1);
                  }
                });
              }

              return await handleModbus(
                device,
                writingItems.map((item) => item.item),
              );
            } else if (deviceModel.modelType === 'opcua') {
              console.log('OPC UA had been implemented yet.');
              // TODO: implement here
            }
          });

          (async () => {
            const readResults = await Promise.all(deviceHandlers);
            const tempReads = readResults.map((item) => item);
            const tagResult: TagResult = {
              siteId: site.id,
              timestamp: dayjs().startOf('s').toDate(),
              deviceReads: tempReads,
            };

            try {
              socket.emit('tagReads', tagResult);
              tempReads.forEach((item) => console.log(item.deviceId, item.reads));
            } catch (socketErr) {
              console.log('sending error', socketErr);
            }
          })();
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

        const devicesResp = await axios.get<Device[]>(`sites/${SITE_ID}/devices`);

        const { data: devices } = devicesResp;
        const siteJson = JSON.stringify(devices);
        fs.writeFile('./data/site-infos.json', siteJson, (fileErr) => {
          if (fileErr) {
            console.log(fileErr);
          }
        });
        await axios.put(`sites/${SITE_ID}/synced`);
      } catch (requestErr) {
        console.log(requestErr);
      }
    });
  })
  .catch((reason) => {
    console.log('App error', reason);
  });
