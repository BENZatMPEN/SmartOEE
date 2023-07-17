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
import { DeviceModelTag } from './@types/deviceModel';
import {
  AttributeIds,
  ClientSession,
  DataType,
  MessageSecurityMode,
  OPCUAClient,
  SecurityPolicy,
  StatusCode,
} from 'node-opcua';

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

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function handleModbus(device: Device, writeData: WriteItem[]): Promise<DeviceTagResult | null> {
  const { id, deviceId, address, port } = device;

  const tagResult: DeviceTagResult = {
    deviceId: id,
    reads: [],
  };

  try {
    const client = new ModbusRTU();
    await client.connectTCP(address, { port });
    await client.setID(deviceId);

    console.log(`[ID: ${id} - ${address} ${port}]`, 'connected', dayjs().format('HH:mm:ss:SSS'));

    for (const writeItem of writeData) {
      const tagIndex = device.tags.findIndex((tag) => tag.id === writeItem.tagId);
      if (tagIndex >= 0) {
        await writeModbusRegister(client, device.tags[tagIndex].deviceModelTag, writeItem.value);
        console.log(`[ID: ${id} - ${address} ${port}]`, 'wrote', writeItem);
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
        console.log(`[ID: ${id} - ${address} ${port}]`, 'read error', readErr);
      }
    }

    client.close(() => {
      console.log(`[ID: ${id} - ${address} ${port}]`, 'closed', dayjs().format('HH:mm:ss:SSS'));
    });

    return tagResult;
  } catch (modbusErr) {
    console.log(`[ID: ${id} - ${address} ${port}]`, 'modbus error', modbusErr);
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
    const buf = Buffer.alloc(8, 0);
    buf.writeFloatBE(Number(value), 0);
    await client.writeRegisters(modelTag.address, buf);
  }
}

async function handleOpcUa(device: Device, writeData: WriteItem[]): Promise<DeviceTagResult | null> {
  const { id, address, port } = device;

  const tagResult: DeviceTagResult = {
    deviceId: id,
    reads: [],
  };

  try {
    const connectionStrategy = {
      initialDelay: 1000,
      maxRetry: 1,
    };

    const client = OPCUAClient.create({
      applicationName: 'MyClient',
      connectionStrategy: connectionStrategy,
      securityMode: MessageSecurityMode.None,
      securityPolicy: SecurityPolicy.None,
      endpointMustExist: false,
    });

    await client.connect(`${address}:${port}`);
    const session = await client.createSession();

    console.log(`[ID: ${id} - ${address} ${port}]`, 'connected', dayjs().format('HH:mm:ss:SSS'));

    for (const writeItem of writeData) {
      const tagIndex = device.tags.findIndex((tag) => tag.id === writeItem.tagId);
      if (tagIndex >= 0) {
        const statusCode = await writeOpcUaRegister(session, device.tags[tagIndex].deviceModelTag, writeItem.value);
        if (statusCode.isGood()) {
          console.log(`[ID: ${id} - ${address} ${port}]`, 'wrote', writeItem);
        } else {
          console.log(`[ID: ${id} - ${address} ${port}]`, 'wrote error', statusCode);
        }
      }
    }

    for (const tag of device.tags) {
      try {
        if (!tag.deviceModelTag.writeState) {
          const dataValue = await session.read({
            nodeId: tag.deviceModelTag.address,
            attributeId: AttributeIds.Value,
          });

          tagResult.reads.push({
            tagId: tag.id,
            read: String(dataValue.value.value),
          });
        }
      } catch (readErr) {
        console.log(`[ID: ${id} - ${address} ${port}]`, 'read error', readErr);
      }
    }

    await session.close();
    await client.disconnect();
    console.log(`[ID: ${id} - ${address} ${port}]`, 'closed', dayjs().format('HH:mm:ss:SSS'));

    return tagResult;
  } catch (modbusErr) {
    console.log(`[ID: ${id} - ${address} ${port}]`, 'opcua error', modbusErr);
    return null;
  }
}

function writeOpcUaRegister(session: ClientSession, modelTag: DeviceModelTag, value: any): Promise<StatusCode> {
  return session.write({
    nodeId: modelTag.address,
    attributeId: AttributeIds.Value,
    value: {
      value: {
        value: value,
        dataType: getOpcUaDataType(modelTag.dataType),
      },
    },
  });
}

function getOpcUaDataType(dataType: string): DataType {
  switch (dataType) {
    case 'int16':
    case 'int16s':
      return DataType.Int16;

    case 'int16u':
      return DataType.UInt16;

    case 'int32':
    case 'int32s':
      return DataType.Int32;

    case 'int32u':
      return DataType.UInt32;

    case 'float':
      return DataType.Float;

    default:
      return DataType.String;
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

    const writeData: { [deviceId: number]: { id: number; item: WriteItem }[] } = {};

    socket.on('tag_out', (data: WriteItem) => {
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
      try {
        fs.readFile('./data/site-infos.json', { encoding: 'utf-8' }, (fileErr, siteJson) => {
          if (fileErr) {
            console.error('site-infos.json is not found.');
            return;
          }

          const site = JSON.parse(siteJson) as Site;
          const { devices } = site;

          const deviceHandlers = devices
            .filter((device) => !device.stopped && device.deviceModel)
            .map(async (device) => {
              const { id, address, port, deviceModel } = device;
              let writingItems: { id: number; item: WriteItem }[] = [];

              if (writeData[id]) {
                writingItems = writeData[id].filter((item) => item.id <= dayjs().toDate().getTime());
                console.log(`[ID: ${id} - ${address} ${port}]`, 'capture writing data', writingItems);
                writingItems.forEach((item) => {
                  const tempIndex = writeData[id].findIndex((tempItem) => tempItem.id === item.id);
                  if (tempIndex >= 0) {
                    writeData[id].splice(tempIndex, 1);
                  }
                });
              }

              if (deviceModel.modelType === 'modbus') {
                return await handleModbus(
                  device,
                  writingItems.map((item) => item.item),
                );
              } else if (deviceModel.modelType === 'opcua') {
                return await handleOpcUa(
                  device,
                  writingItems.map((item) => item.item),
                );
              }
            });

          (async () => {
            const readResults = await Promise.all(deviceHandlers);
            const tempReads = readResults.filter((item) => item);
            const tagResult: TagResult = {
              siteId: site.id,
              timestamp: dayjs().startOf('s').toDate(),
              deviceReads: tempReads,
            };

            try {
              socket.emit('tagReads', tagResult);
              tempReads.forEach((item) => {
                console.log(`[ID: ${item.deviceId} - SiteID: ${site.id}]`);
                console.log(item);
              });
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
      try {
        const siteResp = await axios.get<Site>(`sites/${SITE_ID}`);
        const { data: site } = siteResp;

        if (!site.sync) {
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
        console.log('data synced');
      } catch (requestErr) {
        console.log(requestErr);
      }
    });
  })
  .catch((reason) => {
    console.log('App error', reason);
  });
