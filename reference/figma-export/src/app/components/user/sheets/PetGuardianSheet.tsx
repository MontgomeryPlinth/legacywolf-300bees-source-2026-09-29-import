import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../ui/sheet";
import { Dog, User, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../../ui/button";
import { toast } from "sonner";
import type { Pet, Person } from "../../../contexts/AppContext";

interface Props {
  open: boolean;
  onClose: () => void;
  pets: Pet[];
  people: Person[];
  updatePet: (id: string, updates: Partial<Pet>) => void;
}

export function PetGuardianSheet({ open, onClose, pets, people, updatePet }: Props) {
  const [expandedPetId, setExpandedPetId] = useState<string | null>(
    pets.length === 1 ? pets[0].id : null
  );

  const guardians = people.filter(
    p => p.roles.includes("Pet Guardian") || p.roles.includes("Backup Pet Guardian")
  );

  const handleSelect = (pet: Pet, guardianId: string) => {
    const guardian = people.find(p => p.id === guardianId);
    updatePet(pet.id, { guardianId });
    toast.success(`${pet.name}'s guardian updated to ${guardian?.name ?? "selected contact"}`);
    // If multiple pets, collapse and let user move to next — if single pet, close
    if (pets.length === 1) {
      onClose();
    } else {
      setExpandedPetId(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="bottom" className="inset-x-2 bottom-2 rounded-2xl max-h-[85vh] overflow-y-auto pb-safe">
        <SheetHeader className="mb-5">
          <SheetTitle className="flex items-center gap-2 uppercase tracking-wide font-black">
            <Dog className="w-5 h-5 text-primary" />
            Pet Guardian
          </SheetTitle>
          <p className="text-sm text-muted-foreground text-left">
            {pets.length === 1
              ? `Choose who cares for ${pets[0].name} if your timer expires.`
              : "Assign a guardian for each pet. Tap a pet to change their guardian."}
          </p>
        </SheetHeader>

        <div className="space-y-3 mb-6">
          {pets.map(pet => {
            const currentGuardian = people.find(p => p.id === pet.guardianId);
            const isExpanded = expandedPetId === pet.id;

            return (
              <div
                key={pet.id}
                className={`border-2 rounded-xl overflow-hidden transition-all ${
                  isExpanded ? "border-primary" : "border-border"
                }`}
              >
                {/* Pet row — tap to expand guardian picker */}
                <button
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedPetId(isExpanded ? null : pet.id)}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Dog className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{pet.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {currentGuardian
                        ? `Guardian: ${currentGuardian.name}`
                        : "No guardian assigned"}
                    </p>
                  </div>
                  {isExpanded
                    ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                </button>

                {/* Inline guardian options */}
                {isExpanded && (
                  <div className="border-t border-border bg-muted/20 p-3 space-y-2">
                    {guardians.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-3">
                        No guardians set up. Add people with the Pet Guardian role in the People tab.
                      </p>
                    )}
                    {guardians.map(person => {
                      const isSelected = pet.guardianId === person.id;
                      return (
                        <button
                          key={person.id}
                          onClick={() => handleSelect(pet, person.id)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg border transition-all text-left ${
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-border bg-card hover:border-primary/40"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isSelected ? "bg-primary/20" : "bg-muted"
                          }`}>
                            <User className={`w-4 h-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-semibold ${isSelected ? "text-primary" : ""}`}>
                              {person.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{person.roles.join(", ")}</p>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Button variant="outline" className="w-full rounded-full" onClick={onClose}>
          Done
        </Button>
      </SheetContent>
    </Sheet>
  );
}
