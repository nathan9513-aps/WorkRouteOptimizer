import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface DelayWarningPanelProps {
  delayMinutes: number;
  affectedTasks: number;
  onAcknowledge?: () => void;
  onViewSchedule?: () => void;
}

export function DelayWarningPanel({
  delayMinutes,
  affectedTasks,
  onAcknowledge,
  onViewSchedule,
}: DelayWarningPanelProps) {
  return (
    <Card className="p-6 border-l-4 border-l-destructive" data-testid="delay-warning-panel">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-md bg-destructive/10">
          <AlertTriangle className="w-6 h-6 text-destructive" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">Ritardo Rilevato</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Sei in ritardo di <span className="font-semibold text-destructive">{delayMinutes} minuti</span>.
            Il programma è stato ricalcolato automaticamente.
            {affectedTasks > 0 && (
              <span> {affectedTasks} task {affectedTasks === 1 ? "è stato modificato" : "sono stati modificati"}.</span>
            )}
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={onAcknowledge}
              data-testid="button-acknowledge-delay"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Ho capito
            </Button>
            {onViewSchedule && (
              <Button
                variant="default"
                size="sm"
                onClick={onViewSchedule}
                data-testid="button-view-updated-schedule"
              >
                Vedi Programma Aggiornato
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
