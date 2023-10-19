import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";

import { AgentStatusComponent } from "./agent-status/agent-status.component";
import { ShowAgentsComponent } from "./show-agents/show-agents.component";
import { EditAgentComponent } from './edit-agent/edit-agent.component';
import { NewAgentComponent } from "./new-agent/new-agent.component";
import { DirectivesModule } from "../shared/directives.module";
import { ComponentsModule } from "../shared/components.module";
import { AgentsRoutingModule } from "./agents-routing.module";
import { PipesModule } from "../shared/pipes.module";
import { AgentStatusParamComponent } from './components/agent-status-param/agent-status-param.component';
import { StatusParamGroupComponent } from './components/status-param-group/status-param-group.component';
import { AgentViewComponent } from './agent-status/views/agent-view/agent-view.component';
import { RackViewComponent } from './agent-status/views/rack-view/rack-view.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { AgentStatGraphComponent } from './components/agent-stat-graph/agent-stat-graph.component';
import { CoreComponentsModule } from '../core/_components/core-components.module';


@NgModule({
  declarations: [
    AgentStatusComponent,
    ShowAgentsComponent,
    EditAgentComponent,
    NewAgentComponent,
    AgentStatusParamComponent,
    StatusParamGroupComponent,
    AgentViewComponent,
    RackViewComponent,
    AgentStatGraphComponent,
  ],
  imports: [
    ReactiveFormsModule,
    AgentsRoutingModule,
    FontAwesomeModule,
    DataTablesModule,
    DirectivesModule,
    ComponentsModule,
    CommonModule,
    RouterModule,
    FormsModule,
    PipesModule,
    NgbModule,
    CoreComponentsModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    })
  ]
})
export class AgentsModule { }
