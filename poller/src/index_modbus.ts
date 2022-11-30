import ModbusRTU from 'modbus-serial';
import { schedule } from 'node-cron';

interface DeviceBase {
  name: string;
  remark?: string;
  modelType: 'opcua' | 'modbus';
  connectionType: 'tpc' | 'serial';
}

interface TagBase {
  name: string;
  address: number;
  length: number;
  dataType: string;
  readFunc: number;
  writeFunc?: number;
  writeState: boolean;
  factor: number;
  compensation: number;
}

interface DeviceModel extends DeviceBase {
  tags: DeviceModelTag[];
}

interface DeviceModelTag extends TagBase {}

interface Device extends DeviceBase {
  address: string;
  deviceId: number;
  tags: DeviceTag[];
}

interface DeviceTag extends TagBase {
  spLow: number;
  spHigh: number;
  interval: string;
  record: boolean;
}

interface AddressDevices {
  [id: string]: Device[];
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const bootstrap = async () => {
  const devices: Device[] = [
    {
      name: 'model-1',
      modelType: 'modbus',
      connectionType: 'tpc',
      deviceId: 1,
      address: '192.168.0.210',
      // port: 502,
      tags: [
        {
          name: 'INT_Counter1',
          address: 0,
          length: 10,
          dataType: 'int',
          readFunc: 3,
          writeState: false,
          factor: 0,
          compensation: 0,
          spLow: 0,
          spHigh: 0,
          interval: '0/1 * * * * *',
          record: true,
        },
      ],
    },
    /*{
      name: 'model-2',
      modelType: 'modbus',
      connectionType: 'serial',
      deviceId: 2,
      address: 'COM2',
      tags: [
        {
          name: 'tag1',
          address: 0,
          length: 10,
          dataType: 'int',
          readFunc: 3,
          writeState: false,
          factor: 0,
          compensation: 0,
          spLow: 0,
          spHigh: 0,
          interval: '1 * * * * *',
          record: true,
        },
      ],
    },*/
    /*{
      name: 'model-3',
      modelType: 'modbus',
      connectionType: 'serial',
      deviceId: 1,
      address: 'COM4',
      tags: [
        {
          name: 'tag1',
          address: 0,
          length: 10,
          dataType: 'int',
          readFunc: 3,
          writeState: false,
          factor: 0,
          compensation: 0,
          spLow: 0,
          spHigh: 0,
          interval: '* * * * *',
          record: true,
        },
      ],
    },
    {
      name: 'model-4',
      modelType: 'modbus',
      connectionType: 'serial',
      deviceId: 2,
      address: 'COM4',
      tags: [
        {
          name: 'tag1',
          address: 0,
          length: 10,
          dataType: 'int',
          readFunc: 3,
          writeState: false,
          factor: 0,
          compensation: 0,
          spLow: 0,
          spHigh: 0,
          interval: ' * * * * *',
          record: true,
        },
      ],
    },*/
  ];

  // const addressDevices: AddressDevices = devices.reduce((prev, current) => {
  //   if (!prev[current.address]) {
  //     prev[current.address] = [];
  //   }
  //   prev[current.address].push(current);
  //   return prev;
  // }, {});

  // const addresses = Object.keys(addressDevices);
  // const connections: { [id: string]: ModbusRTU } = {};

  // console.log(addressDevices)

  // for (const address of addresses) {
  //   const client = new ModbusRTU();
  //   console.log(address)
  //   // await client.connectRTU(address, { baudRate: 9600 });
  //   await client.connectTCP(address, { port: 502 });
  //   connections[address] = client;
  // }

  const client = new ModbusRTU();
  // const connection = await client.connectTCP('192.168.0.210', { port: 502 });
  await client.connectRTU('COM5', { baudRate: 9600 });
  await client.setID(2);

  // Write

  const buf = Buffer.alloc(4);
  buf.writeFloatBE(55.28, 0);
  await client.writeRegisters(22, buf);

  // func 1 - read output bits
  // client.readCoils
  // func 2 - read input bits
  // client.readDiscreteInputs
  // func 3 - read holding registers
  // client.readHoldingRegisters
  // func 4 - read input words
  // client.readInputRegisters
  // func 5 - write output bit
  // client.writeCoil
  // func 6 - write holding register
  // client.writeRegister
  // func 15 - write output bits
  // client.writeCoils
  // func 16 - write holding registers
  // client.writeRegisters

  schedule('*/1 * * * * *', async () => {
    console.log('address 0');
    console.log(await client.readHoldingRegisters(0, 1));
    console.log('address 1');
    console.log(await client.readHoldingRegisters(1, 1));
    console.log('address 2');
    console.log(await client.readHoldingRegisters(2, 1));
    console.log('address 3');
    console.log(await client.readHoldingRegisters(3, 1));
    console.log('address 4');
    console.log(await client.readHoldingRegisters(4, 1));
    console.log('address 5');
    console.log(await client.readHoldingRegisters(5, 1));
    console.log('address 6');
    console.log(await client.readHoldingRegisters(6, 1));
    console.log('address 7');
    console.log(await client.readHoldingRegisters(7, 1));
    console.log('address 8');
    // length จำนวนของ register
    const result = await client.readHoldingRegisters(22, 2);
    // offset เริ่มอ่านจากตรงไหน
    console.log(result.buffer.readFloatBE(0).toFixed(3));
    // console.log('address 9')
    // const result = await client.readHoldingRegisters(9, 2)
    // console.log(result.buffer.readFloatBE())
  });

  // for (const device of devices) {
  //   console.log(device)
  //   for (const tag of device.tags) {
  //     console.log(tag)
  //     schedule(tag.interval, async () => {
  //       console.log('test');
  //       // await sleep(100 * device.deviceId);
  //       // console.log('name: ', device.name, 'device: ', device.deviceId, 'address: ', tag.address);
  //       // await connections[device.address].setID(device.deviceId);
  //       // const result = await connections[device.address].readHoldingRegisters(tag.address, tag.length);
  //       // console.log(result);
  //     });
  //   }
  // }
};

bootstrap()
  .then(() => {
    console.log('Started app');
  })
  .catch((reason) => {
    console.log('App error', reason);
  });
