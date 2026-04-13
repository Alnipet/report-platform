import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type ReportDefinition = {
  id: string;
  name: string;
  format: string;
};

type ReportRun = {
  id: string;
  reportId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  fileUrl: string | null;
  error: string | null;
  createdAt: string;
};

function App() {
  const [definitions, setDefinitions] = useState<ReportDefinition[]>([]);
  const [runs, setRuns] = useState<ReportRun[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDefinitions = async () => {
    try {
      const res = await fetch(`${API_URL}/reports/definitions`);
      const data = await res.json();
      setDefinitions(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRuns = async () => {
    try {
      const res = await fetch(`${API_URL}/reports/runs`);
      const data = await res.json();
      setRuns(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDefinitions();
    fetchRuns();
    const interval = setInterval(fetchRuns, 3000);
    return () => clearInterval(interval);
  }, []);

  const requestReport = async (reportId: string) => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/reports/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId,
          params: { date: new Date().toISOString() },
        }),
      });
      await fetchRuns();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (fileUrl: string) => {
    window.open(`${API_URL}/reports/download/${fileUrl}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-8 flex flex-col gap-8 text-neutral-900 dark:text-neutral-50">
      <header className="flex items-center gap-3 border-b pb-6">
        <Activity className="h-8 w-8 text-indigo-600" />
        <h1 className="text-3xl font-bold tracking-tight">Report Platform</h1>
      </header>

      <main className="grid md:grid-cols-3 gap-8">
        <section className="md:col-span-1 flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Доступные отчеты</h2>
          <div className="grid gap-4">
            {definitions.map((def) => (
              <Card key={def.id}>
                <CardHeader>
                  <CardTitle>{def.name}</CardTitle>
                  <CardDescription>
                    Формат: {def.format.toUpperCase()}
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button
                    onClick={() => requestReport(def.id)}
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    Запустить генерацию
                  </Button>
                </CardFooter>
              </Card>
            ))}
            {definitions.length === 0 && (
              <p className="text-sm text-neutral-500">Загрузка отчетов...</p>
            )}
          </div>
        </section>

        <section className="md:col-span-2 flex flex-col gap-4">
          <h2 className="text-xl font-semibold">История генераций</h2>
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
                      <TableCell className="font-medium">
                        {run.reportId}
                      </TableCell>
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
                            onClick={() => handleDownload(run.fileUrl!)}
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
        </section>
      </main>
    </div>
  );
}

export default App;
