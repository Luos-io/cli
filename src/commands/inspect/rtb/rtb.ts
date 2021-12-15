import { Command, Argument } from 'commander';
import { RTB as getRTB, RTBNode } from '@luos-io/sdk-ts';

import { logger } from 'utils/index.js';
import { CLIGlobalOptions } from 'interfaces/common';

export const RTB = (rootCmd: Command) =>
  new Command('rtb')
    .description('Inspect RTB [Routing TaBle] of the given serial port')
    .addArgument(new Argument('<path>', 'Serial port path'))
    .action(async (path) => {
      const { debug } = rootCmd.opts<CLIGlobalOptions>();

      if (debug) {
        logger.debug(`Starting to inspect RTB of '${path}'`);
      }

      const result = await getRTB(path, { debug });

      logger.info('RTB Data:');
      console.table(
        result.nodes.map((n: RTBNode) => {
          const node = {
            ...n,
            Cert: n.certificate ? '✅' : '❌',
            'Port Table': n.portTable,
            Services: n.services.map((s: any) => s.alias).join(', '),
          };
          return node;
        }),
        ['ID', 'Cert', 'Port Table', 'Services'],
      );
    });
export default RTB;
