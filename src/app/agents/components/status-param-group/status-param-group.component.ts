import { Component, Input, OnInit } from '@angular/core';
import { StatusType } from '../agent-status-param/agent-status-param.component';


export interface statusMessage {
  status: StatusType,
  message: string
}

@Component({
  selector: 'status-param-group',
  templateUrl: './status-param-group.component.html',
})
export class StatusParamGroupComponent implements OnInit {

  @Input() okMessage!: string;
  @Input() warningMessage!: string;
  @Input() criticalMessage!: string;
  @Input() inactiveMessage = 'Agent is not active.';
  @Input() invalidMessage = 'Agent is active but not working or not providing device data.';
  @Input() unknownMessage = 'Invalid device data from agent or values being 0.'
  @Input() infoMessage = 'Note: Threshold can be configured in the config section.';

  messages: statusMessage[] = [];

  ngOnInit(): void {
    this.messages = [
      { status: 'ok', message: this.okMessage },
      { status: 'warning', message: this.warningMessage },
      { status: 'critical', message: this.criticalMessage },
      { status: 'inactive', message: this.inactiveMessage },
      { status: 'unknown', message: this.unknownMessage },
      { status: 'invalid', message: this.invalidMessage },
    ]
  }
}