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
import { HTTableComponent } from './ht-table/ht-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { ColumnSelectionDialogComponent } from './column-selection-dialog/column-selection-dialog.component';
import { ActionMenuComponent } from './menus/action-menu/action-menu.component';
import { MatSelectModule } from '@angular/material/select';
import { TasksTableComponent } from './tasks-table/tasks-table.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { BulkActionMenuComponent } from './menus/bulk-action-menu/bulk-action-menu.component';
import { RowActionMenuComponent } from './menus/row-action-menu/row-action-menu.component';
import { BaseMenuComponent } from './menus/base-menu/base-menu.component';
import { TableDialogComponent } from './table-dialog/table-dialog.component';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule } from '@angular/material/snack-bar';
import { BaseTableComponent } from './base-table/base-table.component';
import { ExportMenuComponent } from './menus/export-menu/export-menu.component';



@NgModule({
  declarations: [
    ChunksTableComponent,
    AgentsTableComponent,
    TableDialogComponent,
    TasksTableComponent,
    BaseTableComponent,
    HTTableComponent,
    BaseMenuComponent,
    ActionMenuComponent,
    ExportMenuComponent,
    RowActionMenuComponent,
    BulkActionMenuComponent,
    ColumnSelectionDialogComponent,
  ],
  imports: [
    ReactiveFormsModule,
    FontAwesomeModule,
    DataTablesModule,
    DirectivesModule,
    CommonModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatIconModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatDialogModule,
    MatTooltipModule,
    MatDividerModule,
    RouterModule,
    FormsModule,
    PipesModule,
    NgbModule,
  ],
  exports: [
    ChunksTableComponent,
    AgentsTableComponent,
    TasksTableComponent,
    BaseTableComponent,
    HTTableComponent,
    ColumnSelectionDialogComponent,
    BaseMenuComponent,
    ActionMenuComponent,
    ExportMenuComponent,
    RowActionMenuComponent,
    BulkActionMenuComponent,
  ],
  providers: [
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 2500 } }
  ]
})
export class CoreComponentsModule { }
