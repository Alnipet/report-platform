export type ReportDefinition = {
  id: string;
  name: string;
  format: string;
};

export type ReportRun = {
  id: string;
  reportId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  fileUrl: string | null;
  error: string | null;
  createdAt: string;
};

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function fetchReportDefinitions(): Promise<ReportDefinition[]> {
  const res = await fetch(`${API_URL}/reports/definitions`);
  return res.json();
}

export async function fetchReportRuns(): Promise<ReportRun[]> {
  const res = await fetch(`${API_URL}/reports/runs`);
  return res.json();
}

export async function requestReport(reportId: string): Promise<void> {
  await fetch(`${API_URL}/reports/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reportId,
      params: { date: new Date().toISOString() },
    }),
  });
}

export function getReportDownloadUrl(fileUrl: string): string {
  return `${API_URL}/reports/download/${fileUrl}`;
}
