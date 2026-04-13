import { Injectable } from '@nestjs/common';
import { BaseReportGenerator, ReportContext } from './base-report.generator';
import PDFDocument from 'pdfkit';
import * as path from 'path';

@Injectable()
export class FinancialSummaryReport extends BaseReportGenerator {
  id = 'financial-summary';
  name = 'Финансовая сводка (PDF)';
  format = 'pdf';

  async generate(context: ReportContext): Promise<Buffer> {
    this.logger.log(
      `Generating Financial Summary report for run ${context.runId}`,
    );

    // Эмуляция внешнего API
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const mockRevenue = '$1,200,000';
    const mockExpenses = '$800,000';
    const mockProfit = '$400,000';

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const fontPath = path.join(
          process.cwd(),
          'fonts',
          'Roboto-Regular.ttf',
        );
        doc.font(fontPath);
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) =>
          reject(err instanceof Error ? err : new Error(String(err))),
        );

        doc.fontSize(24).text('Финансовая сводка', { align: 'center' });
        doc.moveDown(2);

        doc.fontSize(12).text('Параметры запуска:');
        const params = (context.params as Record<string, string>) || {};
        if (Object.keys(params).length === 0) {
          doc.fontSize(10).text('Нет параметров', { indent: 10 });
        } else {
          for (const [key, value] of Object.entries(params)) {
            let displayValue = value;
            let displayKey = key;
            if (key === 'date') {
              displayValue = new Date(value).toLocaleString('ru-RU');
              displayKey = 'Дата';
            }
            doc
              .fontSize(10)
              .text(`• ${displayKey}: ${displayValue}`, { indent: 10 });
          }
        }
        doc.moveDown(2);

        doc
          .fontSize(14)
          .text(`Выручка: ${mockRevenue} (Прирост 15%)`, { align: 'left' });
        doc.moveDown();
        doc.text(`Расходы: ${mockExpenses}`, { align: 'left' });
        doc.moveDown();
        doc
          .fontSize(18)
          .text(`Чистая прибыль: ${mockProfit}`, { align: 'left' });

        doc.end();
      } catch (e) {
        reject(e instanceof Error ? e : new Error(String(e)));
      }
    });
  }
}
