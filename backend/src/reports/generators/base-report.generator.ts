import { Logger } from '@nestjs/common';

import { Prisma } from '@prisma/client';

export interface ReportContext {
  runId: string;
  reportId: string;
  params: Prisma.JsonValue | null;
}

/**
 * Базовый класс для всех генераторов отчетов.
 * Обеспечивает единый интерфейс (DX) для создания новых отчетов в команде.
 */
export abstract class BaseReportGenerator {
  protected readonly logger = new Logger(this.constructor.name);

  // Каждый отчет должен предоставить свои метаданные
  abstract get id(): string;
  abstract get name(): string;
  abstract get format(): string; // 'xlsx' | 'pdf' | 'csv' | etc.

  /**
   * Главный метод генерации, который будет вызван Воркером.
   * Должен вернуть Buffer или Stream с содержимым файла.
   * @param context контекст выполнения (id запуска, параметры)
   */
  abstract generate(context: ReportContext): Promise<Buffer>;
}
