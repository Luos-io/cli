import { OptionValues } from 'commander';
import { List } from '@luos-io/sdk-ts';
import type { ModuleType } from '@luos-io/sdk-ts';

export const list = async (moduleType: ModuleType, options: OptionValues) =>
  await List(moduleType, options.debug);
export default list;
