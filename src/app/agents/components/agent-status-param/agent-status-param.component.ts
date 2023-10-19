import { Component, Input } from '@angular/core';

export type StatusType = 'ok' | 'warning' | 'critical' | 'inactive' | 'unknown' | 'invalid'

@Component({
  selector: 'agent-status-param',
  templateUrl: './agent-status-param.component.html',
})
export class AgentStatusParamComponent {
  @Input() status: string;

  getStatusClass(): string {
    const classMap = {
      'ok': 'text-ok',
      'warning': 'text-warning',
      'critical': 'text-critical',
      'inactive': 'text-inactive',
      'unknown': 'text-unknown',
      'invalid': 'text-invalid'
    };

    return classMap[this.status] || 'text-ok';
  }
}
