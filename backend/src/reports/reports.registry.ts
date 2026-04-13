import { Injectable, Logger } from '@nestjs/common';
import { BaseReportGenerator } from './generators/base-report.generator';

@Injectable()
export class ReportRegistry {
  private readonly logger = new Logger(ReportRegistry.name);
  private generators = new Map<string, BaseReportGenerator>();

  register(generator: BaseReportGenerator) {
    if (this.generators.has(generator.id)) {
      this.logger.warn(
        `Generator with id ${generator.id} is already registered. Overwriting.`,
      );
    }
    this.generators.set(generator.id, generator);
    this.logger.log(
      `Registered report generator: [${generator.id}] ${generator.name}`,
    );
  }

  get(id: string): BaseReportGenerator {
    const generator = this.generators.get(id);
    if (!generator) {
      throw new Error(`Report generator with id ${id} not found.`);
    }
    return generator;
  }

  getAllMetadata() {
    return Array.from(this.generators.values()).map((gen) => ({
      id: gen.id,
      name: gen.name,
      format: gen.format,
    }));
  }
}
