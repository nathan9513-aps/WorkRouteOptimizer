import { Card } from "@/components/ui/card";
import { MapPin, Clock, CheckCircle2, TrendingUp } from "lucide-react";
import type { TaskWithLocation } from "@shared/schema";

interface QuickStatsPanelProps {
  tasks: TaskWithLocation[];
}

export function QuickStatsPanel({ tasks }: QuickStatsPanelProps) {
  // Calculate statistics
  const uniqueLocations = new Set(
    tasks
      .filter((t) => t.location)
      .map((t) => t.location!.name)
  ).size;

  const travelTasks = tasks.filter((t) => t.type === "travel");
  const totalTravelMinutes = travelTasks.reduce((sum, task) => {
    const [startH, startM] = task.startTime.split(":").map(Number);
    const [endH, endM] = task.endTime.split(":").map(Number);
    const duration = (endH * 60 + endM) - (startH * 60 + startM);
    return sum + duration;
  }, 0);

  const completedTasks = tasks.filter((t) => t.status === "confirmed").length;
  const totalTasks = tasks.filter((t) => t.type !== "travel").length;

  const onTimePercentage = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  const stats = [
    {
      icon: MapPin,
      label: "Località Visitate",
      value: uniqueLocations.toString(),
      testId: "stat-locations",
    },
    {
      icon: Clock,
      label: "Tempo di Viaggio",
      value: `${Math.floor(totalTravelMinutes / 60)}h ${totalTravelMinutes % 60}m`,
      testId: "stat-travel-time",
    },
    {
      icon: CheckCircle2,
      label: "Task Completati",
      value: `${completedTasks}/${totalTasks}`,
      testId: "stat-completed",
    },
    {
      icon: TrendingUp,
      label: "Puntualità",
      value: `${onTimePercentage}%`,
      testId: "stat-on-time",
    },
  ];

  return (
    <div className="space-y-3" data-testid="quick-stats-panel">
      <h3 className="text-lg font-semibold mb-4">Statistiche Giornaliere</h3>
      {stats.map((stat) => (
        <Card key={stat.label} className="p-4" data-testid={stat.testId}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/10">
              <stat.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-muted-foreground mb-1">
                {stat.label}
              </div>
              <div className="text-2xl font-bold">
                {stat.value}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
