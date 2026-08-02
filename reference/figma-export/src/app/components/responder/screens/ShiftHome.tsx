import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Clock, MapPin, Activity, AlertCircle, CheckCircle, BatteryLow, Smartphone } from "lucide-react";
import { useApp } from "../../../contexts/AppContext";

function formatRelative(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatRemaining(date: Date): string {
  const diffMs = date.getTime() - Date.now();
  if (diffMs <= 0) return "Expired";
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m left`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m left`;
}

const statusConfig = {
  "active": { label: "ACTIVE", className: "bg-primary/20 text-primary border-primary/30" },
  "grace-window": { label: "GRACE", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  "paused-battery": { label: "BATTERY OFFLINE", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  "triggered": { label: "TRIGGERED", className: "bg-destructive/20 text-destructive border-destructive/30" },
};

export function ShiftHome() {
  const { userTimerStatuses } = useApp();

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Status */}
      <div className="flex justify-center">
        <Badge className="bg-primary text-primary-foreground px-6 py-2 text-sm uppercase font-bold tracking-wide rounded-full">
          ON SHIFT
        </Badge>
      </div>

      {/* User Timer Status */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-primary" />
          <h3 className="text-xs uppercase tracking-wider font-bold">User Timer Status</h3>
        </div>
        <div className="space-y-2">
          {userTimerStatuses.map((u) => {
            const cfg = statusConfig[u.timerStatus] ?? statusConfig["active"];
            return (
              <div key={u.userId} className="border border-border rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-sm truncate">{u.userName}</p>
                  <span className={`text-[10px] font-bold uppercase tracking-wide border px-2 py-0.5 rounded-full whitespace-nowrap ${cfg.className}`}>
                    {cfg.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <span className="uppercase tracking-wide text-[10px] font-bold text-muted-foreground/60 block mb-0.5">Last Check-in</span>
                    {formatRelative(u.lastCheckIn)}
                  </div>
                  <div>
                    <span className="uppercase tracking-wide text-[10px] font-bold text-muted-foreground/60 block mb-0.5">Timer</span>
                    {u.timerStatus === "paused-battery" ? "Paused" : formatRemaining(u.nextCheckIn)}
                  </div>
                </div>
                {u.batteryOfflineSince && (
                  <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5">
                    <BatteryLow className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span className="text-xs text-amber-400 font-medium">
                      Device offline {formatRelative(u.batteryOfflineSince)}
                    </span>
                  </div>
                )}
                {u.lostPhoneMode && (
                  <div className="flex items-center gap-1.5 bg-muted rounded-lg px-2.5 py-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground font-medium">Lost phone reported</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Clock In/Out Card */}
      <Card className="p-6 space-y-4 border-2 border-primary/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wider text-muted-foreground font-medium">SHIFT STARTED</p>
            <div className="text-3xl font-black text-primary mt-1">3h 24m</div>
            <p className="text-sm text-muted-foreground mt-1">Clocked in at 7:00 AM</p>
          </div>
          <Clock className="w-12 h-12 text-primary" />
        </div>
        <Button variant="outline" className="w-full rounded-full uppercase font-bold tracking-wide">
          Clock Out
        </Button>
      </Card>

      {/* Coverage Zone */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="text-sm uppercase tracking-wider font-bold">TODAY'S COVERAGE ZONE</h3>
        </div>
        <div className="bg-muted rounded-lg p-4">
          <p className="font-medium mb-2">North Sydney & Surrounding</p>
          <p className="text-sm text-muted-foreground">
            North Sydney, Neutral Bay, Cremorne, Mosman, Kirribilli
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
          <div>
            <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">EXPECTED LOAD</p>
            <p className="text-2xl font-black text-primary">Low</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">ACTIVE RESPONDERS</p>
            <p className="text-2xl font-black text-primary">4</p>
          </div>
        </div>
      </Card>

      {/* Today's Activity */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="text-sm uppercase tracking-wider font-bold">TODAY'S ACTIVITY</h3>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-black text-primary mb-1">2</div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Dispatches</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-primary mb-1">2</div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Completed</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-primary mb-1">0</div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Active</p>
          </div>
        </div>

        <div className="pt-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Dispatch #LW-2345</span>
            </div>
            <span className="text-muted-foreground">Completed 9:42 AM</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Dispatch #LW-2344</span>
            </div>
            <span className="text-muted-foreground">Completed 8:15 AM</span>
          </div>
        </div>
      </Card>

      {/* Pending Dispatch Notice */}
      <Card className="p-5 bg-primary/10 border-primary/30">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Ready for dispatch</p>
            <p className="text-sm text-muted-foreground">
              You'll receive a notification when a new incident requires response in your zone. You'll have 60 seconds to accept.
            </p>
          </div>
        </div>
      </Card>

      {/* Briefing */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm uppercase tracking-wider font-bold">SHIFT BRIEFING</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              Standard protocols in effect. No weather alerts.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              Updated pet care training module available in Account → Training
            </p>
          </div>
        </div>
      </Card>

      {/* Wellness Check */}
      <Card className="p-5 bg-muted/30">
        <p className="text-sm text-muted-foreground mb-3">
          <strong className="text-foreground">How are you feeling today?</strong>
        </p>
        <div className="flex gap-2">
          {["Great", "Good", "OK", "Tired", "Stressed"].map((mood) => (
            <Button
              key={mood}
              variant="outline"
              size="sm"
              className="flex-1 text-xs uppercase"
            >
              {mood}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
