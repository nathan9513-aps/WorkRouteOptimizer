import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { LiveClock } from "@/components/LiveClock";
import { CurrentTaskCard } from "@/components/CurrentTaskCard";
import { Timeline } from "@/components/Timeline";
import { QuickStatsPanel } from "@/components/QuickStatsPanel";
import { DelayWarningPanel } from "@/components/DelayWarningPanel";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ScheduleWithTasks, TaskWithLocation } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const [delayWarning, setDelayWarning] = useState<{
    delayMinutes: number;
    affectedTasks: number;
  } | null>(null);
  const [processedDelayedTasks, setProcessedDelayedTasks] = useState<Set<string>>(new Set());

  // Fetch today's schedule
  const { data: schedule, isLoading } = useQuery<ScheduleWithTasks>({
    queryKey: ["/api/schedule/today"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Helper function to convert time string to minutes
  const timeToMinutes = useCallback((timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }, []);

  // Helper function to calculate delay in minutes
  const calculateDelayMinutes = useCallback((endTime: string) => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const currentMinutes = timeToMinutes(currentTime);
    const endMinutes = timeToMinutes(endTime);
    return Math.max(0, currentMinutes - endMinutes);
  }, [timeToMinutes]);

  // Auto-report delay function
  const handleAutoReportDelay = useCallback(async (taskId: string, delayMinutes: number, taskDescription?: string) => {
    try {
      console.log("🤖 Registrazione automatica ritardo:", { taskId, delayMinutes, taskDescription });
      
      const res = await apiRequest("POST", `/api/tasks/${taskId}/delay`, {
        taskId,
        delayMinutes,
      });
      
      const data = await res.json();
      
      // Aggiorna i dati
      queryClient.invalidateQueries({ queryKey: ["/api/schedule/today"] });
      
      setDelayWarning({
        delayMinutes: data.delayMinutes || delayMinutes,
        affectedTasks: data.affectedTasks || 0,
      });

      toast({
        title: "🤖 Ritardo Rilevato Automaticamente",
        description: `Task "${taskDescription || 'Task'}" in ritardo di ${delayMinutes} minuti. Programma ricalcolato automaticamente.`,
        variant: "destructive",
      });
    } catch (error) {
      console.error("❌ Errore nella registrazione automatica del ritardo:", error);
    }
  }, [toast]);

  // Auto-delay detection effect
  useEffect(() => {
    if (!schedule?.tasks) return;

    // Reset processed tasks when schedule changes (new day, etc.)
    const currentTaskIds = new Set(schedule.tasks.map(task => task.id));
    setProcessedDelayedTasks(prev => {
      const filtered = new Set([...prev].filter(id => currentTaskIds.has(id)));
      return filtered;
    });

    const checkDelayedTasks = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const currentMinutes = timeToMinutes(currentTime);

      schedule.tasks.forEach(task => {
        if (task.status === "pending" && !processedDelayedTasks.has(task.id)) {
          const endMinutes = timeToMinutes(task.endTime);
          
          // Se il task è scaduto (tempo corrente > tempo fine del task)
          if (currentMinutes > endMinutes) {
            const delayMinutes = calculateDelayMinutes(task.endTime);
            
            console.log("⏰ Task scaduto rilevato:", {
              taskId: task.id,
              description: task.description,
              endTime: task.endTime,
              currentTime,
              delayMinutes
            });

            // Registra automaticamente il ritardo
            handleAutoReportDelay(task.id, delayMinutes, task.description);
            
            // Marca il task come processato per evitare duplicati
            setProcessedDelayedTasks(prev => new Set(prev).add(task.id));
          }
        }
      });
    };

    // Controlla immediatamente
    checkDelayedTasks();

    // Imposta un timer per controllare ogni minuto
    const interval = setInterval(checkDelayedTasks, 60000); // 60 secondi

    return () => clearInterval(interval);
  }, [schedule?.tasks, processedDelayedTasks, timeToMinutes, calculateDelayMinutes, handleAutoReportDelay]);

  // Find current task (based on current time)
  const currentTask = schedule?.tasks.find((task) => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    
    const currentMinutes = timeToMinutes(currentTime);
    const startMinutes = timeToMinutes(task.startTime);
    const endMinutes = timeToMinutes(task.endTime);
    
    const isInTimeRange = currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    const isPending = task.status === "pending";
    
    // Calcola se il task è in ritardo
    const isDelayed = currentMinutes > endMinutes && task.status === "pending";
    const delayMinutes = isDelayed ? calculateDelayMinutes(task.endTime) : 0;
    
    console.log("🕐 Controllo task:", {
      id: task.id,
      description: task.description,
      startTime: task.startTime,
      endTime: task.endTime,
      status: task.status,
      currentTime,
      currentMinutes,
      startMinutes,
      endMinutes,
      isInTimeRange,
      isPending,
      isDelayed,
      delayMinutes,
      isCurrentTask: isInTimeRange && isPending
    });
    
    return isInTimeRange && isPending;
  }) || null;

  console.log("📋 Current task trovato:", currentTask);

  // Confirm task mutation
  const confirmMutation = useMutation({
    mutationFn: async (taskId: string) => {
      console.log("🔄 Tentativo di conferma task:", taskId);
      try {
        const payload = {
          taskId: taskId,
          confirmedAt: new Date().toISOString(),
        };
        console.log("📤 Payload inviato:", payload);
        
        const res = await apiRequest("POST", `/api/tasks/${taskId}/confirm`, payload);
        console.log("✅ Response ricevuta, status:", res.status);
        
        const result = await res.json();
        console.log("📥 Result JSON:", result);
        return result;
      } catch (error) {
        console.error("❌ Errore nella mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule/today"] });
      toast({
        title: "Task Confermato",
        description: "Il tuo arrivo è stato registrato con successo.",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile confermare il task. Riprova.",
        variant: "destructive",
      });
    },
  });

  const handleConfirm = (taskId: string) => {
    console.log("🎯 handleConfirm chiamato con taskId:", taskId);
    if (!taskId) {
      console.error("❌ TaskId non valido:", taskId);
      return;
    }
    confirmMutation.mutate(taskId);
  };

  // Report delay mutation
  const delayMutation = useMutation({
    mutationFn: async ({ taskId, minutes }: { taskId: string; minutes: number }) => {
      const res = await apiRequest("POST", `/api/tasks/${taskId}/delay`, {
        taskId,
        delayMinutes: minutes,
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule/today"] });
      setDelayWarning({
        delayMinutes: data.delayMinutes || 0,
        affectedTasks: data.affectedTasks || 0,
      });
      toast({
        title: "Ritardo Segnalato",
        description: `Il programma è stato ricalcolato. ${data.affectedTasks} task ${data.affectedTasks === 1 ? "è stato modificato" : "sono stati modificati"}.`,
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile segnalare il ritardo. Riprova.",
        variant: "destructive",
      });
    },
  });

  const handleReportDelay = (taskId: string, minutes: number) => {
    delayMutation.mutate({ taskId, minutes });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento programma...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="font-bold text-xl">WorkSchedule</div>
          </div>

          <LiveClock />

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" data-testid="button-notifications">
              <Bell className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  N
                </AvatarFallback>
              </Avatar>
              <span className="font-medium hidden sm:inline">Nathan</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delay Warning */}
            {delayWarning && (
              <DelayWarningPanel
                delayMinutes={delayWarning.delayMinutes}
                affectedTasks={delayWarning.affectedTasks}
                onAcknowledge={() => setDelayWarning(null)}
                onViewSchedule={() => {
                  setDelayWarning(null);
                  // Scroll to timeline
                }}
              />
            )}

            {/* Current Task Card */}
            <CurrentTaskCard
              task={currentTask}
              onConfirm={handleConfirm}
              onReportDelay={handleReportDelay}
              isConfirming={confirmMutation.isPending}
              isReportingDelay={delayMutation.isPending}
            />

            {/* Timeline */}
            <Timeline
              tasks={schedule?.tasks || []}
              currentTaskId={currentTask?.id}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <QuickStatsPanel tasks={schedule?.tasks || []} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
