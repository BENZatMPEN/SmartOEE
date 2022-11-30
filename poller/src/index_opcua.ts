import {
  AttributeIds,
  ClientMonitoredItem,
  ClientSubscription,
  DataType,
  DataValue,
  makeBrowsePath,
  MessageSecurityMode,
  MonitoringParametersOptions,
  NodeClass,
  OPCUAClient,
  ReadValueIdOptions,
  SecurityPolicy,
  TimestampsToReturn,
  UserIdentityInfoUserName,
} from 'node-opcua';

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

async function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const bootstrap = async () => {
  const devices: Device[] = [
    {
      name: 'model-1',
      modelType: 'modbus',
      connectionType: 'serial',
      deviceId: 1,
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
          interval: '*/1 * * * * *',
          record: true,
        },
      ],
    },
    {
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
          interval: '*/1 * * * * *',
          record: true,
        },
      ],
    },
    {
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
          interval: '*/1 * * * * *',
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
          interval: '*/1 * * * * *',
          record: true,
        },
      ],
    },
  ];

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
  // const endpointUrl = 'opc.tcp://pop-dev:62640/IntegrationObjects/ServerSimulator';
  const endpointUrl = 'opc.tcp://192.168.0.210:4840';

  await client.connect(endpointUrl);
  console.log('connected !');

  const session = await client.createSession({
    userName: 'benzbenz',
    password: 'benzbenz',
  } as UserIdentityInfoUserName);
  console.log('session created !');

  const browseResult = await session.browse('RootFolder');

  console.log('references of RootFolder :');
  for (const reference of browseResult.references) {
    console.log('   -> ', reference.browseName.toString());
  }

  const subscription = ClientSubscription.create(session, {
    requestedPublishingInterval: 1000,
    requestedLifetimeCount: 100,
    requestedMaxKeepAliveCount: 10,
    maxNotificationsPerPublish: 100,
    publishingEnabled: true,
    priority: 10,
  });

  subscription
    .on('started', function () {
      console.log('subscription started for 2 seconds - subscriptionId=', subscription.subscriptionId);
    })
    .on('keepalive', function () {
      console.log('keepalive');
    })
    .on('terminated', function () {
      console.log('terminated');
    });

  // install monitored item
  const variablesNodeId = 'ns=4;i=47'; // RootFolder.Objects.Server
  const realTimeDataResult = await session.browse({
    nodeId: variablesNodeId,
    nodeClassMask: NodeClass.Variable, // we only want sub node that are Variables
    resultMask: 63, // extract all information possible
  });

  for (const reference of realTimeDataResult.references) {
    // console.log('   -> ', reference);

    // const result = await session.read({
    //   nodeId: reference.nodeId,
    // });

    const itemToMonitor: ReadValueIdOptions = {
      nodeId: reference.nodeId,
      attributeId: AttributeIds.Value,
    };

    const parameters: MonitoringParametersOptions = {
      samplingInterval: 100,
      discardOldest: true,
      queueSize: 10,
    };

    const monitoredItem = ClientMonitoredItem.create(subscription, itemToMonitor, parameters, TimestampsToReturn.Both);

    monitoredItem.on('changed', (dataValue: DataValue) => {
      console.log(' value has changed : ', dataValue.value.toString());
    });
    // console.log(DataType[result.value.dataType]);
    // const tagResult = await session.browse({
    //   nodeId: reference.typeDefinition,
    // });
    // console.log(tagResult.explore());
  }

  // const itemToMonitor: ReadValueIdOptions = {
  //   nodeId: 'ns=1;s=free_memory',
  //   attributeId: AttributeIds.Value,
  // };

  // const parameters: MonitoringParametersOptions = {
  //   samplingInterval: 100,
  //   discardOldest: true,
  //   queueSize: 10,
  // };
  //
  // const monitoredItem = ClientMonitoredItem.create(subscription, itemToMonitor, parameters, TimestampsToReturn.Both);
  //
  // monitoredItem.on('changed', (dataValue: DataValue) => {
  //   console.log(' value has changed : ', dataValue.value.toString());
  // });

  // await timeout(10000);
  //
  // console.log('now terminating subscription');
  // await subscription.terminate();

  // const browseRealTimeDataPath = makeBrowsePath('RootFolder', '/Objects/2:Realtimedata');
  //
  // const realTimeData = await session.translateBrowsePath(browseRealTimeDataPath);
  // console.log(realTimeData.targets[0]);

  // const browseRealTimeDataPath = makeBrowsePath('RootFolder', '/Objects/2:Realtimedata');
  // const realTimeDataBrowserPath = await session.translateBrowsePath(browseRealTimeDataPath);
  // // const realTimeData = await session.browse(realTimeDataBrowserPath.);
  // console.log(realTimeDataBrowserPath.targets[0].targetId);

  // const nodeId = 'ns=2;s=Realtimedata'; // RootFolder.Objects.Server
  // const realTimeDataResult = await session.browse({
  //   nodeId,
  //   nodeClassMask: NodeClass.Variable, // we only want sub node that are Variables
  //   resultMask: 63, // extract all information possible
  // });
  //
  // for (const reference of realTimeDataResult.references) {
  //   // console.log('   -> ', reference);
  //
  //   const result = await session.read({
  //     nodeId: reference.nodeId,
  //   });
  //
  //   console.log(DataType[result.value.dataType]);
  //   // const tagResult = await session.browse({
  //   //   nodeId: reference.typeDefinition,
  //   // });
  //   // console.log(tagResult.explore());
  // }
  // console.log('BrowseResult = ', browseResult1.references);

  // await session.browse({
  //   nodeId: realTimeData.targets[0],
  // });
  // const productNameNodeId = result.targets[0].targetId;
  // console.log(' Product Name nodeId = ', productNameNodeId.toString());

  // const maxAge = 0;
  // const nodeToRead = {
  //   nodeId: 'ns=2;s=Realtimedata',
  //   attributeId: AttributeIds.Value,
  // };
  // const dataValue = await session.read(nodeToRead, maxAge);
  // console.log(' value ', dataValue.toString());

  // await session.close();

  // await client.disconnect();
  // console.log('done !');

  // async function main() {
  //   try {
  //     // step 1 : connect to
  //     _"Connection"
  //
  //     // step 2 : createSession
  //     _"create session"
  //
  //     // step 3 : browse
  //     _"browsing the root folder"
  //
  //     // step 4 : read a variable with readVariableValue
  //     _"read a variable with readVariableValue"
  //
  //     // step 4' : read a variable with read
  //     _"read a variable with read"
  //
  //     // step 5: install a subscription and install a monitored item for 10 seconds
  //     _"install a subscription"
  //
  //     // step 6: finding the nodeId of a node by Browse name
  //     _"finding the nodeId of a node by Browse name"
  //
  //     // close session
  //     _"closing session"
  //
  //     // disconnecting
  //     _"disconnecting"
  //   } catch(err) {
  //     console.log("An error has occured : ",err);
  //   }
  // }
  //

  // const addressDevices: AddressDevices = devices.reduce((prev, current) => {
  //   if (!prev[current.address]) {
  //     prev[current.address] = [];
  //   }
  //   prev[current.address].push(current);
  //   return prev;
  // }, {});
  //
  // const addresses = Object.keys(addressDevices);
  // const connections: { [id: string]: ModbusRTU } = {};
  //
  // for (const address of addresses) {
  //   const client = new ModbusRTU();
  //   // await client.connectRTU(address, { baudRate: 9600 });
  //   await client.connectTCP('127.0.0.1', { port: 502 });
  //   connections[address] = client;
  // }
  //
  // for (const device of devices) {
  //   for (const tag of device.tags) {
  //     schedule(tag.interval, async () => {
  //       // await sleep(100 * device.deviceId);
  //       console.log('name: ', device.name, 'device: ', device.deviceId, 'address: ', tag.address);
  //       await connections[device.address].setID(device.deviceId);
  //       const result = await connections[device.address].readHoldingRegisters(tag.address, tag.length);
  //       console.log(result);
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
