import { Card } from "@/components/ui/card";
import { TimelineItem } from "./TimelineItem";
import type { TaskWithLocation } from "@shared/schema";
import { Calendar } from "lucide-react";

interface TimelineProps {
  tasks: TaskWithLocation[];
  currentTaskId?: string | null;
}

export function Timeline({ tasks, currentTaskId }: TimelineProps) {
  if (tasks.length === 0) {
    return (
      <Card className="p-6" data-testid="timeline-empty">
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Nessun task programmato per oggi</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6" data-testid="timeline">
      <h3 className="text-xl font-semibold mb-6">Programma Giornaliero</h3>
      <div className="space-y-0">
        {tasks.map((task, index) => (
          <TimelineItem
            key={task.id}
            task={task}
            isLast={index === tasks.length - 1}
            isCurrent={task.id === currentTaskId}
          />
        ))}
      </div>
    </Card>
  );
}
