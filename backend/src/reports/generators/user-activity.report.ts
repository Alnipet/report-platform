import { Injectable } from '@nestjs/common';
import { BaseReportGenerator, ReportContext } from './base-report.generator';
import * as ExcelJS from 'exceljs';

@Injectable()
export class UserActivityReport extends BaseReportGenerator {
  id = 'user-activity';
  name = 'Активность пользователей (Excel)';
  format = 'xlsx';

  async generate(context: ReportContext): Promise<Buffer> {
    this.logger.log(`Generating User Activity report for run ${context.runId}`);

    // Эмуляция задержки и получения данных из внутренней БД
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockData = [
      { id: 1, name: 'Alice', logins: 42, active: true },
      { id: 2, name: 'Bob', logins: 13, active: false },
      { id: 3, name: 'Charlie', logins: 88, active: true },
    ];

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Activity');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Имя', key: 'name', width: 32 },
      { header: 'Логины', key: 'logins', width: 15 },
      { header: 'Активен', key: 'active', width: 10 },
    ];

    mockData.forEach((row) => {
      sheet.addRow(row);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer as ArrayBuffer);
  }
}
