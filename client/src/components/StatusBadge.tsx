import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertTriangle, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: "pending" | "confirmed" | "missed" | "delayed";
  className?: string;
}

const statusConfig = {
  pending: {
    label: "In Attesa",
    icon: Clock,
    variant: "secondary" as const,
  },
  confirmed: {
    label: "Confermato",
    icon: CheckCircle2,
    variant: "default" as const,
  },
  missed: {
    label: "Mancato",
    icon: XCircle,
    variant: "destructive" as const,
  },
  delayed: {
    label: "In Ritardo",
    icon: AlertTriangle,
    variant: "outline" as const,
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={className} data-testid={`badge-status-${status}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}
