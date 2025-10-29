import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";

interface ReportDelayDialogProps {
  onReportDelay: (minutes: number) => void;
  isReporting?: boolean;
}

export function ReportDelayDialog({ onReportDelay, isReporting }: ReportDelayDialogProps) {
  const [open, setOpen] = useState(false);
  const [delayMinutes, setDelayMinutes] = useState("");

  const handleSubmit = () => {
    const minutes = parseInt(delayMinutes, 10);
    if (minutes > 0) {
      onReportDelay(minutes);
      setOpen(false);
      setDelayMinutes("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="button-report-delay">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Segnala Ritardo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" data-testid="dialog-report-delay">
        <DialogHeader>
          <DialogTitle>Segnala Ritardo</DialogTitle>
          <DialogDescription>
            Indica di quanti minuti sei in ritardo. Il programma verrà ricalcolato automaticamente.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="delay-minutes">Minuti di Ritardo</Label>
            <Input
              id="delay-minutes"
              type="number"
              min="1"
              max="120"
              value={delayMinutes}
              onChange={(e) => setDelayMinutes(e.target.value)}
              placeholder="Es. 15"
              data-testid="input-delay-minutes"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            data-testid="button-cancel-delay"
          >
            Annulla
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!delayMinutes || parseInt(delayMinutes) <= 0 || isReporting}
            data-testid="button-submit-delay"
          >
            {isReporting ? "Segnalazione..." : "Conferma Ritardo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
