/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectionStrategy, AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { HTTableColumn } from './ht-table.models';
import { BaseDataSource } from '../../_datasources/base.datasource';
import { MatDialog } from '@angular/material/dialog';
import { ColumnSelectionDialogComponent } from '../column-selection-dialog/column-selection-dialog.component';
import { MatMenuTrigger } from '@angular/material/menu';

/**
 * The `HTTableComponent` is a custom table component that allows you to display tabular data with
 * features like sorting, filtering, and row selection. It provides flexibility in selecting columns
 * to display and handling various table actions.
 *
 * Usage:
 * ```
 * <ht-table
 *   [dataSource]="myDataSource"
 *   [isPageable]="true"
 *   [isSortable]="true"
 *   [isSelectable]="true"
 *   [isFilterable]="true"
 *   [tableColumns]="myTableColumns"
 *   [hasRowAction]="true"
 *   [paginationSizes]="[5, 10, 15]"
 *   [defaultPageSize]="10"
 *   [filterFn]="customFilterFunction">
 * </ht-table>
 *
 * ```
 *
 * - `[dataSource]`: An instance of a data source that extends `BaseDataSource`.
 * - `[isPageable]`: Set to `true` to enable pagination.
 * - `[isSortable]`: Set to `true` to enable column sorting.
 * - `[isSelectable]`: Set to `true` to enable row selection with checkboxes.
 * - `[isFilterable]`: Set to `true` to enable filtering.
 * - `[tableColumns]`: An array of `HTTableColumn` configurations for defining columns.
 * - `[hasRowAction]`: Set to `true` to enable custom row actions.
 * - `[paginationSizes]`: An array of available page sizes.
 * - `[defaultPageSize]`: The default page size for pagination.
 * - `[filterFn]`: A custom filter function for advanced filtering.
 *
 * @see `BaseDataSource` for creating a data source.
 * @see `HTTableColumn` for defining column configurations.
 *
 */
@Component({
  selector: 'ht-table',
  templateUrl: './ht-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HTTableComponent implements OnInit, AfterViewInit {

  @ViewChild('menu') menu: MatMenuTrigger;

  /** The list of column names to be displayed in the table. */
  displayedColumns: string[];

  /** The list of all available column names. */
  columnNames: string[];

  /** Reference to MatPaginator for pagination support. */
  @ViewChild(MatPaginator, { static: false }) matPaginator: MatPaginator;

  /** Reference to MatSort for sorting support. */
  @ViewChild(MatSort, { static: true }) matSort: MatSort;

  /** Function used to filter table data. */
  @Input() filterFn: (item: any, filterValue: string) => boolean

  /** The data source for the table. */
  @Input() dataSource: BaseDataSource<any>;

  /** Flag to enable or disable pagination. */
  @Input() isPageable = false;

  /** Flag to enable or disable sorting. */
  @Input() isSortable = false;

  /** Flag to enable or disable selectable rows. */
  @Input() isSelectable = false;

  /** Flag to enable or disable filtering. */
  @Input() isFilterable = false;

  /** The list of table columns and their configurations. */
  @Input() tableColumns: HTTableColumn[] = [];

  /** Flag to enable row action menu */
  @Input() hasRowAction = false;

  /** Pagination sizes to choose from. */
  @Input() paginationSizes: number[] = [3, 25, 50, 100, 250];

  /** Default page size for pagination. */
  @Input() defaultPageSize = this.paginationSizes[1];


  constructor(public dialog: MatDialog, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.columnNames = this.tableColumns.map((tableColumn: HTTableColumn) => tableColumn.name);
    this.setDisplayedColumns(this.columnNames)
  }

  ngAfterViewInit(): void {
    // Configure paginator and sorting
    this.dataSource.paginator = this.matPaginator;
    this.dataSource.sort = this.matSort;
    this.dataSource.pageSize = this.defaultPageSize;
    this.matSort.sortChange.subscribe(() => {
      this.dataSource.sortData();
    });
  }

  /**
   * Opens a dialog for selecting table columns to display.
   */
  openColumnSelectionDialog(): void {
    const dialogRef = this.dialog.open(ColumnSelectionDialogComponent, {
      width: '400px',
      data: {
        availableColumns: this.columnNames,
        selectedColumns: this.displayedColumns
      }
    });

    dialogRef.afterClosed().subscribe((selectedColumns: string[]) => {
      if (selectedColumns) {
        this.setDisplayedColumns(selectedColumns)
        this.cd.detectChanges();
      }
    });
  }

  /**
   * Sets the displayed columns based on user selection.
   *
   * @param columnNames - The list of column names to display.
   */
  setDisplayedColumns(columnNames: string[]): void {
    if (this.hasRowAction) {
      // Add action menu if enabled
      this.displayedColumns = [...columnNames, 'rowAction'];
    } else {
      this.displayedColumns = columnNames;
    }

    if (this.isSelectable) {
      // Add checkbox if enabled
      this.displayedColumns = ['select', ...this.displayedColumns];
    }

  }

  /**
   * Applies a filter to the table based on user input.
   */
  applyFilter() {
    if (this.filterFn) {
      this.dataSource.filterData(this.filterFn)
    }
  }

  /**
   * Checks if a row is selected.
   *
   * @param row - The row to check.
   */
  isSelected(row: any): boolean {
    return this.dataSource.isSelected(row);
  }

  /**
   * Checks if all rows are selected.
   */
  isAllSelected(): boolean {
    return this.dataSource.isAllSelected();
  }

  /**
   * Toggles selection for all rows.
   */
  toggleAll(): void {
    this.dataSource.toggleAll();
  }

  /**
   * Checks if there are selected rows.
   */
  hasSelected(): boolean {
    return this.dataSource.hasSelected()
  }

  /**
   * Checks if the selection state is indeterminate.
   */
  indeterminate(): boolean {
    return this.dataSource.indeterminate();
  }

  /**
   * Toggles selection for a specific row.
   *
   * @param row - The row to toggle.
   */
  toggleSelect(row: any): void {
    if (this.isSelectable) {
      this.dataSource.toggleRow(row);
    }
  }

  /**
   * Reloads the data in the table.
   */
  reload(): void {
    this.dataSource.reload()
  }

  /**
   * Handles the page change event, including changes in page size and page index.
   *
   * @param event - The `PageEvent` object containing information about the new page configuration.
   */
  onPageChange(event: PageEvent): void {
    this.dataSource.setPaginationConfig(event.pageSize, event.pageIndex, this.dataSource.totalItems);
    this.dataSource.reload();
  }
}