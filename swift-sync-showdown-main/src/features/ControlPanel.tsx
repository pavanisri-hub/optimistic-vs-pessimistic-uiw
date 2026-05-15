import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  FAILURE_OPTIONS,
  LATENCY_OPTIONS,
  networkConditions,
  setNetworkConditions,
  subscribeNetwork,
} from "@/config/network";
import { Button } from "@/components/ui/button";
import { db } from "@/mocks/db";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function ControlPanel() {
  const qc = useQueryClient();
  const [, force] = useState(0);

  useEffect(() => {
    const unsub = subscribeNetwork(() => force((n) => n + 1));
    return () => {
      unsub();
    };
  }, []);

  const reset = () => {
    db.reset();
    qc.invalidateQueries({ queryKey: ["pessimistic-posts"] });
    qc.invalidateQueries({ queryKey: ["optimistic-posts"] });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap gap-6">
        <ControlGroup label="Latency">
          {LATENCY_OPTIONS.map((ms) => (
            <Pill
              key={ms}
              active={networkConditions.latency === ms}
              onClick={() => setNetworkConditions({ latency: ms })}
            >
              {ms}ms
            </Pill>
          ))}
        </ControlGroup>
        <ControlGroup label="Failure rate">
          {FAILURE_OPTIONS.map((r) => (
            <Pill
              key={r}
              active={networkConditions.failureRate === r}
              onClick={() => setNetworkConditions({ failureRate: r })}
            >
              {Math.round(r * 100)}%
            </Pill>
          ))}
        </ControlGroup>
      </div>
      <Button variant="outline" size="sm" onClick={reset} className="gap-2">
        <RefreshCw className="h-3.5 w-3.5" /> Reset feeds
      </Button>
    </div>
  );
}

function ControlGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex gap-1.5">{children}</div>
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-foreground border-border hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
