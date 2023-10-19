import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild } from "@angular/core";
import { Subject, Subscription, forkJoin } from "rxjs";
import { GlobalService } from "../../_services/main.service";
import { SERV } from "../../_services/main.config";
import { ListResponseWrapper } from "../../_models/response";
import { Chunk } from "../../_models/chunk";
import { Router } from "@angular/router";
import { CookieStorageService } from "../../_services/storage/cookie-storage.service";
import { formatDate, formatSeconds } from "src/app/shared/utils/datetime";
import { chunkStates } from "../../_constants/chunks.config";
import { DataTableDirective } from "angular-datatables";
import { Agent } from "../../_models/agents";

@Component({
  selector: 'chunks-table',
  templateUrl: './chunks-table.component.html'
})

export class ChunksTableComponent implements AfterViewInit, OnInit, OnDestroy {

  private subscriptions: Subscription[] = []

  // Input property to specify an agent ID for filtering chunks.
  @Input() agentId: number
  // Output event to trigger a refresh action.
  @Output() refresh: EventEmitter<string> = new EventEmitter();
  // Reference to the DataTableDirective element.
  @ViewChild(DataTableDirective, { static: false }) dtElement: DataTableDirective;
  // Subject to trigger DataTable rendering.
  dtTrigger: Subject<any> = new Subject<any>()
  // Configuration options for DataTable.
  dtOptions = {};
  // Date format for rendering dates.
  dateFormat: string

  constructor(
    private gs: GlobalService,
    private renderer: Renderer2,
    private router: Router,
    private cookieStorage: CookieStorageService<string>
  ) { }

  /**
   * Unsubscribe from subscriptions and destroy the DataTable when the component is destroyed.
   */
  ngOnDestroy(): void {
    this.unsubscribeFromSubscriptions()
    this.destroyDataTable()
  }

  /**
   * Add a click event listener and trigger DataTable rendering after view initialization.
   */
  ngAfterViewInit(): void {
    this.addClickEventListeners()
    this.dtTrigger.next(void 0);
  }

  /**
   * Initialize the component, set the date format, and configure DataTable options.
   */
  ngOnInit(): void {
    this.dateFormat = this.getDateFormat()
    this.dtOptions = this.getDTOptions()
  }

  /**
   * Unsubscribe from the current DataTable subscriptions.
   */
  private unsubscribeFromSubscriptions(): void {
    this.dtTrigger.unsubscribe();
    for (const sub of this.subscriptions) {
      sub.unsubscribe();
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
      // Agent link
      if (event.target.hasAttribute("data-view-agent-id")) {
        this.router.navigate([`/agents/show-agents/${event.target.getAttribute("data-view-agent-id")}/edit`]);
      }
      return false
    });
  }

  rerender(): void {
    this.rerenderDataTable()
  }

  /**
   * Rerender the DataTable by destroying it and triggering a new rendering event.
   */
  private rerenderDataTable(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next(void 0);
    });
  }

  /**
   * Destroy the DataTable instance when no longer needed.
   */
  private destroyDataTable(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
  }

  /**
   * Get DataTable configuration options, including sorting, searching, and column settings.
   */
  getDTOptions(): any {
    const dataTableOptions = {
      //serverSide: true,
      ajax: (_data, callback, settings) => {
        this.getChunks(settings, callback);
      },
      dom: 'Bfrtip',
      scrollY: "700px",
      scrollX: true,
      lengthMenu: [
        [10, 25, 50, 100, 250, -1],
        [10, 25, 50, 100, 250, 'All']
      ],
      pageLength: 25,
      scrollCollapse: true,
      paging: false,
      destroy: true,
      buttons: {
        dom: {
          button: {
            className: 'dt-button buttons-collection btn btn-sm-dt btn-outline-gray-600-dt',
          }
        },
        buttons: [
          {
            text: '↻',
            autoClose: true,
            action: () => {
              this.rerender()
              this.refresh.emit()
            }
          },
          'colvis',
          {
            extend: 'collection',
            text: 'Export',
            buttons: [
              {
                extend: 'excelHtml5',
              },
              {
                extend: 'print',
                customize: function (win) {
                  $(win.document.body)
                    .css('font-size', '10pt')
                  $(win.document.body).find('table')
                    .addClass('compact')
                    .css('font-size', 'inherit');
                }
              },
              {
                extend: 'csvHtml5',
                exportOptions: { modifier: { selected: true } },
                select: true,
                customize: function (dt, csv) {
                  let data = "";
                  for (let i = 0; i < dt.length; i++) {
                    data = "Chunks\n\n" + dt;
                  }
                  return data;
                }
              },
              {
                extend: 'copy',
              }
            ]
          },
          {
            extend: "pageLength",
            className: "btn-sm"
          },
        ]
      },

      columns: [
        {
          title: 'ID',
          data: '_id',
        },
        {
          title: 'Start',
          data: 'skip',
        },
        {
          title: 'Length',
          data: 'length',
        },
        {
          title: 'Checkpoint',
          render: this.renderCheckpoint,
        },
        {
          title: 'Progress',
          render: this.renderProgress,
        },
        {
          title: 'Task',
          render: this.renderTask,
        },
        {
          title: 'Agent',
          render: this.renderAgent,
        },
        {
          title: 'Dispatch time',
          // Wrap render function to access this context
          render: (data, type, row) => {
            return this.renderDispatchTime(data, type, row);
          },
        },
        {
          title: 'Last activity',
          // Wrap render function to access this context
          render: (data, type, row) => {
            return this.renderLastActivity(data, type, row);
          },
        },
        {
          title: 'Time Spent',
          render: this.renderTimeSpent,
        },
        {
          title: 'State',
          render: this.renderState,
        },
        {
          title: 'Cracked',
          render: this.renderCracked,
        },
      ],
    };

    return dataTableOptions;
  }

  /**
   * Retrieves and processes chunk data from the server.
   * 
   * @param dataTablesSettings The settings for DataTables.
   * @param callback The callback function to update the DataTable.
   */
  getChunks(dataTablesSettings: any, callback: any): void {
    const agentParams = { maxResults: 999999 }
    const chunkParams = { maxResults: 1000, expand: 'task' }
    if (this.agentId) {
      chunkParams['filter'] = `agentId=${this.agentId}`;
    }

    const chunks$ = this.gs.getAll(SERV.CHUNKS, chunkParams)
    const agents$ = this.gs.getAll(SERV.AGENTS, agentParams)

    this.subscriptions.push(forkJoin([chunks$, agents$]).subscribe(([c, a]: [ListResponseWrapper<Chunk>, ListResponseWrapper<Agent>]) => {
      const assignedChunks: Chunk[] = this.agentId
        ? c.values.filter((chunk: Chunk) => chunk.agentId == this.agentId)
        : c.values

      assignedChunks.map((chunk: Chunk) => {
        chunk.agent = a.values.find((e: Agent) => e._id === chunk.agentId)

        return chunk;
      })

      callback({
        recordsTotal: assignedChunks.length,
        recordsFiltered: assignedChunks.length,
        data: assignedChunks
      })
    }))
  }

  /**
   * Retrieves the date format for rendering timestamps.
   * @todo Change to localstorage
   * @returns The date format string.
   */
  getDateFormat(): string {
    const fmt = this.cookieStorage.getItem('localtimefmt')

    return fmt ? fmt : 'dd/MM/yyyy h:mm:ss'
  }

  // --- Render functions ---


  renderCracked(_data: any, type: string, chunk: Chunk): string {
    if (type === 'display') {
      if (chunk.cracked && chunk.cracked > 0) {
        return `<a href="#" data-view-hashes-task-id="${chunk.task._id}">${chunk.cracked}</a>`
      }
    }

    return `${chunk.cracked}`
  }


  renderState(_data: any, type: string, chunk: Chunk): string {
    if (type === 'display') {
      if (chunk.state && chunk.state in chunkStates) {
        return `<span class="badge chunk-state chunk-state-${chunkStates[chunk.state].toLowerCase()}">${chunkStates[chunk.state]}</span>`
      }
    }

    return `${chunk.state}`
  }

  renderTimeSpent(_data: any, type: string, chunk: Chunk): string {
    const seconds = chunk.solveTime - chunk.dispatchTime
    if (seconds) {
      if (type === 'display') {
        return formatSeconds(seconds)
      } else {
        return `${seconds}`
      }
    }
    return '0'
  }

  renderCheckpoint(_data: any, type: string, chunk: Chunk): string {
    const percent = chunk.progress ? (((chunk.checkpoint - chunk.skip) / chunk.length) * 100).toFixed(2) : 0
    if (type === 'display') {
      return chunk.checkpoint ? `${chunk.checkpoint} (${percent}%)` : '0'
    }

    return `${percent}`
  }

  renderProgress(_data: any, type: string, chunk: Chunk): string {
    if (type === 'display') {
      if (chunk.progress === undefined) {
        return 'N/A'
      } else if (chunk.progress > 0) {
        return `${chunk.progress / 100}%`
      }
    }

    return `${chunk.progress ? chunk.progress : 0}`
  }

  renderTask(_data: any, type: string, chunk: Chunk): string {
    if (chunk.task) {
      if (type === 'display') {
        const taskName = chunk.task.taskName.length > 15
          ? chunk.task.taskName.substring(0, 15) + '...'
          : chunk.task.taskName

        return `<a href="#" data-view-task-id="${chunk.task._id}">${taskName}</a>`
      } else {
        return `${chunk.task.taskName}`
      }
    }
    return ''
  }

  renderAgent(_data: any, type: string, chunk: Chunk): string {
    if (chunk.agent) {
      if (type === 'display') {
        const agentName = chunk.agent.agentName.length > 15
          ? chunk.agent.agentName.substring(0, 15) + '...'
          : chunk.agent.agentName

        return `<a href="#" data-view-agent-id="${chunk.agent._id}">${agentName}</a>`
      } else {
        return `${chunk.agent.agentName}`
      }
    }
    return ''
  }

  renderDispatchTime(_data: any, type: string, chunk: Chunk): string {
    if (type === 'display') {
      const formattedDate = formatDate(chunk.dispatchTime, this.dateFormat)

      return formattedDate === '' ? 'N/A' : formattedDate
    }
    return `${chunk.dispatchTime}`
  }


  renderLastActivity(_data: any, type: string, chunk: Chunk): string {
    if (type === 'display') {
      if (chunk.solveTime === 0) {
        return '(No activity)'
      } else if (chunk.solveTime > 0) {
        return formatDate(chunk.solveTime, this.dateFormat)
      }
    }

    return `${chunk.solveTime}`
  }

}