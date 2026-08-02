import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../../ui/sheet";
import { Button } from "../../ui/button";
import { BatteryLow, BatteryFull, BatteryWarning, CheckCircle, AlertTriangle, Zap } from "lucide-react";
import { useState } from "react";
import { useApp } from "../../../contexts/AppContext";
import { toast } from "sonner";

interface BatteryBehaviourSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type BatteryBehaviour = "respond" | "suppress" | "alert-contact";

const options: {
  id: BatteryBehaviour;
  label: string;
  badge?: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    id: "suppress",
    label: "Pause Timer",
    badge: "Recommended",
    description: "If your device goes offline, your timer pauses. Once you're back online, it resumes from where it left off. No response is triggered.",
    icon: BatteryFull,
  },
  {
    id: "respond",
    label: "Still Respond",
    description: "Battery offline is treated the same as a missed check-in. After your grace window expires, a responder is dispatched.",
    icon: Zap,
  },
  {
    id: "alert-contact",
    label: "Alert Contact Only",
    description: "Your primary contact receives a notification but no responder is dispatched. Best if you have someone nearby.",
    icon: BatteryWarning,
  },
];

export function BatteryBehaviourSheet({ open, onOpenChange }: BatteryBehaviourSheetProps) {
  const { motionTimer, plan, updateBatteryBehaviour, updateActiveServices, reportBatteryOffline, reEnableBatteryRule } = useApp();
  const gracePeriodHours = motionTimer.gracePeriodHours;

  const [selected, setSelected] = useState<BatteryBehaviour>(motionTimer.batteryBehaviour);
  const [ruleEnabled, setRuleEnabled] = useState(plan.batteryRuleEnabled);

  const handleSave = () => {
    updateBatteryBehaviour(selected);
    if (ruleEnabled && !plan.activeServices.includes("battery-rule")) {
      updateActiveServices([...plan.activeServices, "battery-rule"]);
    } else if (!ruleEnabled && plan.activeServices.includes("battery-rule")) {
      updateActiveServices(plan.activeServices.filter(s => s !== "battery-rule"));
    }
    toast.success("Battery rule updated", {
      description: ruleEnabled
        ? `If your device goes offline: ${selected === "suppress" ? "timer will pause" : selected === "respond" ? "we will still respond" : "your contact will be alerted"}`
        : "Battery rule disabled"
    });
    onOpenChange(false);
  };

  const handleSimulateOffline = () => {
    reportBatteryOffline();
    toast.info("Battery offline simulated", {
      description: "Check HomeStatus to see the effect"
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="inset-x-2 bottom-2 rounded-2xl h-[88vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl uppercase tracking-wide font-black flex items-center gap-2">
            <BatteryLow className="w-6 h-6 text-primary" />
            Battery Rule
          </SheetTitle>
          <SheetDescription className="text-base">
            Tell us what to do if your phone goes offline unexpectedly. This protects you from false dispatches caused by a dead battery.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 pt-6 pb-28">
          {/* Enable / Disable toggle */}
          <div className={`border-2 rounded-2xl p-4 flex items-center justify-between transition-all ${ruleEnabled ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
            <div>
              <p className="font-bold text-sm">Battery Rule Active</p>
              {plan.lostPhoneMode ? (
                <p className="text-xs text-amber-500 mt-0.5">Disabled — lost phone was reported</p>
              ) : (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {ruleEnabled ? "On — battery events are monitored" : "Off — no battery behaviour applied"}
                </p>
              )}
            </div>
            <button
              onClick={() => {
                if (plan.lostPhoneMode) {
                  reEnableBatteryRule();
                  setRuleEnabled(true);
                } else {
                  setRuleEnabled(v => !v);
                }
              }}
              className={`relative w-12 h-6 rounded-full transition-colors overflow-hidden ${ruleEnabled ? "bg-primary" : "bg-border"}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${ruleEnabled ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>

          {/* 36-hour escalation info — only shown when rule is OFF */}
          {!ruleEnabled && (
            <div className="flex items-start gap-3 bg-card border border-border rounded-2xl p-4">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                If your device stays offline for <strong className="text-foreground">36 hours</strong> without reconnecting, we'll automatically escalate and activate your protection plan — regardless of this setting.
              </p>
            </div>
          )}

          {/* Behaviour options */}
          {ruleEnabled && (
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wide font-bold text-muted-foreground">
                When my device goes offline…
              </p>

              {options.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selected === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelected(opt.id)}
                    className="w-full text-left transition-all"
                  >
                    <div className={`border-2 rounded-2xl p-5 transition-all ${isSelected ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-primary/20" : "bg-accent"}`}>
                          <Icon className={`w-6 h-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-base">{opt.label}</h3>
                            {opt.badge && (
                              <span className="text-[10px] font-bold uppercase tracking-wide bg-primary/15 text-primary px-2 py-0.5 rounded-full">
                                {opt.badge}
                              </span>
                            )}
                            {isSelected && <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 ml-auto" />}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{opt.description}</p>
                          {opt.id === "respond" && (
                            <div className="mt-2 flex items-center gap-1.5 bg-primary/5 border border-primary/20 rounded-lg px-2.5 py-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                              <p className="text-xs text-primary font-medium">
                                Your {gracePeriodHours}h grace period applies — set in Timer Settings
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Dev: Simulate battery offline */}
          <div className="border border-dashed border-border rounded-2xl p-4 space-y-2">
            <p className="text-xs uppercase tracking-wide font-bold text-muted-foreground">Demo / Dev</p>
            <p className="text-xs text-muted-foreground">Simulate a battery-offline event to preview how the app responds.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSimulateOffline}
              className="rounded-full text-xs"
            >
              <BatteryLow className="w-3.5 h-3.5 mr-1.5" />
              Simulate Battery Offline
            </Button>
          </div>
        </div>

        {/* Fixed footer */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-background border-t border-border">
          <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full uppercase font-medium tracking-wide">
              Cancel
            </Button>
            <Button onClick={handleSave} className="rounded-full uppercase font-bold tracking-wide bg-primary hover:bg-primary/90">
              Save Rule
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
