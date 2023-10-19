import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";

import { ChunksTableComponent } from './chunks-table/chunks-table.component';
import { DirectivesModule } from 'src/app/shared/directives.module';
import { PipesModule } from 'src/app/shared/pipes.module';
import { AgentsTableComponent } from './agents-table/agents-table.component';


@NgModule({
  declarations: [
    ChunksTableComponent,
    AgentsTableComponent,
  ],
  imports: [
    ReactiveFormsModule,
    FontAwesomeModule,
    DataTablesModule,
    DirectivesModule,
    CommonModule,
    RouterModule,
    FormsModule,
    PipesModule,
    NgbModule,
  ],
  exports: [
    ChunksTableComponent,
    AgentsTableComponent,
  ]
})
export class CoreComponentsModule { }
