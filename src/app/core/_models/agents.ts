import { AccessGroup } from "./access-group"
import { User } from "./user.model"
import { Task } from './task'
import { Chunk } from "./chunk"

export interface AgentStats {
  _id: number
  _self: string
  agentStatId: number
  agentId: number
  statType: number
  time: number
  value: number[]
}

export interface Agent {
  _id?: number
  _self?: string
  agentId: number
  agentName: string
  uid: string
  os: number
  devices: string
  cmdPars: string
  ignoreErrors: number
  isActive: boolean
  isTrusted: boolean
  token: string
  lastAct: string
  lastTime: number
  lastIp: string
  userId: number
  user?: User
  cpuOnly: number
  clientSignature: string
  agentstats?: AgentStats[]
  accessGroups?: AccessGroup[]
  taskId?: number
  task?: Task
  chunk?: Chunk
}





export interface IAgents {
  _expandable?: string
  startAt: number
  maxResults: number
  total: number
  isLast: string
  values: Agent[]
}
