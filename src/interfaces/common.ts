/**
 * CLIGlobalOptions
 * @description Global options for CLI
 * @link Global Options - https://docs.luos.io/cli/global-options
 */
export interface CLIGlobalOptions {
  debug: boolean;
}

/**
 * ModuleType
 * @description Type of module
 * @link Gate - https://docs.luos.io/pages/embedded/tools/gate.html
 * @enum {string}
 */
export enum ModuleType {
  ALL = 'ALL',
  GATE = 'GATE',
  SNIFFER = 'SNIFFER',
}
export const moduleTypeEnum = Object.keys(ModuleType);

