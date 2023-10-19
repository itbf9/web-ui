export class ChunkState {
  static readonly NEW = "New";
  static readonly INIT = "Init";
  static readonly RUNNING = "Running";
  static readonly PAUSED = "Paused";
  static readonly EXHAUSTED = "Exhausted";
  static readonly CRACKED = "Cracked";
  static readonly ABORTED = "Aborted";
  static readonly QUIT = "Quit";
  static readonly BYPASS = "Bypass";
  static readonly TRIMMED = "Trimmed";
  static readonly ABORTING = "Aborting...";
}


export const chunkStates = [
  ChunkState.NEW,
  ChunkState.INIT,
  ChunkState.RUNNING,
  ChunkState.PAUSED,
  ChunkState.EXHAUSTED,
  ChunkState.CRACKED,
  ChunkState.ABORTED,
  ChunkState.QUIT,
  ChunkState.BYPASS,
  ChunkState.TRIMMED,
  ChunkState.ABORTING
]