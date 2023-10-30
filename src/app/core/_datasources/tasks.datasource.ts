import { catchError, finalize, firstValueFrom, forkJoin, of } from "rxjs";
import { SERV } from "../_services/main.config";
import { ListResponseWrapper } from "../_models/response";
import { BaseDataSource } from "./base.datasource";
import { Task } from "../_models/task";
import { Hashlist } from "src/app/hashlists/hashlist.model";
import { TaskWrapper } from "../_models/task-wrapper";
import { environment } from "src/environments/environment";
import { Chunk, ChunkData } from "../_models/chunk";
import { MatTableDataSourcePaginator } from "@angular/material/table";

export class TasksDataSource extends BaseDataSource<Task, MatTableDataSourcePaginator> {

  isArchived = false

  loadAll(): void {
    this.loadingSubject.next(true);
    const params = {
      maxResults: 1000,
      expand: 'crackerBinary,crackerBinaryType,hashlist,assignedAgents',
      filter: `isArchived=${this.isArchived}` // ,taskType=0
    };

    // vi kan inte plocka ut taskType från tasks

    const wrappers$ = this.service.getAll(SERV.TASKS_WRAPPER, { maxResults: 1000, filter: `isArchived=${this.isArchived}` })
    const tasks$ = this.service.getAll(SERV.TASKS, params)
    const hashLists$ = this.service.getAll(SERV.HASHLISTS, { maxResults: 1000 })

    forkJoin([wrappers$, tasks$, hashLists$])
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe(
        ([taskWrapperResponse, taskResponse, hashlistResponse]) => {

          const activeSuperTasks: TaskWrapper[] = taskWrapperResponse.values
            .filter((taskWrapper: TaskWrapper) => taskWrapper.taskType === 1);

          const superTasks = activeSuperTasks.map((superTask: TaskWrapper) => {
            const matchingHashList = hashlistResponse.values.find(
              (hashList: Hashlist) => hashList.hashlistId === superTask.hashlistId
            );
            superTask.hashlist = [matchingHashList]
            return superTask;
          });

          const mergedTasks = taskResponse.values.map((task: Task) => {
            const matchingTaskInfo = taskWrapperResponse.values.find((info) => info.taskWrapperId === task.taskWrapperId);
            task.taskWrapperId = matchingTaskInfo.taskWrapperId
            task.taskType = matchingTaskInfo.taskType

            return task;
          });

          // Filter active tasks (taskType === 0) and remove subtasks
          const activeTasks = mergedTasks.filter((task) => task.taskType === 0);

          // Concatenate active tasks and super tasks
          const allTasks = activeTasks.concat(superTasks);

          // Order by task priority
          const sortedTasks = allTasks.sort((a, b) => Number(b.priority) - Number(a.priority));

          // Set pagination configuration and update the data
          this.setPaginationConfig(this.pageSize, this.currentPage, taskWrapperResponse.total);
          console.log('sortedTasks', sortedTasks)
          this.setData(sortedTasks);
        }
      );
  }

  async getSpeed(id: number, chunktime: number, filterOnAgent = false): Promise<number> {
    const maxResults = environment.config.prodApiMaxResults;
    const cspeed = [];
    const params = {
      maxResults: maxResults,
      filter: filterOnAgent ? `agentId=${id}` : `taskId=${id}`
    };

    const res = await firstValueFrom(this.service.getAll(SERV.CHUNKS, params));
    for (let i = 0; i < res.values.length; i++) {
      if (Date.now() / 1000 - Math.max(res.values[i].solveTime, res.values[i].dispatchTime) < chunktime && res.values[i].progress < 10000) {
        cspeed.push(res.values[i].speed);
      }
    }
    const currenspeed = cspeed.reduce((a, i_1) => a + i_1, 0);
    if (currenspeed > 0) {
      return currenspeed;
    } else {
      return 0;
    }
  }

  async getChunkData(id: number, keyspace: number): Promise<ChunkData> {
    const maxResults = environment.config.prodApiMaxResults;
    const chunktime = this.uiService.getUIsettings('chunktime').value;

    const dispatched: number[] = [];
    const searched: number[] = [];
    const cracked: number[] = [];
    const speed: number[] = [];
    const now = Date.now()

    const params = {
      maxResults: maxResults,
      filter: `taskId=${id}`
    };

    const response: ListResponseWrapper<Chunk> = await firstValueFrom(this.service.getAll(SERV.CHUNKS, params))

    for (const chunk of response.values) {
      if (chunk.progress >= 10000) {
        dispatched.push(chunk.length);
      }
      cracked.push(chunk.cracked)
      searched.push(chunk.checkpoint - chunk.skip);
      if (now / 1000 - Math.max(chunk.solveTime, chunk.dispatchTime) < chunktime && chunk.progress < 10000) {
        speed.push(chunk.speed);
      }
    }

    return {
      dispatched: (dispatched.reduce((a, i) => a + i, 0) / keyspace),
      searched: (searched.reduce((a, i) => a + i, 0) / keyspace),
      cracked: cracked.reduce((a, i) => a + i, 0),
      speed: speed.reduce((a, i) => a + i, 0)
    }
  }

  reload(): void {
    this.reset()
    this.loadAll()
  }
}

