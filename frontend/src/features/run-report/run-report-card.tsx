import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/shared/ui';
import { Button } from '@/shared/ui';
import type { ReportDefinition } from '@/shared/api';
import { requestReport } from '@/shared/api';

interface RunReportCardProps {
  definition: ReportDefinition;
  onRequested: () => void;
  disabled: boolean;
}

export function RunReportCard({
  definition,
  onRequested,
  disabled,
}: RunReportCardProps) {
  const handleRun = async () => {
    try {
      await requestReport(definition.id);
      onRequested();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{definition.name}</CardTitle>
        <CardDescription>
          Формат: {definition.format.toUpperCase()}
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button
          onClick={handleRun}
          disabled={disabled}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          Запустить генерацию
        </Button>
      </CardFooter>
    </Card>
  );
}
