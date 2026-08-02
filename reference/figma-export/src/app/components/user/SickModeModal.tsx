import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Clock, Heart } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { useApp } from "../../contexts/AppContext";

interface SickModeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (endDate: Date, checkInHours: number) => void;
}

export function SickModeModal({ open, onOpenChange, onConfirm }: SickModeModalProps) {
  const { motionTimer, people, primaryContactId, pets } = useApp();
  const [duration, setDuration] = useState("5"); // days
  const [checkInInterval, setCheckInInterval] = useState("2"); // hours
  const [customHours, setCustomHours] = useState("");
  const [usingCustom, setUsingCustom] = useState(false);
  const customInputRef = useRef<HTMLInputElement>(null);

  const effectiveInterval = usingCustom ? (parseFloat(customHours) || 0) : parseInt(checkInInterval);

  const handlePresetClick = (hours: string) => {
    setCheckInInterval(hours);
    setUsingCustom(false);
    setCustomHours("");
  };

  const handleCustomClick = () => {
    setUsingCustom(true);
    setCheckInInterval("");
    setTimeout(() => customInputRef.current?.focus(), 50);
  };

  const handleCustomInput = (val: string) => {
    setCustomHours(val);
    const n = parseFloat(val);
    if (!isNaN(n) && n > 0) setCheckInInterval(String(n));
  };

  const handleConfirm = () => {
    if (effectiveInterval <= 0) {
      toast.error("Invalid check-in time", { description: "Please select or enter a valid check-in interval." });
      return;
    }
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(duration));
    onConfirm(endDate, effectiveInterval);
    toast.success("Sick Mode activated", {
      description: `Tighter monitoring active for ${duration} days. Check-in every ${effectiveInterval}h.`
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl uppercase tracking-wide font-black">
            Sick Mode
          </DialogTitle>
          <DialogDescription className="text-center pt-2 text-base">
            For when you're unwell and at home. We check in more often. People you trust get a quiet heads-up.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Duration Selector */}
          <div className="space-y-3">
            <Label className="uppercase text-xs font-bold tracking-wide">
              How Long
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {["1", "3", "5", "7", "14"].map((days) => (
                <Button
                  key={days}
                  variant={duration === days ? "default" : "outline"}
                  onClick={() => setDuration(days)}
                  className={`rounded-full h-12 font-bold ${
                    duration === days
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                >
                  {days}d
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum 14 days. You can extend or end early.
            </p>
          </div>

          {/* Check-in Interval Selector */}
          <div className="space-y-3">
            <Label className="uppercase text-xs font-bold tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Check In Every
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {["2", "4", "8"].map((hours) => (
                <Button
                  key={hours}
                  variant={!usingCustom && checkInInterval === hours ? "default" : "outline"}
                  onClick={() => handlePresetClick(hours)}
                  className={`rounded-full h-12 font-bold ${
                    !usingCustom && checkInInterval === hours
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                >
                  {hours}h
                </Button>
              ))}
              {/* Custom button / input */}
              <button
                type="button"
                onClick={handleCustomClick}
                className={`rounded-full h-12 font-bold border-2 transition-all flex items-center justify-center px-2 ${
                  usingCustom
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50 text-muted-foreground"
                }`}
              >
                {usingCustom ? (
                  <Input
                    ref={customInputRef}
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={customHours}
                    onChange={e => handleCustomInput(e.target.value)}
                    onClick={e => e.stopPropagation()}
                    placeholder="h"
                    className="w-full h-8 text-center text-sm font-bold border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                ) : (
                  <span className="text-sm font-bold">Custom</span>
                )}
              </button>
            </div>
            {usingCustom && customHours && parseFloat(customHours) > 0 && (
              <p className="text-xs text-primary font-medium">
                Check-in every {parseFloat(customHours)}h
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Your usual timer is {motionTimer.intervalHours}h. Sick Mode shortens it.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-card border-2 border-primary/30 rounded-2xl p-4 space-y-2">
            <p className="text-sm font-medium"><strong>What happens:</strong></p>
            <ul className="text-sm text-muted-foreground space-y-1 pl-4">
              {(() => {
                const primaryContact = people.find(p => p.id === primaryContactId);
                const petGuardian = pets.length > 0
                  ? people.find(p => p.id === pets[0].guardianId)
                  : null;
                return (
                  <>
                    {primaryContact && (
                      <li>• {primaryContact.name} (Primary Contact) gets a quiet heads-up</li>
                    )}
                    {petGuardian && pets.length > 0 && (
                      <li>• {petGuardian.name} (Pet Guardian) knows {pets.map(p => p.name).join(", ")} may need a hand</li>
                    )}
                    <li>• Motion timer shortens to {effectiveInterval > 0 ? effectiveInterval : "?"}h intervals</li>
                    <li>• Your active instruction stays the same</li>
                  </>
                );
              })()}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-full uppercase font-medium tracking-wide"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="rounded-full uppercase font-bold tracking-wide bg-primary hover:bg-primary/90"
            >
              Start Sick Mode
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
