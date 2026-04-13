import { useState, useEffect, useCallback, useRef } from 'react';
import { Activity } from 'lucide-react';
import { fetchReportDefinitions, fetchReportRuns } from '@/shared/api';
import type { ReportDefinition, ReportRun } from '@/shared/api';
import { RunReportCard } from '@/features/run-report';
import { ReportHistoryTable } from '@/features/view-report-history';

export function ReportPlatformPage() {
  const [definitions, setDefinitions] = useState<ReportDefinition[]>([]);
  const [runs, setRuns] = useState<ReportRun[]>([]);
  const initializedRef = useRef(false);

  const fetchRunsHandler = useCallback(async () => {
    try {
      const data = await fetchReportRuns();
      setRuns(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      void (async () => {
        try {
          const data = await fetchReportDefinitions();
          setDefinitions(data);
        } catch (e) {
          console.error(e);
        }
        await fetchRunsHandler();
      })();
    }

    const interval = setInterval(fetchRunsHandler, 3000);
    return () => clearInterval(interval);
  }, [fetchRunsHandler]);

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
              <RunReportCard
                key={def.id}
                definition={def}
                onRequested={fetchRunsHandler}
                disabled={false}
              />
            ))}
            {definitions.length === 0 && (
              <p className="text-sm text-neutral-500">Загрузка отчетов...</p>
            )}
          </div>
        </section>

        <section className="md:col-span-2 flex flex-col gap-4">
          <h2 className="text-xl font-semibold">История генераций</h2>
          <ReportHistoryTable runs={runs} />
        </section>
      </main>
    </div>
  );
}
