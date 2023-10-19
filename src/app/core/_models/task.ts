// import { Hashlist } from "./hashlist";

export interface NormalTask {
  id: number;
  name: string;
  priority: number;
  maxAgents: number;

  hashlistId: number;
  // hashlist: Hashlist;
}

export interface Task {
  _id: number
  _self: string
  attackCmd: string
  chunkSize: number
  chunkTime: number
  color?: string
  crackerBinaryId: number
  crackerBinaryTypeId: number
  forcePipe: boolean
  isArchived: boolean
  isCpuTask: boolean
  isSmall: boolean
  keyspace: number
  keyspaceProgress: number
  maxAgents: number
  notes: string
  preprocessorCommand: number
  preprocessorId: number
  priority: number
  skipKeyspace: number
  staticChunks: number
  statusTimer: number
  taskId: number
  taskName: string
  taskWrapperId: number
  useNewBench: boolean
}
