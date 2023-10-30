import { ChangeDetectionStrategy, Component, Input, OnInit } from "@angular/core";
import { Chunk } from "../../_models/chunk";
import { formatDate, formatSeconds } from "src/app/shared/utils/datetime";
import { chunkStates } from "../../_constants/chunks.config";
import { HTTableColumn } from "../ht-table/ht-table.models";
import { ChunksDataSource } from "../../_datasources/chunks.datasource";
import { SafeHtml } from '@angular/platform-browser';
import { Cacheable } from "../../_decorators/cacheable";
import { ChunksTableColumnLabel } from "./chunks-table.constants";
import { BaseTableComponent } from "../base-table/base-table.component";

@Component({
  selector: 'chunks-table',
  templateUrl: './chunks-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ChunksTableComponent extends BaseTableComponent implements OnInit {

  // Input property to specify an agent ID for filtering chunks.
  @Input() agentId: number

  tableColumns: HTTableColumn[] = []
  dataSource: ChunksDataSource;

  ngOnInit(): void {
    this.tableColumns = this.getColumns()
    this.dataSource = new ChunksDataSource(this.gs, this.uiService);
    this.dataSource.setColumns(this.tableColumns);
    this.dataSource.loadAll();
  }

  getColumns(): HTTableColumn[] {
    const tableColumns = [
      {
        name: ChunksTableColumnLabel.ID,
        dataKey: '_id',
        isSortable: true
      },
      {
        name: ChunksTableColumnLabel.START,
        dataKey: 'skip',
        isSortable: true
      },
      {
        name: ChunksTableColumnLabel.LENGTH,
        dataKey: 'length',
        isSortable: true
      },
      {
        name: ChunksTableColumnLabel.CHECKPOINT,
        dataKey: 'checkpoint',
        render: (chunk: Chunk) => this.renderCheckpoint(chunk),
        isSortable: true
      },
      {
        name: ChunksTableColumnLabel.PROGRESS,
        dataKey: 'progress',
        render: (chunk: Chunk) => this.renderProgress(chunk),
        isSortable: true
      },
      {
        name: ChunksTableColumnLabel.TASK,
        dataKey: 'taskId',
        render: (chunk: Chunk) => this.renderTask(chunk),
        routerLink: (chunk: Chunk) => ['/tasks', 'show-tasks', chunk.taskId, 'edit'],
        isSortable: true,
      },
      {
        name: ChunksTableColumnLabel.AGENT,
        dataKey: 'agentId',
        render: (chunk: Chunk) => this.renderAgent(chunk),
        routerLink: (chunk: Chunk) => ['/agents', 'show-agents', chunk.agentId, 'edit'],
        isSortable: true
      },
      {
        name: ChunksTableColumnLabel.DISPATCH_TIME,
        dataKey: 'dispatchTime',
        render: (chunk: Chunk) => this.renderDispatchTime(chunk),
        isSortable: true
      },
      {
        name: ChunksTableColumnLabel.LAST_ACTIVITY,
        dataKey: 'solveTime',
        render: (chunk: Chunk) => this.renderLastActivity(chunk),
        isSortable: true
      },
      {
        name: ChunksTableColumnLabel.TIME_SPENT,
        dataKey: 'timeSpent',
        render: (chunk: Chunk) => this.renderTimeSpent(chunk),
        isSortable: true
      },
      {
        name: ChunksTableColumnLabel.STATE,
        dataKey: 'state',
        render: (chunk: Chunk) => this.renderState(chunk),
        isSortable: true
      },
      {
        name: ChunksTableColumnLabel.CRACKED,
        dataKey: 'cracked',
        routerLink: (chunk: Chunk) => ['/hashlists', 'hashes', 'tasks', chunk.taskId],
        isSortable: true
      },
    ];

    return tableColumns;
  }


  // --- Render functions ---

  @Cacheable(['_id', 'cracked'])
  renderCracked(chunk: Chunk): SafeHtml {
    let html = `${chunk.cracked}`
    if (chunk.cracked && chunk.cracked > 0) {
      html = `<a data-view-hashes-task-id="${chunk.task._id}">${chunk.cracked}</a>`
    }

    return this.sanitize(html)
  }

  @Cacheable(['_id', 'state'])
  renderState(chunk: Chunk): SafeHtml {
    let html = `${chunk.state}`
    if (chunk.state && chunk.state in chunkStates) {
      html = `<span class="pill pill-${chunkStates[chunk.state].toLowerCase()}">${chunkStates[chunk.state]}</span>`
    }

    return this.sanitize(html)
  }

  @Cacheable(['_id', 'solveTime', 'dispatchTime'])
  renderTimeSpent(chunk: Chunk): SafeHtml {
    const seconds = chunk.solveTime - chunk.dispatchTime
    if (seconds) {
      return this.sanitize(formatSeconds(seconds))
    }

    return this.sanitize('0')
  }

  @Cacheable(['_id', 'progress', 'checkpoint', 'skip', 'length'])
  renderCheckpoint(chunk: Chunk): SafeHtml {
    const percent = chunk.progress ? (((chunk.checkpoint - chunk.skip) / chunk.length) * 100).toFixed(2) : 0
    const data = chunk.checkpoint ? `${chunk.checkpoint} (${percent}%)` : '0'

    return this.sanitize(data)
  }

  @Cacheable(['_id', 'progress'])
  renderProgress(chunk: Chunk): SafeHtml {
    if (chunk.progress === undefined) {
      return this.sanitize('N/A')
    } else if (chunk.progress > 0) {
      return this.sanitize(`${chunk.progress / 100}%`)
    }


    return `${chunk.progress ? chunk.progress : 0}`
  }

  @Cacheable(['_id', 'taskId'])
  renderTask(chunk: Chunk): SafeHtml {
    if (chunk.task) {
      return this.sanitize(chunk.task.taskName)
    }

    return this.sanitize(`${chunk.taskId}`)
  }

  @Cacheable(['_id', 'agentId'])
  renderAgent(chunk: Chunk): SafeHtml {
    if (chunk.agent) {
      return this.sanitize(chunk.agent.agentName)
    }

    return `${chunk.agentId}`
  }

  @Cacheable(['_id', 'dispatchTime'])
  renderDispatchTime(chunk: Chunk): SafeHtml {
    const formattedDate = formatDate(chunk.dispatchTime, this.dateFormat)

    return this.sanitize(formattedDate === '' ? 'N/A' : formattedDate)
  }

  @Cacheable(['_id', 'solveTime'])
  renderLastActivity(chunk: Chunk): SafeHtml {
    if (chunk.solveTime === 0) {
      return '(No activity)'
    } else if (chunk.solveTime > 0) {
      return this.sanitize(formatDate(chunk.solveTime, this.dateFormat))
    }

    return this.sanitize(`${chunk.solveTime}`)
  }

}