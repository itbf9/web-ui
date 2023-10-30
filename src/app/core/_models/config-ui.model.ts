import { AgentsTableColumnLabel } from "../_components/agents-table/agents-table.constants"
import { ChunksTableColumnLabel } from "../_components/chunks-table/chunks-table.constants"
import { TaskTableColumnLabel } from "../_components/tasks-table/tasks-table.constants"

export class IStorage {
  constructor(
    private _timefmt: string,
    private _enablebrain: number,
    private _halias: string,
    private _bchars: string,
    private _chunkt: string,
    private _statimer: string,
    private _timestamp: number,
    private _expiresin: number,
  ) { }

}

export type Layout = 'full' | 'fixed'
export type Theme = 'light' | 'dark'

export interface TableSettings {
  [key: string]: string[]
}

export interface UIConfig {
  layout: Layout
  theme: Theme
  tableSettings: TableSettings,
  timefmt: string,
}

export const uiConfigDefault: UIConfig = {
  layout: 'fixed',
  theme: 'light',
  timefmt: 'dd/MM/yyyy h:mm:ss',
  tableSettings: {
    agentTable: [
      AgentsTableColumnLabel.ID,
      AgentsTableColumnLabel.STATUS,
      AgentsTableColumnLabel.NAME,
      AgentsTableColumnLabel.USER,
      AgentsTableColumnLabel.CLIENT,
      AgentsTableColumnLabel.GPUS_CPUS,
      AgentsTableColumnLabel.LAST_ACTIVITY,
      AgentsTableColumnLabel.ACCESS_GROUP
    ],
    chunkTable: [
      ChunksTableColumnLabel.ID,
      ChunksTableColumnLabel.PROGRESS,
      ChunksTableColumnLabel.TASK,
      ChunksTableColumnLabel.AGENT,
      ChunksTableColumnLabel.DISPATCH_TIME,
      ChunksTableColumnLabel.LAST_ACTIVITY,
      ChunksTableColumnLabel.TIME_SPENT,
      ChunksTableColumnLabel.STATE,
      ChunksTableColumnLabel.CRACKED,
    ],
    taskTable: [
      TaskTableColumnLabel.ID,
      TaskTableColumnLabel.NAME,
      TaskTableColumnLabel.STATUS,
      TaskTableColumnLabel.ATTACK_CMD,
      TaskTableColumnLabel.HASHLISTS,
      TaskTableColumnLabel.CRACKED,
      TaskTableColumnLabel.AGENTS,
      TaskTableColumnLabel.SPEED,
      TaskTableColumnLabel.PRIORITY,
    ]
  }
}
