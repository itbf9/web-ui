import { Component, Input, OnInit } from '@angular/core';
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  MarkPointComponent,
} from 'echarts/components';
import { LineChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { EChartsOption, SeriesOption } from 'echarts';
import { AgentStats } from 'src/app/core/_models/agents';
import { ASC } from 'src/app/core/_constants/agentsc.config';
import { UIConfigService } from 'src/app/core/_services/shared/storage.service';
import { toISOString } from 'src/app/shared/utils/datetime';

@Component({
  selector: 'agent-stat-graph',
  templateUrl: './agent-stat-graph.component.html',
})
export class AgentStatGraphComponent implements OnInit {
  @Input() data: AgentStats[];
  @Input() saveAsName: string;

  statType: number;
  chartOptions: EChartsOption = {};
  valueSuffix = '';
  seriesData: SeriesOption[] = [];
  labels: string[] = [];
  xAxis: number[] = [];

  constructor(private uiService: UIConfigService) { }

  ngOnInit(): void {
    if (this.data.length) {
      this.initializeChart();
      this.setupECharts();

      this.statType = this.getStatType();
      this.valueSuffix = this.determineValueSuffix();
      this.chartOptions = this.getChartOptions();
    }
  }

  /**
   * Set up ECharts components and features.
   */
  private setupECharts() {
    echarts.use([
      TitleComponent,
      ToolboxComponent,
      TooltipComponent,
      GridComponent,
      LegendComponent,
      MarkLineComponent,
      MarkPointComponent,
      LineChart,
      CanvasRenderer,
      UniversalTransition,
    ]);
  }

  /**
   * Get the statistic type from the first data object.
   *
   * @returns {number} - The statistic type.
   */
  private getStatType(): number {
    return this.data[0].statType;
  }

  /**
   * Determine the value suffix based on the statistic type and threshold.
   *
   * @returns {string} - The value suffix (e.g., '°C', '%').
   */
  private determineValueSuffix(): string {
    switch (this.statType) {
      case ASC.GPU_TEMP:
        return this.tempThreshold2 > 100 ? '°F' : '°C';
      case ASC.GPU_UTIL:
      case ASC.CPU_UTIL:
        return '%';
      default:
        return '';
    }
  }

  /**
   * Get the chart options for ECharts.
   *
   * @returns {EChartsOption} - The ECharts chart options.
   */
  private getChartOptions(): EChartsOption {
    return {
      tooltip: {
        position: 'top',
      },
      legend: {
        data: this.labels,
      },
      toolbox: this.getToolboxOptions(),
      useUTC: true,
      xAxis: this.getXAxisOptions(),
      yAxis: this.getYAxisOptions(),
      series: this.seriesData,
    };
  }

  /**
   * Get the toolbox options for ECharts.
   *
   * @returns {EChartsOption['toolbox']} - The ECharts toolbox options.
   */
  private getToolboxOptions(): EChartsOption['toolbox'] {
    return {
      show: true,
      feature: {
        dataZoom: {
          yAxisIndex: 'none',
        },
        dataView: { readOnly: false },
        restore: {},
        saveAsImage: {
          name: this.saveAsName,
        },
      },
    };
  }

  /**
   * Get the xAxis options for ECharts.
   *
   * @returns {EChartsOption['xAxis']} - The ECharts xAxis options.
   */
  private getXAxisOptions(): EChartsOption['xAxis'] {
    return {
      data: this.xAxis.map((item: number) => toISOString(item)),
    };
  }

  /**
   * Get the yAxis options for ECharts.
   *
   * @returns {EChartsOption['yAxis']} - The ECharts yAxis options.
   */
  private getYAxisOptions(): EChartsOption['yAxis'] {
    return {
      type: 'value',
      axisLabel: {
        formatter: `{value} ${this.valueSuffix}`,
      },
    };
  }

  /**
   * Initialize the chart by grouping data, setting labels, and defining series data.
   */
  private initializeChart(): void {
    const { max, deviceLabels, grouped } = this.groupData();

    this.labels = [...new Set(deviceLabels)];

    const startDate = Math.max(...max);
    this.xAxis = this.generateIntervalsOf(1, +startDate - 500, +startDate);

    for (let i = 0; i < grouped.length; i++) {
      this.seriesData.push({
        name: `Device ${i + 1}`,
        type: 'line',
        data: grouped[i],
        markLine: {
          data: [{ type: 'average', name: 'Avg' }],
          symbol: ['none', 'none'],
        },
      });
    }
  }

  /**
   * Group data from AgentStats into separate series based on device and timestamps.
   *
   * @returns {{ max: number[]; deviceLabels: string[]; grouped: any[][] }}
   * An object containing grouped data, maximum timestamps, and device labels.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private groupData(): { max: number[]; deviceLabels: string[]; grouped: any[][] } {
    const max = [];
    const deviceLabels = [];
    const grouped = [];

    for (let i = 0; i < this.data.length; i++) {
      const stat: AgentStats = this.data[i];

      for (let i = 0; i < stat.value.length; i++) {
        grouped[i] = grouped[i] || [];
        grouped[i].push({ time: stat.time, value: stat.value });

        max.push(stat.time);
        deviceLabels.push(`Device ${i + 1}`);
      }
    }

    return { max, deviceLabels, grouped };
  }

  /**
   * Get the value of the 'agentTempThreshold2' from UI settings.
   *
   * @returns {number} - The agent temperature threshold.
   */
  private get tempThreshold2(): number {
    return this.uiService.getUIsettings('agentTempThreshold2').value;
  }

  private generateIntervalsOf(interval: number, start: number, end: number): number[] {
    const result = [];
    let current = start;

    while (current < end) {
      result.push(current);
      current += interval;
    }

    return result;
  }
}
