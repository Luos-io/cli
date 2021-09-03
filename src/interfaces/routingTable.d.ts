// Container example :
//  { type: 'Gate', id: 1, alias: 'gate' }
type Container = {
  type: string;
  id: number;
  alias: string;
};

// Node example :
//  { node_id: 1, certified: false, port_table: [ 2, 65535 ], containers: [ [Object] ] }
export type RoutingTableNode = {
  node_id: number;
  certified: boolean;
  port_table: number[];
  containers: Container[];
};

// IRoutingTable example :
//  { routing_table: [ [Object] ] }
export interface IRoutingTable {
  routing_table: RoutingTableNode[];
}
export default IRoutingTable;
