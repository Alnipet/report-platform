import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class RequestReportDto {
  @IsString()
  @IsNotEmpty()
  reportId: string;

  @IsOptional()
  @IsObject()
  params?: Record<string, unknown>;
}
