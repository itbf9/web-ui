import { Agent } from "./agents"
import { Task } from "./task"

export interface BaseChunk {
  chunkId: number
  taskId: number
  format: string
  skip: string
  length: number
  agentId: number
  dispatchTime: number
  solveTime: number
  checkpoint: number
  progress: number
  state: number
  cracked: number
  speed: number
}

export interface Chunk {
  _id: number
  _self: string
  chunkId: number
  taskId: number
  task?: Task
  format: string
  skip: number
  length: number
  agentId: number
  agent?: Agent
  dispatchTime: number
  solveTime: number
  checkpoint: number
  progress: number
  state: number
  cracked: number
  speed: number
}