import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Bell, Shield, Dog, Eye, Check, ChevronDown, ChevronUp, ArrowDown, ArrowUp } from "lucide-react";
import { useApp } from "../../../contexts/AppContext";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";

const TIERS = [
  {
    id: "friend-alert" as const,
    name: "Friend Alert",
    price: 29,
    tagline: "Essential notification only",
    icon: Bell,
    services: ["friend-alert"],
    features: [
      "Primary contact notified",
      "No physical response",
    ],
  },
  {
    id: "attend-check" as const,
    name: "Attend & Check",
    price: 59,
    tagline: "Physical response to your door",
    icon: Shield,
    services: ["attend-check", "friend-alert"],
    features: [
      "Accredited Legacy Wolf Responder dispatched",
      "Physical check-in at your property",
      "Emergency services coordination",
      "Primary contact notified",
    ],
  },
  {
    id: "pet-guardian" as const,
    name: "Pet Guardian",
    price: 69,
    tagline: "Your pet is cared for too",
    icon: Dog,
    services: ["attend-check", "pet-guardian", "friend-alert"],
    features: [
      "Everything in Attend & Check",
      "Immediate pet care and handover",
      "Vet coordination if needed",
    ],
  },
  {
    id: "full" as const,
    name: "Full Protection",
    price: 99,
    tagline: "Complete protection and dignity",
    icon: Eye,
    services: ["attend-check", "pet-guardian", "reputation-guard", "friend-alert"],
    features: [
      "Everything in Pet Guardian",
      "Pants On / Reputation Guard service",
      "Pre-arrival dignity checklist executed",
      "Secure scene before family arrives",
    ],
  },
];

const TIER_ORDER = ["friend-alert", "attend-check", "pet-guardian", "full"];

export function PlanManagement() {
  const { plan, updatePlan } = useApp();
  const [confirmTier, setConfirmTier] = useState<typeof plan.tier | null>(null);
  const [showOtherPlans, setShowOtherPlans] = useState(false);

  const currentTierData = TIERS.find(t => t.id === plan.tier)!;
  const currentIndex = TIER_ORDER.indexOf(plan.tier);
  const otherTiers = TIERS.filter(t => t.id !== plan.tier);

  const isUpgrade = (tierId: string) => TIER_ORDER.indexOf(tierId) > currentIndex;

  const confirmAndSwitch = () => {
    if (!confirmTier) return;
    const tierData = TIERS.find(t => t.id === confirmTier)!;
    updatePlan(confirmTier);
    toast.success(`Plan changed to ${tierData.name}`, {
      description: isUpgrade(confirmTier) ? "Your protection has been upgraded." : "Your plan has been downgraded."
    });
    setConfirmTier(null);
  };

  const confirmTierData = confirmTier ? TIERS.find(t => t.id === confirmTier) : null;
  const isConfirmUpgrade = confirmTier ? isUpgrade(confirmTier) : false;

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-black uppercase tracking-tight text-2xl">YOUR PLAN</h2>
        <p className="text-muted-foreground text-sm">What we execute if you become unresponsive</p>
      </div>

      {/* Current Plan */}
      <Card className="p-6 border-2 border-primary/40 bg-primary/5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">CURRENT PLAN</p>
            <h3 className="text-2xl font-black uppercase tracking-wide">{currentTierData.name}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{currentTierData.tagline}</p>
          </div>
          <div className="text-right">
            <Badge className="bg-primary text-primary-foreground mb-2">ACTIVE</Badge>
            <p className="text-2xl font-black text-primary">${currentTierData.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
          </div>
        </div>

        <div className="space-y-2 mb-5">
          {currentTierData.features.map((f, i) => (
            <div key={i} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm">{f}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowOtherPlans(v => !v)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full border-2 border-border text-sm font-bold uppercase tracking-wide hover:border-primary/50 transition-colors"
        >
          {showOtherPlans ? (
            <><ChevronUp className="w-4 h-4" />Hide Other Plans</>
          ) : (
            <><ChevronDown className="w-4 h-4" />See Other Plans</>
          )}
        </button>
      </Card>

      {/* Other Plans */}
      {showOtherPlans && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">OTHER PLANS</p>
          {otherTiers.map(tier => {
            const upgrade = isUpgrade(tier.id);
            const Icon = tier.icon;
            const priceDiff = tier.price - currentTierData.price;

            return (
              <Card key={tier.id} className="p-5 border-border hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-full bg-muted flex-shrink-0">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-bold">{tier.name}</h4>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 ${upgrade ? "border-primary text-primary" : "border-muted-foreground text-muted-foreground"}`}
                        >
                          {upgrade ? (
                            <><ArrowUp className="w-2.5 h-2.5 mr-0.5 inline" />UPGRADE</>
                          ) : (
                            <><ArrowDown className="w-2.5 h-2.5 mr-0.5 inline" />DOWNGRADE</>
                          )}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{tier.tagline}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-black">${tier.price}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                    <p className={`text-xs font-bold ${priceDiff > 0 ? "text-primary" : "text-muted-foreground"}`}>
                      {priceDiff > 0 ? `+$${priceDiff}` : `-$${Math.abs(priceDiff)}`}/mo
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 mb-4 pl-11">
                  {tier.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">{f}</p>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full rounded-full uppercase font-bold tracking-wide text-sm ${
                    upgrade
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : ""
                  }`}
                  variant={upgrade ? "default" : "outline"}
                  onClick={() => setConfirmTier(tier.id)}
                >
                  {upgrade ? "Upgrade" : "Downgrade"} to {tier.name}
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info */}
      <Card className="p-5 bg-muted/30">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">You instruct, we execute.</strong> Changes take effect immediately. You can upgrade, downgrade, or pause at any time.
        </p>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmTier} onOpenChange={open => !open && setConfirmTier(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="uppercase tracking-wide">
              {isConfirmUpgrade ? "Upgrade" : "Downgrade"} Plan
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 pt-1">
                <p>
                  Switch from <strong>{currentTierData.name}</strong> to <strong>{confirmTierData?.name}</strong>?
                </p>
                {!isConfirmUpgrade && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <p className="text-sm text-destructive font-medium">You will lose access to:</p>
                    <ul className="mt-1.5 space-y-1">
                      {currentTierData.features
                        .filter(f => !confirmTierData?.features.some(cf => cf === f || cf.includes("Everything")))
                        .map((f, i) => (
                          <li key={i} className="text-sm text-destructive/80 flex items-start gap-1.5">
                            <span className="mt-0.5">•</span>{f}
                          </li>
                        ))
                      }
                    </ul>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  New monthly cost: <strong>${confirmTierData?.price}/mo</strong>. Changes take effect immediately.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmTier(null)} className="rounded-full">Cancel</Button>
            <Button
              onClick={confirmAndSwitch}
              className="rounded-full"
              variant={isConfirmUpgrade ? "default" : "destructive"}
            >
              Confirm {isConfirmUpgrade ? "Upgrade" : "Downgrade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
