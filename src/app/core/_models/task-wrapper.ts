import { Hashlist } from "./hashlist"

export interface TaskWrapper {
  _id: number
  _self: string
  accessGroupId: number
  cracked: number
  hashlistId: number
  hashlist?: Hashlist[]
  isArchived: boolean
  maxAgents: number
  priority: number
  taskType: number
  taskWrapperId: number
  taskWrapperName: string
}