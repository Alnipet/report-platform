import { Test, TestingModule } from '@nestjs/testing';
import { ReportRegistry } from './reports.registry';
import { BaseReportGenerator } from './generators/base-report.generator';

class MockReportGenerator extends BaseReportGenerator {
  id = 'mock-report';
  name = 'Mock Report';
  format = 'csv';

  generate(): Promise<Buffer> {
    return Promise.resolve(Buffer.from('mock data'));
  }
}

describe('ReportRegistry', () => {
  let registry: ReportRegistry;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportRegistry],
    }).compile();

    registry = module.get<ReportRegistry>(ReportRegistry);
  });

  it('should be defined', () => {
    expect(registry).toBeDefined();
  });

  describe('register', () => {
    it('should register a generator successfully', () => {
      const mockGenerator = new MockReportGenerator();
      registry.register(mockGenerator);

      expect(registry.get('mock-report')).toBe(mockGenerator);
    });

    it('should overwrite when registering duplicate generator', () => {
      const generator1 = new MockReportGenerator();
      const generator2 = new MockReportGenerator();
      generator2.name = 'Updated Mock Report';

      registry.register(generator1);
      registry.register(generator2);

      expect(registry.get('mock-report').name).toBe('Updated Mock Report');
    });
  });

  describe('get', () => {
    it('should return registered generator', () => {
      const mockGenerator = new MockReportGenerator();
      registry.register(mockGenerator);

      const result = registry.get('mock-report');
      expect(result).toBe(mockGenerator);
    });

    it('should throw error when generator not found', () => {
      expect(() => registry.get('non-existent')).toThrow(
        'Report generator with id non-existent not found.',
      );
    });
  });

  describe('getAllMetadata', () => {
    it('should return empty array when no generators registered', () => {
      expect(registry.getAllMetadata()).toEqual([]);
    });

    it('should return metadata for all registered generators', () => {
      const generator1 = new MockReportGenerator();
      const generator2 = new (class extends BaseReportGenerator {
        id = 'another-report';
        name = 'Another Report';
        format = 'pdf';
        generate(): Promise<Buffer> {
          return Promise.resolve(Buffer.from(''));
        }
      })();

      registry.register(generator1);
      registry.register(generator2);

      const metadata = registry.getAllMetadata();
      expect(metadata).toHaveLength(2);
      expect(metadata).toContainEqual({
        id: 'mock-report',
        name: 'Mock Report',
        format: 'csv',
      });
      expect(metadata).toContainEqual({
        id: 'another-report',
        name: 'Another Report',
        format: 'pdf',
      });
    });
  });
});
