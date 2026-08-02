import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../../ui/sheet";
import { MessageSquare, PhoneCall, MapPin, UserPlus, Dog } from "lucide-react";
import { useApp } from "../../../contexts/AppContext";
import { type QueueStepType, type ResponseQueueStep, validateQueue } from "../../../contexts/AppContext";
import { toast } from "sonner";

interface AddQueueStepSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PoolOption {
  key: string;
  type: QueueStepType;
  label: string;
  subtitle?: string;
  icon: React.ElementType;
  contactId?: string;
  authorityLevel?: "knock-only" | "enter";
  locked?: boolean;
  lockReason?: string;
}

const ICON_CIRCLE = "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0";

export function AddQueueStepSheet({ open, onOpenChange }: AddQueueStepSheetProps) {
  const { plan, people, pets, responseQueue, addQueueStep } = useApp();

  const isAdvancedPlan = plan.tier === "full" || plan.tier === "attend-check" || plan.tier === "pet-guardian";

  // Build the full pool dynamically
  const pool: { section: string; options: PoolOption[] }[] = [];

  // ── Section 1: To me ──────────────────────────────────────────────────────
  pool.push({
    section: "To me",
    options: [
      { key: "text-user", type: "text-user", label: "Text to me", subtitle: "SMS asking you to check in", icon: MessageSquare },
      { key: "call-user", type: "call-user", label: "Call to me", subtitle: "Press 1 to confirm you're safe", icon: PhoneCall },
    ],
  });

  // ── Section 2: Responder ──────────────────────────────────────────────────
  pool.push({
    section: "Responder",
    options: [
      {
        key: "attend-knock",
        type: "attend-address",
        label: "Attend — knock only",
        subtitle: "Responder checks on you, does not enter",
        icon: MapPin,
        authorityLevel: "knock-only",
        locked: !isAdvancedPlan,
        lockReason: "Requires Advanced plan",
      },
      {
        key: "attend-enter",
        type: "attend-address",
        label: "Attend — enter if needed",
        subtitle: "Responder may enter if there's no answer",
        icon: MapPin,
        authorityLevel: "enter",
        locked: !isAdvancedPlan,
        lockReason: "Requires Advanced plan",
      },
    ],
  });

  // ── Section 3: Per contact ────────────────────────────────────────────────
  const contactOptions: PoolOption[] = [];
  people.forEach((person) => {
    contactOptions.push({
      key: `text-${person.id}`,
      type: "text-contact",
      label: `Text ${person.name}`,
      subtitle: person.roles.join(", "),
      icon: UserPlus,
      contactId: person.id,
    });
    contactOptions.push({
      key: `call-${person.id}`,
      type: "call-contact",
      label: `Call ${person.name}`,
      subtitle: person.roles.join(", "),
      icon: PhoneCall,
      contactId: person.id,
    });
  });
  if (contactOptions.length > 0) {
    pool.push({ section: "Contacts", options: contactOptions });
  }

  // ── Section 4: Pet guardian contacts ─────────────────────────────────────
  const guardianOptions: PoolOption[] = [];
  pets.forEach((pet) => {
    if (pet.guardianId) {
      const guardian = people.find(p => p.id === pet.guardianId);
      if (guardian) {
        guardianOptions.push({
          key: `text-guardian-${pet.id}`,
          type: "text-contact",
          label: `Text ${guardian.name}`,
          subtitle: `Guardian for ${pet.name}`,
          icon: Dog,
          contactId: guardian.id,
        });
        guardianOptions.push({
          key: `call-guardian-${pet.id}`,
          type: "call-contact",
          label: `Call ${guardian.name}`,
          subtitle: `Guardian for ${pet.name}`,
          icon: Dog,
          contactId: guardian.id,
        });
      }
    }
    if (pet.backupGuardianId) {
      const backup = people.find(p => p.id === pet.backupGuardianId);
      if (backup) {
        guardianOptions.push({
          key: `text-backup-${pet.id}`,
          type: "text-contact",
          label: `Text ${backup.name}`,
          subtitle: `Backup guardian for ${pet.name}`,
          icon: Dog,
          contactId: backup.id,
        });
        guardianOptions.push({
          key: `call-backup-${pet.id}`,
          type: "call-contact",
          label: `Call ${backup.name}`,
          subtitle: `Backup guardian for ${pet.name}`,
          icon: Dog,
          contactId: backup.id,
        });
      }
    }
  });
  if (guardianOptions.length > 0) {
    pool.push({ section: "Pet guardians", options: guardianOptions });
  }

  const handleAdd = (opt: PoolOption) => {
    if (opt.locked) return;

    const payload: Omit<ResponseQueueStep, "id"> = { type: opt.type };
    if (opt.contactId) payload.contactId = opt.contactId;
    if (opt.authorityLevel) payload.authorityLevel = opt.authorityLevel;

    // Duplicate check — same type + same contactId + same authorityLevel
    const isDuplicate = responseQueue.staged.some(
      s => s.type === opt.type && s.contactId === opt.contactId && s.authorityLevel === opt.authorityLevel
    );
    if (isDuplicate) {
      toast.error("This step already exists in your queue.");
      return;
    }

    // Constraint preview
    const preview = [...responseQueue.staged, { ...payload, id: "preview" }];
    const err = validateQueue(preview);
    if (err) { toast.error(err); return; }

    addQueueStep(payload);
    toast.success("Step added");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="inset-x-2 bottom-2 rounded-2xl h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl uppercase tracking-wide font-black">Add a Step</SheetTitle>
          <SheetDescription>Choose what happens next in your escalation queue.</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 pt-5 pb-10">
          {pool.map(({ section, options }) => (
            <div key={section} className="space-y-2">
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground px-1">
                {section}
              </p>

              <div className="space-y-2">
                {options.map((opt) => {
                  const Icon = opt.icon;

                  return (
                    <button
                      key={opt.key}
                      disabled={opt.locked}
                      onClick={() => handleAdd(opt)}
                      className={`w-full flex items-center gap-3 border rounded-xl p-3.5 text-left transition-all ${
                        opt.locked
                          ? "border-border bg-card opacity-40 cursor-not-allowed"
                          : "border-border bg-card hover:border-primary/50 hover:bg-primary/5 active:scale-[0.99]"
                      }`}
                    >
                      {/* Icon */}
                      <div className={`${ICON_CIRCLE} ${opt.locked ? "bg-accent" : "bg-primary"}`}>
                        <Icon
                          className={opt.locked ? "text-muted-foreground" : "text-black"}
                          style={{ width: 18, height: 18, strokeWidth: 2.5 }}
                        />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{opt.label}</p>
                        {opt.subtitle && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{opt.subtitle}</p>
                        )}
                        {opt.locked && opt.lockReason && (
                          <p className="text-xs text-amber-500 mt-0.5 font-medium">{opt.lockReason}</p>
                        )}
                      </div>

                      {/* Add indicator */}
                      {!opt.locked && (
                        <div className="w-6 h-6 rounded-full border border-border flex items-center justify-center flex-shrink-0 text-muted-foreground">
                          <span className="text-sm font-bold leading-none">+</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
