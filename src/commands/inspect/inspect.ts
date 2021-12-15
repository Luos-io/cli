import { Command } from 'commander';

import { RTB } from 'commands/inspect/rtb/index.js';

export const inspect = (rootCmd: Command) =>
  new Command('inspect')
    .description('INSPECT command description')
    .addCommand(RTB(rootCmd));
