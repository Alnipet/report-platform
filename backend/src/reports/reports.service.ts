import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { ReportRegistry } from './reports.registry';
import { ReportStatus, Prisma } from '@prisma/client';
import * as path from 'path';

@Injectable()
export class ReportsService {
  constructor(
    @InjectQueue('reports') private reportsQueue: Queue,
    private prisma: PrismaService,
    private registry: ReportRegistry,
  ) {}

  getAvailableReports() {
    return this.registry.getAllMetadata();
  }

  async requestReport(reportId: string, params: Prisma.InputJsonValue) {
    this.registry.get(reportId);

    const run = await this.prisma.reportRun.create({
      data: {
        reportId,
        params,
        status: ReportStatus.PENDING,
      },
    });

    await this.reportsQueue.add('generate', {
      runId: run.id,
    });

    return { runId: run.id, status: ReportStatus.PENDING };
  }

  async getRunStatus(runId: string) {
    const run = await this.prisma.reportRun.findUnique({
      where: { id: runId },
    });
    if (!run) throw new NotFoundException('Run not found');
    return run;
  }

  async getAllRuns() {
    return this.prisma.reportRun.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  getFilePath(fileName: string): string {
    return path.join(process.cwd(), '..', 'tmp', 'reports', fileName);
  }
}
