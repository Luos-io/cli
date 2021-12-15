#!/usr/bin/env node
import { Argument, Command, Option } from 'commander';

import { logger } from 'utils/index.js';
import { list, inspect, test } from './commands/index.js';
import {
  CLIGlobalOptions,
  ModuleType,
  moduleTypeEnum,
  TestType,
  testTypeEnum,
} from './interfaces/common.js';

// import thisPackage from '../package.json';

const program = new Command();

// GLOBAL OPTIONS
// program.version(thisPackage.version);
program.option('-d, --debug', 'Add debug informations', false);

//#region Commands
//#region List
program
  .command('list')
  .description('LIST command description')
  .addArgument(
    new Argument('[type]', 'Module type')
      .choices(moduleTypeEnum.map((m) => m.toLowerCase()))
      .default(ModuleType.ALL.toLowerCase()),
  )
  .action(async (moduleType: ModuleType) => {
    const { debug } = program.opts<CLIGlobalOptions>();
    if (debug) {
      logger.debug(
        `Starting to search available ${
          moduleType === ModuleType.ALL.toLowerCase() ? 'device' : moduleType
        }s`,
      );
    }

    const modules = await list(moduleType, program.opts());
    if (modules.length === 0) {
      logger.warn(
        `No ${
          moduleType === ModuleType.ALL.toLowerCase() ? 'device' : moduleType
        } found`,
      );
    } else {
      logger.log(
        `${modules.length} ${
          moduleType === ModuleType.ALL.toLowerCase() ? 'device' : moduleType
        }(s) found :`,
      );
      console.group();
      modules.map((m: any) => logger.info(JSON.stringify(m)));
      console.groupEnd();
    }
  });
//#endregion List

program.addCommand(inspect(program));

//#endregion Commands

program.parse(process.argv);
