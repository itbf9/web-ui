import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActionMenuEvent, ActionMenuItem } from '../../../_models/action-menu.model';

@Component({
  selector: 'base-menu',
  template: ''
})
export class BaseMenuComponent {

  @Input() disabled = false;
  @Input() data: any;

  @Output() menuItemClicked: EventEmitter<ActionMenuEvent<any>> = new EventEmitter<ActionMenuEvent<any>>();


  actionMenuItems: ActionMenuItem[][] = [];

  /**
   * Check if the data row is of type "Agent."
   * @returns `true` if the data row is an agent; otherwise, `false`.
   */
  protected isAgent(): boolean {
    try {
      return this.data['_id'] === this.data['agentId'];
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if the data row is of type "Task."
   * @returns `true` if the data row is a task; otherwise, `false`.
   */
  protected isTask(): boolean {
    try {
      return this.data['_id'] === this.data['taskId'];
    } catch (error) {
      return false;
    }
  }

  onMenuItemClick(event: ActionMenuEvent<any>): void {
    this.menuItemClicked.emit(event);
  }

}
