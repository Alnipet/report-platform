import { Test, TestingModule } from '@nestjs/testing';
import { UserActivityReport } from './user-activity.report';

describe('UserActivityReport', () => {
  let generator: UserActivityReport;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserActivityReport],
    }).compile();

    generator = module.get<UserActivityReport>(UserActivityReport);
  });

  it('should be defined', () => {
    expect(generator).toBeDefined();
  });

  describe('metadata', () => {
    it('should have correct id', () => {
      expect(generator.id).toBe('user-activity');
    });

    it('should have correct name', () => {
      expect(generator.name).toBe('Активность пользователей (Excel)');
    });

    it('should have correct format', () => {
      expect(generator.format).toBe('xlsx');
    });
  });

  describe('generate', () => {
    it('should generate Excel buffer successfully', async () => {
      const context = {
        runId: 'test-run-123',
        reportId: 'user-activity',
        params: {},
      };

      const result = await generator.generate(context);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    }, 10000);
  });
});
