import { useState, useEffect } from "react";
import { differenceInSeconds, parse } from "date-fns";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  targetTime: string; // HH:mm format
  label?: string;
}

export function CountdownTimer({ targetTime, label = "Tempo rimanente" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const [hours, minutes] = targetTime.split(":").map(Number);
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);
      
      // If target is in the past today, it might be tomorrow
      if (target < now) {
        return 0;
      }
      
      return differenceInSeconds(target, now);
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const isUrgent = timeLeft > 0 && timeLeft < 600; // Less than 10 minutes

  return (
    <div className="flex flex-col items-center gap-2" data-testid="countdown-timer">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span>{label}</span>
      </div>
      <div className={`text-4xl font-bold font-mono ${isUrgent ? "text-destructive" : "text-foreground"}`}>
        {hours > 0 && <span>{hours.toString().padStart(2, "0")}:</span>}
        <span>{minutes.toString().padStart(2, "0")}</span>
        <span>:</span>
        <span>{seconds.toString().padStart(2, "0")}</span>
      </div>
      {isUrgent && timeLeft > 0 && (
        <div className="text-xs text-destructive font-medium">
          Conferma richiesta a breve!
        </div>
      )}
    </div>
  );
}
