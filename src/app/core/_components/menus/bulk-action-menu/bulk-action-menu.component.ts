import { Component, Input, OnInit, } from '@angular/core';
import { BaseMenuComponent } from '../base-menu/base-menu.component';
import { BulkActionMenuAction, BulkActionMenuLabel } from './bulk-action-menu.constants';
import { DataType } from '../../ht-table/ht-table.models';

@Component({
  selector: 'bulk-action-menu',
  templateUrl: './bulk-action-menu.component.html'
})
export class BulkActionMenuComponent extends BaseMenuComponent implements OnInit {

  @Input() dataType: DataType

  ngOnInit(): void {
    if (this.dataType === 'agents') {
      this.getAgentMenu();
    } else if (this.dataType === 'tasks') {
      this.getTaskMenu();
    }
  }

  private getTaskMenu(): void {
    this.actionMenuItems[0] = [
      {
        label: BulkActionMenuLabel.ARCHIVE_TASKS,
        action: BulkActionMenuAction.ARCHIVE,
        icon: 'archive',
      }
    ];

    this.actionMenuItems[1] = [
      {
        label: BulkActionMenuLabel.DELETE_TASKS,
        action: BulkActionMenuAction.DELETE,
        icon: 'delete',
        red: true
      }
    ];
  }

  private getAgentMenu(): void {
    this.actionMenuItems[0] = [
      {
        label: BulkActionMenuLabel.ACTIVATE_AGENTS,
        action: BulkActionMenuAction.ACTIVATE,
        icon: 'radio_button_checked',
      },
      {
        label: BulkActionMenuLabel.DEACTIVATE_AGENTS,
        action: BulkActionMenuAction.DEACTIVATE,
        icon: 'radio_button_unchecked',
      }
    ];

    this.actionMenuItems[1] = [
      {
        label: BulkActionMenuLabel.DELETE_AGENTS,
        action: BulkActionMenuAction.DELETE,
        icon: 'delete',
        red: true
      }
    ];
  }


}