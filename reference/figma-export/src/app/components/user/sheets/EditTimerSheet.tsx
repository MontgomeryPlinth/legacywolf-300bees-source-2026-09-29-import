import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../ui/sheet";
import { Button } from "../../ui/button";
import { useApp } from "../../../contexts/AppContext";
import { Clock, Check, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

interface EditTimerSheetProps {
  open: boolean;
  onClose: () => void;
}

const PRESET_OPTIONS = [
  { label: "4 hours", hours: 4, description: "Active day, frequent check-ins" },
  { label: "8 hours", hours: 8, description: "Standard workday coverage" },
  { label: "12 hours", hours: 12, description: "Half-day monitoring" },
  { label: "16 hours", hours: 16, description: "Default — overnight safe window" },
  { label: "24 hours", hours: 24, description: "Full day, low-frequency check-in" },
];

const GRACE_PRESETS = [
  { label: "1h", hours: 1 },
  { label: "2h", hours: 2 },
  { label: "4h", hours: 4 },
  { label: "8h", hours: 8 },
  { label: "12h", hours: 12 },
];

export function EditTimerSheet({ open, onClose }: EditTimerSheetProps) {
  const { motionTimer, updateTimerInterval, updateGracePeriod } = useApp();
  const [selected, setSelected] = useState(motionTimer.intervalHours);
  const [customValue, setCustomValue] = useState("");
  const [usingCustom, setUsingCustom] = useState(false);
  const [selectedGrace, setSelectedGrace] = useState(motionTimer.gracePeriodHours);

  const isPreset = PRESET_OPTIONS.some(p => p.hours === motionTimer.intervalHours);

  const handlePresetClick = (hours: number) => {
    setSelected(hours);
    setUsingCustom(false);
    setCustomValue("");
  };

  const handleCustomChange = (val: string) => {
    setCustomValue(val);
    const n = parseFloat(val);
    if (!isNaN(n) && n > 0) {
      setSelected(n);
      setUsingCustom(true);
    } else {
      setUsingCustom(false);
    }
  };

  const activeIsPreset = PRESET_OPTIONS.some(p => p.hours === selected) && !usingCustom;

  const displayLabel = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours % 24 === 0) return `${hours / 24}d`;
    return `${hours}h`;
  };

  const handleSave = () => {
    if (!selected || selected <= 0) {
      toast.error("Invalid duration", { description: "Please enter a valid number of hours." });
      return;
    }
    updateTimerInterval(selected);
    updateGracePeriod(selectedGrace);
    toast.success(`Motion timer set to ${displayLabel(selected)}`, {
      description: `Grace period: ${selectedGrace}h after timer expires before response.`,
    });
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="inset-x-2 bottom-2 rounded-2xl max-h-[90vh] overflow-y-auto pb-safe">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold uppercase tracking-wide">
            <Clock className="w-5 h-5 text-primary" />
            Edit Motion Timer
          </SheetTitle>
          <p className="text-sm text-muted-foreground text-left">
            Set how long Legacy Wolf waits before triggering a silent check-in alert.
          </p>
        </SheetHeader>

        <div className="space-y-3 mb-4">
          {PRESET_OPTIONS.map(({ label, hours, description }) => {
            const isSelected = selected === hours && !usingCustom;
            return (
              <button
                key={hours}
                onClick={() => handlePresetClick(hours)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-150 text-left ${
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div>
                  <p className={`font-bold text-base ${isSelected ? "text-primary" : "text-foreground"}`}>
                    {label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}

          {/* Custom duration */}
          <div
            className={`rounded-xl border-2 transition-all duration-150 ${
              usingCustom ? "border-primary bg-primary/10" : "border-border bg-card"
            }`}
          >
            <div className="flex items-center gap-4 p-4">
              <div className="flex-1">
                <p className={`font-bold text-base ${usingCustom ? "text-primary" : "text-foreground"}`}>
                  Custom
                </p>
                {usingCustom && selected > 0 && (
                  <p className="text-xs text-primary font-medium mt-0.5">{displayLabel(selected)}</p>
                )}
              </div>

              {/* Stepper */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    const cur = parseFloat(customValue) || 0;
                    const next = Math.max(0.5, cur - 0.5);
                    handleCustomChange(String(next));
                  }}
                  className="w-11 h-11 rounded-full border-2 border-border bg-muted flex items-center justify-center hover:border-primary hover:bg-primary/10 active:scale-95 transition-all"
                >
                  <Minus className="w-5 h-5" />
                </button>

                <div className="w-14 text-center">
                  <p className={`text-2xl font-black tabular-nums ${usingCustom ? "text-primary" : "text-foreground"}`}>
                    {customValue || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">hrs</p>
                </div>

                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    const cur = parseFloat(customValue) || 0;
                    const next = cur + 0.5;
                    handleCustomChange(String(next));
                  }}
                  className="w-11 h-11 rounded-full border-2 border-border bg-muted flex items-center justify-center hover:border-primary hover:bg-primary/10 active:scale-95 transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {usingCustom && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grace Period */}
        <div className="mt-6 space-y-3">
          <div>
            <p className="text-xs uppercase tracking-wide font-bold text-muted-foreground">Grace Period</p>
            <p className="text-xs text-muted-foreground mt-1">
              After your timer expires, we'll wait this long before sending a responder. You can still check in during this window.
            </p>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {GRACE_PRESETS.map(({ label, hours }) => {
              const isSelected = selectedGrace === hours;
              return (
                <button
                  key={hours}
                  onClick={() => setSelectedGrace(hours)}
                  className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground hover:border-primary/40"
                  }`}
                >
                  {label}
                  {hours === 4 && (
                    <span className="block text-[9px] font-normal text-muted-foreground mt-0.5">default</span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2.5">
            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Timer expires → <strong className="text-foreground">{selectedGrace}h grace window</strong> → responder dispatched if no check-in
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-primary text-primary-foreground font-bold"
            onClick={handleSave}
            disabled={selected === motionTimer.intervalHours && selectedGrace === motionTimer.gracePeriodHours && !usingCustom}
          >
            Save Timer
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
