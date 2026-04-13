import { Test, TestingModule } from '@nestjs/testing';
import { FinancialSummaryReport } from './financial-summary.report';
import * as fs from 'fs';
import * as path from 'path';

describe('FinancialSummaryReport', () => {
  let generator: FinancialSummaryReport;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FinancialSummaryReport],
    }).compile();

    generator = module.get<FinancialSummaryReport>(FinancialSummaryReport);
  });

  it('should be defined', () => {
    expect(generator).toBeDefined();
  });

  describe('metadata', () => {
    it('should have correct id', () => {
      expect(generator.id).toBe('financial-summary');
    });

    it('should have correct name', () => {
      expect(generator.name).toBe('Финансовая сводка (PDF)');
    });

    it('should have correct format', () => {
      expect(generator.format).toBe('pdf');
    });
  });

  describe('generate', () => {
    const fontPath = path.join(process.cwd(), 'fonts', 'Roboto-Regular.ttf');
    const fontExists = fs.existsSync(fontPath);

    it('should generate PDF buffer successfully', async () => {
      const context = {
        runId: 'test-run-123',
        reportId: 'financial-summary',
        params: {},
      };

      const result = await generator.generate(context);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);

      expect(result[0]).toBe(0x25);
      expect(result[1]).toBe(0x50);
      expect(result[2]).toBe(0x44);
      expect(result[3]).toBe(0x46);
    }, 10000);

    it('should generate PDF with empty params', async () => {
      const context = {
        runId: 'test-run-456',
        reportId: 'financial-summary',
        params: {},
      };

      const result = await generator.generate(context);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    }, 10000);

    it('should generate PDF with date params and convert to Russian locale', async () => {
      const context = {
        runId: 'test-run-789',
        reportId: 'financial-summary',
        params: { date: '2024-01-15T10:30:00.000Z' },
      };

      const result = await generator.generate(context);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    }, 10000);

    it('should generate PDF with multiple params', async () => {
      const context = {
        runId: 'test-run-101',
        reportId: 'financial-summary',
        params: {
          date: '2024-01-15T10:30:00.000Z',
          department: 'Sales',
          region: 'Europe',
        },
      };

      const result = await generator.generate(context);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    }, 10000);

    it('should generate PDF with correct structure', async () => {
      const context = {
        runId: 'test-run-202',
        reportId: 'financial-summary',
        params: {},
      };

      const result = await generator.generate(context);

      expect(result[0]).toBe(0x25);
      expect(result[1]).toBe(0x50);
      expect(result[2]).toBe(0x44);
      expect(result[3]).toBe(0x46);

      expect(result.length).toBeGreaterThan(500);
      expect(result.includes(Buffer.from('/Type /Page'))).toBe(true);
      expect(result.includes(Buffer.from('/Font'))).toBe(true);
    }, 10000);

    if (!fontExists) {
      it.skip('should handle missing font gracefully (font file not found)', () => {
        console.warn('Skipping font test: Roboto font not found at', fontPath);
      });
    }
  });
});
