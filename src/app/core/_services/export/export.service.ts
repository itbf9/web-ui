import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import * as Papa from 'papaparse';
import { HTTableColumn } from '../../_components/ht-table/ht-table.models';
import { ExportUtil } from './export.util';
import { ExcelColumn } from './export.model';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor(private exportUtil: ExportUtil) { }

  async toExcel<T>(fileName: string, tableColumns: HTTableColumn[], rawData: T[]): Promise<void> {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sheet 1');
      const columns: ExcelColumn[] = this.exportUtil.toExcelColumns(tableColumns);

      const data = await this.exportUtil.toExcelRows(tableColumns, rawData);

      if (data && data.length) {
        worksheet.columns = columns;
        worksheet.addRows(data);

        const buffer = await workbook.xlsx.writeBuffer();
        this.saveExcelFile(buffer, fileName);
      }
    } catch (error) {
      console.error('Error during Excel export:', error);
    }
  }

  async toCsv<T>(fileName: string, tableColumns: HTTableColumn[], rawData: T[]): Promise<void> {
    try {
      const columns: string[] = this.exportUtil.toCsvColumns(tableColumns);
      const data = await this.exportUtil.toCsvRows(tableColumns, rawData);

      if (data && data.length) {
        const csv = Papa.unparse([columns, ...data]);
        this.saveCsvFile(csv, fileName);
      }
    } catch (error) {
      console.error('Error during CSV export:', error);
    }
  }

  private saveExcelFile(data: ArrayBuffer, fileName: string): void {
    this.exportUtil.download(data, `${fileName}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  }

  private saveCsvFile(data: ArrayBuffer, fileName: string): void {
    this.exportUtil.download(data, `${fileName}.csv`, 'text/csv');
  }
}
