import { useState, useEffect } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

export function LiveClock() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2" data-testid="live-clock">
      <div className="text-sm font-medium text-muted-foreground">
        {format(currentTime, "EEEE, d MMMM yyyy", { locale: it })}
      </div>
      <div className="text-sm font-mono font-semibold">
        {format(currentTime, "HH:mm:ss")}
      </div>
    </div>
  );
}
