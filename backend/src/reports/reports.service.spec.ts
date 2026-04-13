import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { ReportRegistry } from './reports.registry';
import { PrismaService } from '../prisma/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';
import { ReportStatus } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { BaseReportGenerator } from './generators/base-report.generator';

describe('ReportsService', () => {
  let service: ReportsService;

  const mockGenerator: BaseReportGenerator = {
    id: 'test-report',
    name: 'Test Report',
    format: 'xlsx',
    logger: {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
      fatal: jest.fn(),
      setLogLevels: jest.fn(),
    },
    generate: jest.fn().mockResolvedValue(Buffer.from('test data')),
  } as unknown as BaseReportGenerator;

  const mockPrismaService = {
    reportRun: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockQueue = {
    add: jest.fn(),
  };

  const mockRegistry = {
    get: jest.fn(),
    getAllMetadata: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: getQueueToken('reports'),
          useValue: mockQueue,
        },
        {
          provide: ReportRegistry,
          useValue: mockRegistry,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAvailableReports', () => {
    it('should return all registered reports metadata', () => {
      const expectedMetadata = [
        { id: 'test-report', name: 'Test Report', format: 'xlsx' },
      ];
      mockRegistry.getAllMetadata.mockReturnValue(expectedMetadata);

      const result = service.getAvailableReports();

      expect(result).toEqual(expectedMetadata);
      expect(mockRegistry.getAllMetadata).toHaveBeenCalledTimes(1);
    });
  });

  describe('requestReport', () => {
    const reportId = 'test-report';
    const params = { date: '2024-01-01' };
    const createdRun = {
      id: 'run-123',
      reportId,
      status: ReportStatus.PENDING,
      params,
    };

    it('should create report run and add job to queue', async () => {
      mockRegistry.get.mockReturnValue(mockGenerator);
      mockPrismaService.reportRun.create.mockResolvedValue(createdRun);
      mockQueue.add.mockResolvedValue({ id: 'job-123' });

      const result = await service.requestReport(reportId, params);

      expect(mockRegistry.get).toHaveBeenCalledWith(reportId);
      expect(mockPrismaService.reportRun.create).toHaveBeenCalledWith({
        data: {
          reportId,
          params,
          status: ReportStatus.PENDING,
        },
      });
      expect(mockQueue.add).toHaveBeenCalledWith('generate', {
        runId: createdRun.id,
      });
      expect(result).toEqual({
        runId: createdRun.id,
        status: ReportStatus.PENDING,
      });
    });

    it('should throw error when report generator not found', async () => {
      mockRegistry.get.mockImplementation(() => {
        throw new Error('Report generator with id invalid-report not found.');
      });

      await expect(service.requestReport('invalid-report', {})).rejects.toThrow(
        'Report generator with id invalid-report not found.',
      );

      expect(mockPrismaService.reportRun.create).not.toHaveBeenCalled();
      expect(mockQueue.add).not.toHaveBeenCalled();
    });
  });

  describe('getRunStatus', () => {
    const runId = 'run-123';
    const mockRun = {
      id: runId,
      reportId: 'test-report',
      status: ReportStatus.PENDING,
      fileUrl: null,
      error: null,
      params: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return run status when run exists', async () => {
      mockPrismaService.reportRun.findUnique.mockResolvedValue(mockRun);

      const result = await service.getRunStatus(runId);

      expect(result).toEqual(mockRun);
      expect(mockPrismaService.reportRun.findUnique).toHaveBeenCalledWith({
        where: { id: runId },
      });
    });

    it('should throw NotFoundException when run not found', async () => {
      mockPrismaService.reportRun.findUnique.mockResolvedValue(null);

      await expect(service.getRunStatus(runId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getRunStatus(runId)).rejects.toThrow(
        'Run not found',
      );
    });
  });

  describe('getAllRuns', () => {
    const mockRuns = [
      {
        id: 'run-1',
        reportId: 'test-report',
        status: ReportStatus.COMPLETED,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'run-2',
        reportId: 'another-report',
        status: ReportStatus.PENDING,
        createdAt: new Date('2024-01-02'),
      },
    ];

    it('should return runs ordered by createdAt desc', async () => {
      mockPrismaService.reportRun.findMany.mockResolvedValue(mockRuns);

      const result = await service.getAllRuns();

      expect(result).toEqual(mockRuns);
      expect(mockPrismaService.reportRun.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    });

    it('should return empty array when no runs exist', async () => {
      mockPrismaService.reportRun.findMany.mockResolvedValue([]);

      const result = await service.getAllRuns();

      expect(result).toEqual([]);
    });
  });

  describe('getFilePath', () => {
    it('should return correct file path', () => {
      const fileName = 'test-report_run-123.xlsx';
      const result = service.getFilePath(fileName);

      expect(result).toContain('tmp');
      expect(result).toContain('reports');
      expect(result).toContain(fileName);
    });
  });
});
