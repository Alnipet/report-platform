import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportsProcessor } from './reports.processor';
import { ReportRegistry } from './reports.registry';
import { UserActivityReport } from './generators/user-activity.report';
import { FinancialSummaryReport } from './generators/financial-summary.report';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'reports',
    }),
  ],
  controllers: [ReportsController],
  providers: [
    ReportsService,
    ReportsProcessor,
    ReportRegistry,
    UserActivityReport,
    FinancialSummaryReport,
  ],
})
export class ReportsModule implements OnModuleInit {
  constructor(
    private registry: ReportRegistry,
    private userActivity: UserActivityReport,
    private financialSummary: FinancialSummaryReport,
  ) {}

  onModuleInit() {
    this.registry.register(this.userActivity);
    this.registry.register(this.financialSummary);
  }
}
