import { faDigitalTachograph, faMicrochip, faHomeAlt, faPlus, faUserSecret, faEye, faTemperature0, faInfoCircle, faServer, faUsers, faChevronDown, faLock, faPauseCircle } from '@fortawesome/free-solid-svg-icons';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject, Subscription } from 'rxjs';
import { UIConfigService } from 'src/app/core/_services/shared/storage.service';
import { FilterService } from 'src/app/core/_services/shared/filter.service';
import { GlobalService } from 'src/app/core/_services/main.service';
import { environment } from 'src/environments/environment';
import { SERV } from '../../core/_services/main.config';
import { AutoTitleService } from 'src/app/core/_services/shared/autotitle.service';
import { LocalStorageService } from 'src/app/core/_services/storage/local-storage.service';
import { Agent } from 'src/app/core/_models/agents';



export interface AgentStatusSettings {
  viewMode: boolean
}

@Component({
  selector: 'app-agent-status',
  templateUrl: './agent-status.component.html'
})
export class AgentStatusComponent implements OnInit, OnDestroy {

  private subsciptions: Subscription[] = []
  private maxResults = environment.config.prodApiMaxResults;

  static readonly STORAGE_KEY = 'agent-status'

  rackView!: boolean // TODO: verkar inte sparas vid toggle

  faDigitalTachograph = faDigitalTachograph;
  faTemperature0 = faTemperature0;
  faPauseCircle = faPauseCircle;
  faChevronDown = faChevronDown;
  faInfoCircle = faInfoCircle;
  faUserSecret = faUserSecret;
  faMicrochip = faMicrochip;
  faHomeAlt = faHomeAlt;
  faServer = faServer;
  faUsers = faUsers;
  faPlus = faPlus;
  faLock = faLock;
  faEye = faEye;

  statusOrderByName = environment.config.agents.statusOrderByName;
  statusOrderBy = environment.config.agents.statusOrderBy;

  showagents: Agent[] = [];
  _filteresAgents: Agent[] = [];
  filterText = '';


  agentStats: any;

  totalRecords = 0;
  pageSize = 20;

  // Agents Stats
  statDevice: any[] = [];
  statTemp: any[] = [];
  statCpu: any[] = [];

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: any = {};

  constructor(
    private offcanvasService: NgbOffcanvas,
    private filterService: FilterService,
    private uiService: UIConfigService,
    private modalService: NgbModal,
    private gs: GlobalService,
    private localStorage: LocalStorageService<AgentStatusSettings>,
    titleService: AutoTitleService
  ) {
    titleService.set(['Agent Status']);
  }

  ngOnInit(): void {
    this.rackView = this.getView();
    this.getAgentsPage(1);
    this.getAgentStats();
    this.setupTable();
  }

  ngOnDestroy(): void {
    for (const sub of this.subsciptions) {
      sub.unsubscribe()

    }
    this.dtTrigger.unsubscribe();
  }

  toggleRackView(): void {
    this.localStorage.setItem(AgentStatusComponent.STORAGE_KEY, { viewMode: this.rackView }, 31557600000);
    this.getAgentsPage(1);
    this.getAgentStats();
    this.setupTable();
  }

  getView(): boolean {
    const agentSettings: AgentStatusSettings = this.localStorage.getItem(AgentStatusComponent.STORAGE_KEY);
    if (agentSettings) {
      return agentSettings.viewMode
    }

    return false
  }

  displayAgentView(): boolean {
    return !!(!this.rackView && this.agentStats && this.filteredAgents)
  }

  displayRackView(): boolean {
    return !!(this.rackView && this.agentStats && this.filteredAgents)
  }

  get filteredAgents() {
    return this._filteresAgents;
  }

  set filteredAgents(value: any[]) {
    this._filteresAgents = value;
  }

  setupTable(): void {
    const self = this;
    this.dtOptions = {
      dom: 'Bfrtip',
      scrollX: true,
      pageLength: 25,
      lengthMenu: [
        [10, 25, 50, 100, 250, -1],
        [10, 25, 50, 100, 250, 'All']
      ],
      scrollY: true,
      bDestroy: true,
      columnDefs: [
        {
          targets: 0,
          className: 'noVis'
        }
      ],
      order: [[0, 'desc']],
      bStateSave: true,
      select: {
        style: 'multi',
      },
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
            action: function (e, dt, node, config) {
              self.onRefresh();
            }
          },
          {
            extend: 'collection',
            text: 'Export',
            buttons: [
              {
                extend: 'excelHtml5',
                exportOptions: {
                  columns: [0, 1, 2, 3, 4]
                },
              },
              {
                extend: 'print',
                exportOptions: {
                  columns: [0, 1, 2, 3, 4]
                },
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
                    data = "Agent Status\n\n" + dt;
                  }
                  return data;
                }
              },
              'copy'
            ]
          },
          {
            extend: 'colvis',
            text: 'Column View',
            columns: [1, 2, 3, 4],
          },
          {
            extend: "pageLength",
            className: "btn-sm"
          },
        ],
      }
    }
  }

  onRefresh() {
    this.rerender();
    this.getAgentsPage(1);
    this.getAgentStats();
    this.setupTable();
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      setTimeout(() => {
        if (this.dtTrigger['new']) {
          this.dtTrigger['new'].next();
        }
      });
    });
  }

  pageChanged(page: number) {
    this.getAgentsPage(page);
  }

  getAgentsPage(page: number) {
    const params = { 'maxResults': this.maxResults };
    this.gs.getAll(SERV.AGENTS, params).subscribe((a: any) => {
      this.gs.getAll(SERV.AGENT_ASSIGN, params).subscribe((assign: any) => {
        this.gs.getAll(SERV.TASKS, params).subscribe((t: any) => {
          this.gs.getAll(SERV.CHUNKS, params).subscribe((c: any) => {

            const getAData = a.values.map(mainObject => {
              const matchObjectTask = assign.values.find(e => e.agentId === mainObject.agentId)
              return { ...mainObject, ...matchObjectTask }
            })
            this.totalRecords = a.total;
            const jointasks = getAData.map(mainObject => {
              const matchObjectTask = t.values.find(e => e.taskId === mainObject.taskId)
              return { ...mainObject, ...matchObjectTask }
            })

            this.showagents = this.filteredAgents = jointasks.map(mainObject => {
              const matchObjectAgents = c.values.find(e => e.agentId === mainObject.agentId)
              return { ...mainObject, ...matchObjectAgents }
            })

            this.dtTrigger.next(void 0);
          })
        })
      });
    });
  }

  getAgentStats() {
    // const paramsstat = {'maxResults': this.maxResults, 'filter': 'time>'+this.gettime()+''}; //Waiting for API date filters
    const paramsstat = { 'maxResults': this.maxResults };
    this.gs.getAll(SERV.AGENTS_STATS, paramsstat).subscribe((stats: any) => {
      this.agentStats = stats
    });
  }

  gettime() {
    const time = (Date.now() - this.uiService.getUIsettings('agenttimeout').value)
    return time;
  }

  filterChanged(data: string) {
    if (data && this.showagents) {
      data = data.toUpperCase();
      const props = ['agentName', 'agentId'];
      this._filteresAgents = this.filterService.filter<any>(this.showagents, data, props);
    } else {
      this._filteresAgents = this.showagents;
    }
  }


  openEnd(content: TemplateRef<any>) {
    this.offcanvasService.open(content, { position: 'end' });
  }
}
