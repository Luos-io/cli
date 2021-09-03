#!/usr/bin/env node
import { Argument, Command } from 'commander';
import { logger } from '@luos-io/utils';

import { List } from './commands/list';
import { ModuleType, moduleTypeEnum } from './interfaces/common';

import thisPackage from '../package.json';

const program = new Command();
// GLOBAL OPTIONS
program.version(thisPackage.version);
program.option('-d, --debug', 'Add debug informations');

//#region Commands
//#region Run
program
  .command('list')
  .description('LIST command description')
  .addArgument(new Argument('<module>', 'Module type').choices(moduleTypeEnum))
  .action(async (moduleType: ModuleType) => {
    const { debug } = program.opts();

    if (debug) {
      logger.debug(`Starting to search available ${moduleType}s`);
    }

    const modules = await List(moduleType, program.opts());

    if (modules.length === 0) {
      logger.warn(`No ${moduleType} found`);
    } else {
      logger.log(`${modules.length} ${moduleType}(s) found :`);
      console.group();
      modules.map((m) => logger.info(m.path));
      console.groupEnd();
    }

    return;
  });
//#endregion Run
//#endregion Commands

program.parse(process.argv);
