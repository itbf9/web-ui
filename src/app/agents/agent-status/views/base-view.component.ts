import { Component, Input, OnInit } from '@angular/core';
import { faDigitalTachograph, faMicrochip, faTemperature0 } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ASC } from 'src/app/core/_constants/agentsc.config';
import { Agent } from 'src/app/core/_models/agents';
import { UIConfigService } from 'src/app/core/_services/shared/storage.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'agent-status-base-view',
  template: '',
})
export class AgentStatusBaseViewComponent implements OnInit {
  @Input() agents: Agent[];
  @Input() agentStats!: any;

  statusOrderByName = environment.config.agents.statusOrderByName;
  statusOrderBy = environment.config.agents.statusOrderBy;

  // Agents Stats
  statDevice: any[] = [];
  statTemp: any[] = [];
  statCpu: any[] = [];

  faDigitalTachograph = faDigitalTachograph;
  faTemperature0 = faTemperature0;
  faMicrochip = faMicrochip;

  constructor(private modalService: NgbModal, private uiService: UIConfigService) {

  }

  /**
   * Initializes the component by filtering agent statistics data and setting
   * the agent timeout value.
   */
  ngOnInit(): void {
    if (this.agentStats) {
      const tempDateFilter = this.agentStats.values.filter(u => u.time > 10000000); // Temp
      // const tempDateFilter = stats.values.filter(u=> u.time > this.gettime()); // Temp
      this.statTemp = tempDateFilter.filter(u => u.statType == ASC.GPU_TEMP); // Temp
      this.statDevice = tempDateFilter.filter(u => u.statType == ASC.GPU_UTIL); // Temp
      this.statCpu = tempDateFilter.filter(u => u.statType == ASC.CPU_UTIL); // Temp

      // this.statTemp = stats.values.filter(u=> u.statType == ASC.GPU_TEMP); // filter Device Temperature
      // this.statDevice = stats.values.filter(u=> u.statType == ASC.GPU_UTIL); // filter Device Utilization
      // this.statCpu = stats.values.filter(u=> u.statType == ASC.CPU_UTIL); // filter CPU utilization
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  open(content: any): boolean {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' })

    return false
  }

  // Getters for UI configuration settings.

  get tempThreshold1(): number {
    return this.uiService.getUIsettings('agentTempThreshold1').value;
  }

  get tempThreshold2(): number {
    return this.uiService.getUIsettings('agentTempThreshold2').value;
  }

  get utilThreshold1(): number {
    return this.uiService.getUIsettings('agentUtilThreshold1').value;
  }

  get utilThreshold2(): number {
    return this.uiService.getUIsettings('agentUtilThreshold2').value;
  }

  get agentTimeout(): number {
    return this.uiService.getUIsettings('agenttimeout').value
  }

  /**
   * Determines the CSS class based on temperature value, activity status, and last activity time.
   * 
   * @param value - The temperature value or string 'No data'.
   * @param isActive - The activity status (1 for active, 0 for inactive).
   * @param lastActivity - The timestamp of the last activity.
   * 
   * @returns The CSS class for styling the temperature status.
   */
  getTempClass(value: number | string, isActive: number, lastActivity: number): string {
    if (value === 'No data') {
      if ((isActive == 1) && (Date.now() - lastActivity < this.agentTimeout)) {
        return 'text-unknown';
      }
      return 'text-inactive';
    }

    if (typeof value === 'string') {
      const numericArg = parseFloat(value);
      if (!isNaN(numericArg)) {
        value = numericArg;
      } else {
        return 'text-inactive';
      }
    }

    if (value > this.tempThreshold2) {
      return 'text-critical'
    } else if (value >= this.tempThreshold1) {
      return 'text-warning'
    } else {
      return 'text-ok'
    }
  }

  /**
   * Determines the CSS class based on utilization value, activity status, and last activity time.
   * 
   * @param value - The utilization value or string 'No data'.
   * @param isActive - The activity status (1 for active, 0 for inactive).
   * @param lastActivity - The timestamp of the last activity.
   * 
   * @returns The CSS class for styling the utilization status.
   */
  getUtilClass(value: number | string, isActive: number, lastActivity: number): string {
    if (value === 'No data') {
      if ((isActive == 1) && (Date.now() - lastActivity < this.agentTimeout)) {
        return 'text-unknown';
      }
      return 'text-inactive';
    }

    if (typeof value === 'string') {
      const numericArg = parseFloat(value);
      if (!isNaN(numericArg)) {
        value = numericArg;
      } else {
        return 'text-inactive';
      }
    }

    if (value >= this.utilThreshold1) {
      return 'text-ok'
    } else if (value >= this.utilThreshold2) {
      return 'text-warning'
    } else {
      return 'text-critical'
    }
  }
}
