import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { CountdownTimer } from "./CountdownTimer";
import { ReportDelayDialog } from "./ReportDelayDialog";
import type { TaskWithLocation } from "@shared/schema";

interface CurrentTaskCardProps {
  task: TaskWithLocation | null;
  onConfirm?: (taskId: string) => void;
  onConfirmWithDelay?: (taskId: string, delayMinutes: number) => void;
  onReportDelay?: (taskId: string, minutes: number) => void;
  isConfirming?: boolean;
  isConfirmingWithDelay?: boolean;
  isReportingDelay?: boolean;
  isLate?: boolean;
  delayMinutes?: number;
  isNextTask?: boolean;
}

export function CurrentTaskCard({ 
  task, 
  onConfirm, 
  onConfirmWithDelay,
  onReportDelay, 
  isConfirming, 
  isConfirmingWithDelay,
  isReportingDelay,
  isLate = false,
  delayMinutes = 0,
  isNextTask = false
}: CurrentTaskCardProps) {
  if (!task) {
    return (
      <Card className="p-8 rounded-2xl" data-testid="card-current-task-empty">
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Nessun Task Attivo</h2>
          <p className="text-muted-foreground">
            La giornata lavorativa è completata o non ancora iniziata
          </p>
        </div>
      </Card>
    );
  }

  const isBreak = task.type === "break";
  const isTravel = task.type === "travel";
  const canConfirm = task.status === "pending" && !isConfirming && !isConfirmingWithDelay;

  console.log("🔘 CurrentTaskCard debug:", {
    taskId: task.id,
    taskStatus: task.status,
    isConfirming,
    isConfirmingWithDelay,
    canConfirm,
    onConfirmExists: !!onConfirm,
    onConfirmWithDelayExists: !!onConfirmWithDelay,
    isLate,
    delayMinutes
  });

  return (
    <Card className="p-8 rounded-2xl" data-testid="card-current-task">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {isTravel ? (
              <Navigation className="w-8 h-8 text-primary" />
            ) : (
              <MapPin className="w-8 h-8 text-primary" />
            )}
            <div>
              <div className="text-sm text-muted-foreground uppercase tracking-wide font-medium mb-1">
                {isBreak ? "Pausa" : isTravel ? "Spostamento" : "Lavoro"}
                {isNextTask && " - Prossimo Task"}
              </div>
              <h2 className="text-3xl font-semibold">
                {task.location?.name || task.description || "Task"}
              </h2>
            </div>
          </div>
          <StatusBadge status={task.status as "pending" | "confirmed" | "delayed" | "missed"} />
        </div>

        {/* Description if present */}
        {task.description && (
          <p className="text-lg text-muted-foreground">
            {task.description}
          </p>
        )}

        {/* Time Range */}
        <div className="flex items-center gap-4 text-lg font-mono">
          <span className="font-semibold">{task.startTime}</span>
          <span className="text-muted-foreground">→</span>
          <span className="font-semibold">{task.endTime}</span>
          {isLate && (
            <div className="flex items-center gap-2 px-3 py-1 bg-destructive/10 text-destructive rounded-md text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>In ritardo di {delayMinutes} min</span>
            </div>
          )}
        </div>

        {/* Countdown Timer or Late Notice */}
        {task.status === "pending" && !isLate && (
          <div className="border-t pt-6">
            <CountdownTimer targetTime={task.endTime} label="Tempo rimanente per questo task" />
          </div>
        )}
        
        {isLate && (
          <div className="border-t pt-6">
            <div className="flex items-center gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-destructive">Task in Ritardo</h4>
                <p className="text-sm text-muted-foreground">
                  Sei in ritardo di {delayMinutes} minuti. Puoi proseguire confermando il ritardo.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {canConfirm && (
          <div className="flex gap-3 flex-wrap">
            {!isLate ? (
              // Normal confirmation button
              <Button
                size="lg"
                onClick={() => onConfirm?.(task.id)}
                disabled={isConfirming}
                className="flex-1 min-h-12 text-lg"
                data-testid="button-confirm-task"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                {isConfirming ? "Conferma in corso..." : "Conferma Arrivo"}
              </Button>
            ) : (
              // Late confirmation button
              <Button
                size="lg"
                variant="destructive"
                onClick={() => onConfirmWithDelay?.(task.id, delayMinutes)}
                disabled={isConfirmingWithDelay}
                className="flex-1 min-h-12 text-lg"
                data-testid="button-confirm-late-task"
              >
                <Clock className="w-5 h-5 mr-2" />
                {isConfirmingWithDelay ? "Confermando ritardo..." : `Conferma con ${delayMinutes} min di Ritardo`}
              </Button>
            )}
            
            {/* Keep the report delay dialog for manual reporting */}
            {onReportDelay && !isLate && (
              <ReportDelayDialog
                onReportDelay={(minutes) => onReportDelay(task.id, minutes)}
                isReporting={isReportingDelay}
              />
            )}
          </div>
        )}

        {task.status === "confirmed" && task.confirmedAt && (
          <div className="text-center text-sm text-muted-foreground">
            Confermato alle {new Date(task.confirmedAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
      </div>
    </Card>
  );
}
