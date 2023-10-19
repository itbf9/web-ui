import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild } from "@angular/core";
import { Subject, Subscription, forkJoin } from "rxjs";
import { GlobalService } from "../../_services/main.service";
import { SERV } from "../../_services/main.config";
import { ListResponseWrapper } from "../../_models/response";
import { Chunk } from "../../_models/chunk";
import { Task } from "../../_models/task";
import { Router } from "@angular/router";
import { CookieStorageService } from "../../_services/storage/cookie-storage.service";
import { formatDate, formatSeconds } from "src/app/shared/utils/datetime";
import { chunkStates } from "../../_constants/chunks.config";
import { DataTableDirective } from "angular-datatables";
import { Agent } from "../../_models/agents";
import { User } from "../../_models/user.model";

@Component({
  selector: 'agents-table',
  templateUrl: './agents-table.component.html'
})

export class AgentsTableComponent implements AfterViewInit, OnInit, OnDestroy {

  private subscriptions: Subscription[] = []

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
        this.getAgents(settings, callback);
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
      stateSave: true,
      select: {
        style: 'multi',
      },
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
                    data = "Agents\n\n" + dt;
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
          title: 'Status',
          render: this.renderStatus,
        },
        {
          title: 'Name',
          render: this.renderName,
        },
        {
          title: 'Owner',
          render: this.renderOwner,
        },
        {
          title: 'Client',
          render: this.renderClient,
        },
        {
          title: 'GPUs/CPUs',
          data: 'devices',
        },
        {
          title: 'Info',
          render: this.renderInfo,
        },
        {
          title: 'Last activity',
          // Wrap render function to access this context
          render: (data, type, row) => {
            return this.renderLastActivity(data, type, row);
          },
        },
        {
          title: 'Access Group',
          render: this.renderAccessGroup,
        },
        {
          title: 'Actions',
          render: this.renderActions,
        },
      ],
    };

    return dataTableOptions;
  }

  /**
   * Retrieves and processes agent data from the server.
   * 
   * @param dataTablesSettings The settings for DataTables.
   * @param callback The callback function to update the DataTable.
   */
  getAgents(dataTablesSettings: any, callback: any): void {
    const agentParams = { maxResults: 999999, expand: 'accessGroups' }
    const userParams = { maxResults: 999999 }

    const agents$ = this.gs.getAll(SERV.AGENTS, agentParams)
    const users$ = this.gs.getAll(SERV.USERS, userParams)

    this.subscriptions.push(forkJoin([agents$, users$]).subscribe(([a, u]: [ListResponseWrapper<Agent>, ListResponseWrapper<User>]) => {
      const agents: Agent[] = a.values
      const users: User[] = u.values

      agents.map((agent: Agent) => {
        agent.user = users.find((e: User) => e._id === agent.userId)

        return agent;
      })

      callback({
        recordsTotal: agents.length,
        recordsFiltered: agents.length,
        data: agents
      })
    }));
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


  renderName(_data: any, type: string, agent: Agent): string {
    if (type === 'display') {
      const agentName = agent.agentName?.length > 40
        ? `${agent.agentName.substring(40)}...`
        : agent.agentName
      const isTrusted = agent.isTrusted
        ? '<span><fa-icon icon="faLock" aria-hidden="true" ngbTooltip="Trust agent with secret data" /></span>'
        : ''

      return `<a href="#" data-view-agent-id="${agent._id}">${agentName}</a>${isTrusted}`
    }

    return agent.agentName;
  }

  renderStatus(_data: any, type: string, agent: Agent): string {
    if (type === 'display') {
      if (agent.isActive) {
        return '<span class="badge status-active">Active</span>'
      } else {
        return '<span class="badge status-inactive">Inactive</span>'
      }
    }

    return `${agent.isActive}`
  }

  renderActions(_data: any, type: string, agent: Agent): string {
    if (type === 'display') {
      return ''
    }

    return ''
  }

  renderAccessGroup(_data: any, type: string, agent: Agent): string {
    const links: string[] = []

    if (type === 'display') {
      for (const group of agent.accessGroups) {
        links.push(`<a href="#" data-view-access-group-id="${group.accessGroupId}">${group.groupName}</a>`)
        if (agent.accessGroups.length > 1) {
          links.push('<hr />')
        }
      }

      return links.join('\n')
    }

    return ''
  }

  renderOwner(_data: any, type: string, agent: Agent): string {
    if (agent.user) {
      if (type === 'display') {
        return `<a href="#" data-view-user-id="${agent.user._id}">${agent.user.name}</a>`
      }

      return `${agent.user._id}`
    }
    return ''
  }

  renderClient(_data: any, type: string, agent: Agent): string {
    if (type === 'display') {
      if (agent.clientSignature) {
        return agent.clientSignature
      }
    }

    return ''
  }


  renderInfo(_data: any, type: string, agent: Agent): string {
    return ''
  }


  renderLastActivity(_data: any, type: string, agent: Agent): string {
    if (type === 'display') {
      const formattedDate = formatDate(agent.lastTime, this.dateFormat)
      return `<code>${agent.lastAct}</code> at<br>${formattedDate}<br>IP:<code>${agent.lastIp}</code>`
    }

    return `${agent.lastTime}`
  }

}