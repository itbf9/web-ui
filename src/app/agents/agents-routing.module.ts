import { CheckPerm } from "../core/_guards/permission.guard";
import { IsAuth } from "../core/_guards/auth.guard";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from '@angular/router';
import { AgentStatusComponent } from "./agent-status/agent-status.component";
import { ShowAgentsComponent } from "./show-agents/show-agents.component";
import { EditAgentComponent } from "./edit-agent/edit-agent.component";
import { NewAgentComponent } from "./new-agent/new-agent.component";
import { agentResolver } from "../core/_resolvers/agent.resolver";

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'agent-status', component: AgentStatusComponent,
        data: {
          kind: 'agent-status',
          breadcrumb: 'Agent Status',
          permission: 'Agent' //ToDo this one has Agent read and Agent Stats read
        },
        canActivate: [IsAuth, CheckPerm]
      },
      {
        path: 'new-agent', component: NewAgentComponent,
        data: {
          kind: 'new-agent',
          breadcrumb: 'New Agent',
          permission: 'Agent'
        },
        canActivate: [IsAuth, CheckPerm]
      },
      {
        path: 'show-agents', component: ShowAgentsComponent,
        data: {
          kind: 'show-agents',
          breadcrumb: 'Show Agent',
          permission: 'Agent'
        },
        canActivate: [IsAuth, CheckPerm]
      },
      {
        path: 'show-agents/:id/edit', component: EditAgentComponent,
        data: {
          kind: 'edit-agent',
          breadcrumb: 'Edit Agent',
          permission: 'Agent'
        },
        resolve: { agent: agentResolver },
        canActivate: [IsAuth, CheckPerm]
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]

})
export class AgentsRoutingModule { }
