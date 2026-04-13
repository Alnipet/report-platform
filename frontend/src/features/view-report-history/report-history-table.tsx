import { Card, CardContent } from '@/shared/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui';
import { Badge } from '@/shared/ui';
import { Button } from '@/shared/ui';
import type { ReportRun } from '@/shared/api';
import { getReportDownloadUrl } from '@/shared/api';

interface ReportHistoryTableProps {
  runs: ReportRun[];
}

export function ReportHistoryTable({ runs }: ReportHistoryTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Отчет</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Время запуска</TableHead>
              <TableHead className="text-right">Действие</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runs.map((run) => (
              <TableRow key={run.id}>
                <TableCell className="font-medium">{run.reportId}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      run.status === 'COMPLETED'
                        ? 'default'
                        : run.status === 'FAILED'
                          ? 'destructive'
                          : 'secondary'
                    }
                    className={
                      run.status === 'COMPLETED'
                        ? 'bg-emerald-500 hover:bg-emerald-600'
                        : ''
                    }
                  >
                    {run.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-neutral-500">
                  {new Date(run.createdAt).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {run.status === 'COMPLETED' && run.fileUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(
                          getReportDownloadUrl(run.fileUrl!),
                          '_blank',
                        )
                      }
                    >
                      Скачать
                    </Button>
                  )}
                  {run.status === 'FAILED' && (
                    <span
                      className="text-sm text-red-500"
                      title={run.error || ''}
                    >
                      Ошибка
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {runs.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-neutral-500"
                >
                  Нет истории генераций
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
