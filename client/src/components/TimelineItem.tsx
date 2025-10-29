import { MapPin, Navigation, Coffee } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { TaskWithLocation } from "@shared/schema";

interface TimelineItemProps {
  task: TaskWithLocation;
  isLast?: boolean;
  isCurrent?: boolean;
}

export function TimelineItem({ task, isLast, isCurrent }: TimelineItemProps) {
  const isBreak = task.type === "break";
  const isTravel = task.type === "travel";

  const Icon = isBreak ? Coffee : isTravel ? Navigation : MapPin;

  return (
    <div className="flex gap-4" data-testid={`timeline-item-${task.id}`}>
      {/* Timeline indicator */}
      <div className="flex flex-col items-center pt-1">
        <div
          className={`w-3 h-3 rounded-full ${
            task.status === "confirmed"
              ? "bg-primary"
              : task.status === "delayed" || task.status === "missed"
              ? "bg-destructive"
              : "bg-muted-foreground"
          }`}
        />
        {!isLast && (
          <div className="w-0.5 h-full min-h-12 bg-border mt-2" />
        )}
      </div>

      {/* Content */}
      <div className={`pb-6 flex-1 ${isCurrent ? "opacity-100" : "opacity-70"}`}>
        <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${isCurrent ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`font-semibold ${isCurrent ? "text-lg" : ""}`}>
              {task.location?.name || task.description || "Task"}
            </span>
          </div>
          <StatusBadge status={task.status as "pending" | "confirmed" | "delayed" | "missed"} />
        </div>

        <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground mb-1">
          <span>{task.startTime}</span>
          <span>–</span>
          <span>{task.endTime}</span>
        </div>

        {task.description && (
          <p className="text-sm text-muted-foreground mt-2">
            {task.description}
          </p>
        )}

        <div className="text-xs uppercase tracking-wide text-muted-foreground mt-2">
          {isBreak ? "Pausa" : isTravel ? "Spostamento" : "Lavoro"}
        </div>
      </div>
    </div>
  );
}
