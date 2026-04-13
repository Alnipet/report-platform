import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportRegistry } from './reports.registry';
import { ReportStatus } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';

@Processor('reports')
export class ReportsProcessor extends WorkerHost {
  private readonly logger = new Logger(ReportsProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: ReportRegistry,
  ) {
    super();
  }

  async process(job: Job<{ runId: string }>): Promise<void> {
    const { runId } = job.data;
    this.logger.log(`Processing job for runId: ${runId}`);

    try {
      const run = await this.prisma.reportRun.update({
        where: { id: runId },
        data: { status: ReportStatus.PROCESSING },
      });

      const generator = this.registry.get(run.reportId);

      const fileBuffer = await generator.generate({
        runId,
        reportId: run.reportId,
        params: run.params,
      });

      const reportsDir = path.join(process.cwd(), '..', 'tmp', 'reports');
      await fs.mkdir(reportsDir, { recursive: true });
      const fileName = `${run.reportId}_${runId}.${generator.format}`;
      const filePath = path.join(reportsDir, fileName);

      await fs.writeFile(filePath, fileBuffer);

      await this.prisma.reportRun.update({
        where: { id: runId },
        data: {
          status: ReportStatus.COMPLETED,
          fileUrl: fileName,
        },
      });

      this.logger.log(`Job completed for runId: ${runId}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed job ${runId}: ${errorMessage}`);
      await this.prisma.reportRun.update({
        where: { id: runId },
        data: {
          status: ReportStatus.FAILED,
          error: errorMessage,
        },
      });
      throw error;
    }
  }
}
