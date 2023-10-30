import { AfterViewInit, Component, OnDestroy, OnInit, Renderer2 } from "@angular/core";
import { HTTableColumn, HTTableIcon } from "../ht-table/ht-table.models";
import { TasksDataSource } from "../../_datasources/tasks.datasource";
import { SafeHtml } from "@angular/platform-browser";
import { Cacheable } from "../../_decorators/cacheable";
import { Task } from "../../_models/task";
import { ChunkData } from "../../_models/chunk";
import { ActionMenuEvent } from "../../_models/action-menu.model";
import { RowActionMenuAction } from "../menus/row-action-menu/row-action-menu.constants";
import { TaskTableColumnLabel } from "./tasks-table.constants";
import { DialogData } from "../table-dialog/table-dialog.model";
import { TableDialogComponent } from "../table-dialog/table-dialog.component";
import { catchError, forkJoin } from "rxjs";
import { SERV } from "../../_services/main.config";
import { BulkActionMenuAction } from "../menus/bulk-action-menu/bulk-action-menu.constants";
import { BaseTableComponent } from "../base-table/base-table.component";


@Component({
  selector: 'tasks-table',
  templateUrl: './tasks-table.component.html'
})

export class TasksTableComponent extends BaseTableComponent implements AfterViewInit, OnInit, OnDestroy {

  tableColumns: HTTableColumn[] = []
  dataSource: TasksDataSource
  chunkData: { [key: number]: ChunkData } = {}

  /**
   * Add a click event listener and trigger DataTable rendering after view initialization.
   */
  ngAfterViewInit(): void {
    this.addClickEventListeners()
  }

  ngOnInit(): void {
    //this.dateFormat = this.getDateFormat()
    this.tableColumns = this.getColumns()
    this.dataSource = new TasksDataSource(this.gs, this.uiService);
    this.dataSource.setColumns(this.tableColumns);
    this.dataSource.loadAll();
  }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      sub.unsubscribe()
    }
  }

  /**
   * Add a click event listener to handle navigation when a link is clicked.
   */
  private addClickEventListeners(): void {
    this.renderer.listen('document', 'click', (event) => {
      // Task link
      if (event.target.hasAttribute("data-view-task-id")) {
        this.router.navigate([`/tasks/show-tasks/${event.target.getAttribute("data-view-task-id")}/edit`]);
      }
      // Hashlist link
      if (event.target.hasAttribute("data-view-hashes-task-id")) {
        this.router.navigate([`/hashlists/hashes/tasks/${event.target.getAttribute("data-view-hashes-task-id")}`]);
      }
      // Task link
      if (event.target.hasAttribute("data-view-task-id")) {
        this.router.navigate([`/tasks/show-tasks/${event.target.getAttribute("data-view-task-id")}/edit`]);
      }
      return false
    });
  }

  filter(item: Task, filterValue: string): boolean {
    /*
    if (item.taskName.toLowerCase().includes(filterValue) ||
      item.clientSignature.toLowerCase().includes(filterValue) ||
      item.devices.toLowerCase().includes(filterValue)) {
      return true
    }
*/
    return false;
  }

  getColumns(): HTTableColumn[] {
    const tableColumns = [
      {
        name: TaskTableColumnLabel.ID,
        dataKey: '_id',
        render: (task: Task) => this.renderId(task),
        isSortable: true,
      },
      {
        name: TaskTableColumnLabel.NAME,
        dataKey: 'taskName',
        render: (task: Task) => this.renderName(task),
        isSortable: true,
      },
      {
        name: TaskTableColumnLabel.STATUS,
        dataKey: 'keyspaceProgress',
        icons: (task: Task) => this.renderStatusIcons(task),
        isSortable: false,
      },
      {
        name: TaskTableColumnLabel.ATTACK_CMD,
        dataKey: 'attackCmd',
        isSortable: true,
      },
      {
        name: TaskTableColumnLabel.IS_SMALL,
        dataKey: 'isSmall',
        icons: (task: Task) => this.renderBoolIcon(task, 'isSmall'),
        isSortable: true,
      },
      {
        name: TaskTableColumnLabel.IS_CPU_TASK,
        dataKey: 'isCpuTask',
        icons: (task: Task) => this.renderBoolIcon(task, 'isCpuTask'),
        isSortable: true,
      },
      {
        name: TaskTableColumnLabel.TASK_TYPE_1,
        dataKey: 'taskType',
        icons: (task: Task) => this.renderBoolIcon(task, 'taskType', 1),
        isSortable: true,
      },
      {
        name: TaskTableColumnLabel.PREPROCESSOR,
        dataKey: 'preprocessorId',
        render: (task: Task) => this.sanitize(task.taskType === 0 && task.preprocessorId === 1 ? 'Prince' : '-'),
        isSortable: true,
      },
      {
        name: TaskTableColumnLabel.HASHLISTS,
        dataKey: 'userId',
        render: (task: Task) => this.renderHashlists(task),
        icons: (task: Task) => this.renderHashlistIcons(task),
        isSortable: false,
      },
      {
        name: TaskTableColumnLabel.DISPATCHED_SEARCHED,
        dataKey: 'clientSignature',
        async: (task: Task) => this.renderDispatchedSearched(task),
        isSortable: true,
      },
      {
        name: TaskTableColumnLabel.CRACKED,
        dataKey: 'cracked',
        async: (task: Task) => this.renderCracked(task),
        isSortable: true,
      },
      {
        name: TaskTableColumnLabel.AGENTS,
        dataKey: '_id',
        render: (task: Task) => this.renderAgents(task),
        isSortable: false,
      },
      {
        name: TaskTableColumnLabel.SPEED,
        dataKey: '_id',
        async: (task: Task) => this.renderSpeed(task),
        isSortable: false,
      },
      {
        name: TaskTableColumnLabel.PRIORITY,
        dataKey: 'priority',
        isSortable: true,
      },
      {
        name: TaskTableColumnLabel.MAX_AGENTS,
        dataKey: 'maxAgents',
        render: (task: Task) => task.taskType === 0 ? task.maxAgents : '-',
        isSortable: true,
      }
    ]

    return tableColumns
  }

  rowActionClicked(event: ActionMenuEvent<Task>): void {
    switch (event.menuItem.action) {
      case RowActionMenuAction.EDIT:
        this.rowActionEdit(event.data);
        break;
      case RowActionMenuAction.COPY_TO_TASK:
        this.rowActionCopyToTask(event.data)
        break;
      case RowActionMenuAction.COPY_TO_PRETASK:
        this.rowActionCopyToPretask(event.data)
        break;
      case RowActionMenuAction.EDIT_SUBTASKS:
        console.log('edit-subtasks', event.data)
        break;
      case RowActionMenuAction.ARCHIVE:
        this.rowActionArchive(event.data)
        break;
      case RowActionMenuAction.DELETE:
        this.openDialog({
          rows: [event.data],
          title: `Deleting ${event.data.taskName} ...`,
          icon: 'warning',
          body: `Are you sure you want to delete ${event.data.taskName}? Note that this action cannot be undone.`,
          warn: true,
          action: event.menuItem.action
        })
        break;
    }
  }


  bulkActionClicked(event: ActionMenuEvent<Task[]>): void {
    switch (event.menuItem.action) {
      case BulkActionMenuAction.ARCHIVE:
        this.openDialog({
          rows: event.data,
          title: `Archiving ${event.data.length} tasks ...`,
          icon: 'info',
          listAttribute: 'taskName',
          action: event.menuItem.action
        })
        break;
      case BulkActionMenuAction.DELETE:
        this.openDialog({
          rows: event.data,
          title: `Deleting ${event.data.length} tasks ...`,
          icon: 'warning',
          body: `Are you sure you want to permanently delete the selected tasks? Note that this action cannot be undone.`,
          warn: true,
          listAttribute: 'taskName',
          action: event.menuItem.action
        })
        break;
    }
  }

  openDialog(data: DialogData<Task>) {
    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: data,
      width: '450px',
    });

    this.subscriptions.push(dialogRef.afterClosed().subscribe(result => {
      if (result && result.action) {
        switch (result.action) {
          case RowActionMenuAction.DELETE:
            this.rowActionDelete(result.data);
            break;
          case BulkActionMenuAction.DELETE:
            this.bulkActionDelete(result.data);
            break;
        }
      }
    }));
  }



  // --- Render functions ---

  @Cacheable(['_id', 'assignedAgents'])
  renderAgents(task: Task): SafeHtml {
    let html = '-'
    if (task.taskType === 0 && task.assignedAgents) {
      html = `${task.assignedAgents.length}`
    }

    return this.sanitize(html)
  }

  @Cacheable(['_id', 'assignedAgents'])
  async renderSpeed(task: Task): Promise<SafeHtml> {
    let html = '-'
    if (task.taskType === 0 && task.assignedAgents) {
      if (!(task._id in this.chunkData)) {
        this.chunkData[task._id] = await this.dataSource.getChunkData(task.taskId, task.keyspace);
      }
      html = `${this.chunkData[task._id].speed} H/s`
    }

    return this.sanitize(html)
  }

  @Cacheable(['_id', 'taskType', 'keyspace'])
  async renderDispatchedSearched(task: Task): Promise<SafeHtml> {
    let html = '-'
    if (task.taskType === 0 && task.keyspace > 0) {
      if (!(task._id in this.chunkData)) {
        this.chunkData[task._id] = await this.dataSource.getChunkData(task.taskId, task.keyspace);
      }
      html = `${this.chunkData[task._id].dispatched} / ${this.chunkData[task._id].searched}`
    }

    return this.sanitize(html)
  }

  @Cacheable(['_id', 'taskType', 'keyspace'])
  async renderCracked(task: Task): Promise<SafeHtml> {
    let html = '-'
    if (task.taskType === 0) {
      if (!(task._id in this.chunkData)) {
        this.chunkData[task._id] = await this.dataSource.getChunkData(task.taskId, task.keyspace);
      }
      html = `<a href="#" data-view-cracked-id="${task._id}">${this.chunkData[task._id].cracked}</a>`
    }

    return this.sanitize(html)
  }

  @Cacheable(['_id', 'taskType'])
  renderId(task: Task): SafeHtml {
    let html = `${task._id}`
    if (task.taskType === 0) {
      html = `<span class="pill" style="background-color: ${task.color ? task.color : '#cccccc'}">${task._id}</span>`
    } else if (task.taskType === 1) {
      html = `<span class="pill">${task.taskWrapperId}</span>`
    }

    return this.sanitize(html)
  }

  @Cacheable(['_id', 'hashlists'])
  async renderHashlistIcons(task: Task): Promise<HTTableIcon[]> {
    const icons: HTTableIcon[] = []

    if (task.taskType === 0) {
      if (task.hashlist?.length) {
        const hl = task.hashlist[0]
        if (hl.hashCount === hl.cracked) {
          icons.push({
            name: 'check_circle',
            cls: 'text-ok',
            tooltip: 'Cracked'
          })
        }
        if (hl.isSecret === true) {
          icons.push({
            name: 'lock',
            cls: 'text-primary',
            tooltip: 'Secret'
          })
        }
      }
    }

    return icons
  }

  @Cacheable(['_id', 'hashlist'])
  renderHashlists(task: Task): SafeHtml {
    let html = '-'

    if (task.hashlist?.length) {
      const hl = task.hashlist[0]
      const taskListName = hl.name.length > 40
        ? `${hl.name.substring(40)}...`
        : hl.name

      html = `<a href="#" title="${hl.name}" data-show-hashlist-id="${task.hashlist[0].hashlistId}">${taskListName}</a>`
    }
    return this.sanitize(html)
  }

  @Cacheable(['_id', 'preprocessorId'])
  renderPreprocessor(task: Task): SafeHtml {
    return this.sanitize(task.preprocessorId === 1 ? 'Prince' : '')
  }

  @Cacheable(['_id', 'taskType', 'taskName'])
  renderName(task: Task): SafeHtml {
    let html = ''
    if (task.taskType === 0) {
      const taskName = task.taskName?.length > 40
        ? `${task.taskName.substring(40)}...`
        : task.taskName

      html = `<a href="#" data-show-task-id="${task.taskId}">${taskName}</a>`
    } else if (task.taskType === 1) {
      const taskWrapperName = task.taskWrapperName?.length > 40
        ? `${task.taskWrapperName.substring(40)}...`
        : task.taskWrapperName

      html = taskWrapperName
    }

    return this.sanitize(html)
  }

  @Cacheable(['_id', 'taskType', 'keyspaceProgress', 'keyspace'])
  async renderStatusIcons(task: Task): Promise<HTTableIcon[]> {
    const icons: HTTableIcon[] = []

    if (task.taskType === 0) {
      if (!(task._id in this.chunkData)) {
        this.chunkData[task._id] = await this.dataSource.getChunkData(task.taskId, task.keyspace);
      }
      const speed = this.chunkData[task._id].speed;
      if (speed > 0) {
        icons.push({
          name: 'cached',
          tooltip: 'In Progress'
        })
      } else if (task.keyspaceProgress >= task.keyspace && task.keyspaceProgress > 0) {
        icons.push({
          name: 'check',
          tooltip: 'Completed'
        })
      } else {
        icons.push({
          name: 'remove',
          tooltip: 'Idle'
        })
      }
    }

    return icons
  }

  @Cacheable(['_id', 'isSmall', 'isCpuTask', 'taskType'])
  async renderBoolIcon(task: Task, key: string, equals: any = ''): Promise<HTTableIcon[]> {
    const icons: HTTableIcon[] = []
    if (task.taskType === 0) {
      if (equals === '') {
        if (task[key] === true) {
          icons.push({
            name: 'check',
            cls: 'text-ok'
          })
        }
      } else if (task[key] === equals) {
        icons.push({
          name: 'check',
          cls: 'text-ok'
        })
      }
    }

    return icons
  }


  // --- Action functions ---


  private rowActionEdit(task: Task): void {
    this.router.navigate(['tasks', 'show-tasks', task._id, 'edit']);
  }

  private bulkActionDelete(tasks: Task[]): void {
    const requests = tasks.map((task: Task) => {
      return this.gs.delete(SERV.TASKS, task._id)
    });

    this.subscriptions.push(forkJoin(requests)
      .pipe(
        catchError((error) => {
          console.error('Error during deletion:', error);
          return [];
        })
      )
      .subscribe((results) => {
        this.snackBar.open(`Successfully deleted ${results.length} tasks!`, 'Close');
        this.dataSource.reload()
      }));
  }

  private rowActionDelete(task: Task): void {
    this.subscriptions.push(this.gs.delete(SERV.TASKS, task._id).subscribe(() => {
      this.snackBar.open('Successfully deleted task!', 'Close');
      this.dataSource.reload()
    }));
  }

  private rowActionCopyToTask(task: Task): void {
    this.router.navigate(['tasks', 'new-tasks', task._id, 'copy']);
  }

  private rowActionCopyToPretask(task: Task): void {
    this.router.navigate(['tasks', 'preconfigured-tasks', task._id, 'copytask']);
  }

  private rowActionArchive(task: Task): void {
    this.subscriptions.push(this.gs.archive(SERV.TASKS, task._id).subscribe(() => {
      this.snackBar.open('Successfully archived task!', 'Close');
      this.dataSource.reload()
    }));
  }

}