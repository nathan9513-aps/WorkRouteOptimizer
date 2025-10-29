import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { RotateCcw, Lock, AlertTriangle, CheckCircle } from "lucide-react";

interface ResetDelayDialogProps {
  onReset: (password: string, markAllOnTime: boolean) => Promise<void>;
  isResetting: boolean;
}

export function ResetDelayDialog({ onReset, isResetting }: ResetDelayDialogProps) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [markAllOnTime, setMarkAllOnTime] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password.trim()) {
      setError("La password è obbligatoria");
      return;
    }

    try {
      await onReset(password, markAllOnTime);
      setOpen(false);
      setPassword("");
      setMarkAllOnTime(false);
    } catch (error) {
      setError("Password non valida o errore durante il reset");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isResetting) {
      setOpen(newOpen);
      if (!newOpen) {
        setPassword("");
        setMarkAllOnTime(false);
        setError("");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="gap-2"
          data-testid="button-reset-delays"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Ritardi
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Reset Ritardi Automatici
          </DialogTitle>
          <DialogDescription>
            Inserisci la password di amministratore per resettare tutti i ritardi automatici.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Password Amministratore</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Inserisci password"
              disabled={isResetting}
              data-testid="input-admin-password"
            />
          </div>

          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="markAllOnTime"
                checked={markAllOnTime}
                onChange={(e) => setMarkAllOnTime(e.target.checked)}
                className="mt-1"
                disabled={isResetting}
                data-testid="checkbox-mark-all-ontime"
              />
              <div className="space-y-1">
                <Label htmlFor="markAllOnTime" className="flex items-center gap-2 cursor-pointer">
                  <CheckCircle className="w-4 h-4" />
                  Conferma Tutti i Task come "In Orario"
                </Label>
                <p className="text-sm text-muted-foreground">
                  Oltre al reset dei ritardi, marca automaticamente tutti i task pendenti 
                  come confermati e in orario.
                </p>
              </div>
            </div>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Attenzione:</strong> Questa operazione resetterà tutti i ritardi registrati 
              automaticamente e ripristinerà gli orari originali del programma.
              {markAllOnTime && " Tutti i task verranno anche marcati come confermati in orario."}
            </AlertDescription>
          </Alert>
        </form>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isResetting}
          >
            Annulla
          </Button>
          <Button
            type="submit"
            variant="destructive"
            onClick={handleSubmit}
            disabled={isResetting || !password.trim()}
            data-testid="button-confirm-reset"
          >
            {isResetting ? (
              <>
                <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                Resettando...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 mr-2" />
                Conferma Reset
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}