import SerialPort, { PortInfo } from 'serialport';
import { OptionValues } from 'commander';
import { logger } from '@luos-io/utils';

import { ModuleType } from '../../interfaces/common';

import type {
  IRoutingTable,
  RoutingTableNode,
} from '../../interfaces/routingTable';

interface ICancellablePromise<T> extends Promise<T> {
  cancel: (err: Error) => void;
}

const cancellablePromiseWithTimeout = <T>(
  promise: ICancellablePromise<T>,
  time: number,
) => {
  let timer: NodeJS.Timeout;
  return Promise.race<T>([
    promise,
    new Promise<T>(
      (_res, rej) =>
        (timer = setTimeout(() => {
          const err = new Error('Timeout');
          promise.cancel(err);
          rej(err);
        }, time)),
    ),
  ]).finally(() => clearTimeout(timer));
};
const getRoutingTable = (path: string) => {
  const port = new SerialPort(path, {
    baudRate: 1000000,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    lock: true,
  });

  const parser = port.pipe(
    new SerialPort.parsers.Readline({
      delimiter: '\n',
      encoding: 'utf8',
    }),
  );

  let rejectCb: (err: Error) => void;

  const promise: Partial<ICancellablePromise<RoutingTableNode[]>> = new Promise<
    RoutingTableNode[]
  >((resolve, reject) => {
    rejectCb = reject;
    parser.on('data', (data) => {
      try {
        const json: IRoutingTable = JSON.parse(data);
        if (json.routing_table) {
          port.close();
          return resolve(json.routing_table);
        }
      } catch (err) {
        // Unparsable JSON received
        // return reject(err);
      }
    });
    port.on('error', (err) => {
      if (port.isOpen) {
        port.close();
      }
      return reject(err);
    });

    // port.flush();
    port.write(`{"detection": {}}\r`, (err) => {
      if (err) {
        port.close();
        return reject(err);
      }
    });
  });
  promise.cancel = (err: Error) => {
    port.close();
    port.destroy();
    rejectCb(err);
  };
  return promise as ICancellablePromise<RoutingTableNode[]>;
};

const findModuleTypeInRoutingTable = (
  routingTableNodes: RoutingTableNode[],
  moduleType: ModuleType,
): RoutingTableNode | undefined =>
  routingTableNodes.find((node) =>
    node.containers.find(
      (container) => container.type.toLowerCase() === moduleType,
    ),
  );

/**
 * @description List a type of 'Module' connected to the host machine.
 */
export const List = async (moduleType: ModuleType, options: OptionValues) => {
  const { debug } = options;
  const availableModule: PortInfo[] = [];
  try {
    const portsInfo: SerialPort.PortInfo[] = await SerialPort.list();

    const results = await Promise.allSettled(
      portsInfo.map((portInfo) => {
        if (debug) {
          logger.debug(`Sending detection signal to '${portInfo.path}' ...`);
        }

        return cancellablePromiseWithTimeout(
          getRoutingTable(portInfo.path),
          1000,
        );
      }),
    );

    results.map((res, index) => {
      if (res.status === 'fulfilled') {
        const gate = findModuleTypeInRoutingTable(res.value, moduleType);
        if (gate) {
          availableModule.push(portsInfo[index]);
        }
      } else if (debug) {
        logger.debug(
          `Detection signal to '${portsInfo[index].path}' was unsuccessfull : ${res?.reason?.message}`,
        );
      }
    });
  } catch (err) {
    logger.error(
      `Can't get USB devices from the default system path '/dev/' : ${err}`,
    );
  }

  return availableModule;
};
export default List;
