import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

import { Prisma } from '@prisma/client';
import { RequestReportDto } from './dto/request-report.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('definitions')
  getDefinitions() {
    return this.reportsService.getAvailableReports();
  }

  @Post('request')
  async requestReport(@Body() body: RequestReportDto) {
    return this.reportsService.requestReport(
      body.reportId,
      (body.params || {}) as Prisma.InputJsonValue,
    );
  }

  @Get('runs')
  getAllRuns() {
    return this.reportsService.getAllRuns();
  }

  @Get('runs/:id')
  getRunStatus(@Param('id') id: string) {
    return this.reportsService.getRunStatus(id);
  }

  @Get('download/:fileName')
  downloadReport(@Param('fileName') fileName: string, @Res() res: Response) {
    const sanitizedFileName = path.basename(fileName);
    if (sanitizedFileName !== fileName) {
      throw new BadRequestException('Invalid file name');
    }

    const filePath = this.reportsService.getFilePath(sanitizedFileName);
    if (!fs.existsSync(filePath)) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: 'File not found' });
    }
    return res.download(filePath);
  }
}
