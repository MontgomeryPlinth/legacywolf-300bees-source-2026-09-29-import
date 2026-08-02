import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { CheckCircle, Shield, User, Dog, Lock, BatteryLow } from "lucide-react";
import { useState, useEffect } from "react";
import { useApp } from "../../contexts/AppContext";
import { toast } from "sonner";

interface EditInstructionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditInstructionsSheet({ open, onOpenChange }: EditInstructionsSheetProps) {
  const { plan, people, pets, updateActiveServices } = useApp();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // Initialize with current active services
  useEffect(() => {
    if (open) {
      setSelectedServices([...plan.activeServices]);
    }
  }, [open, plan.activeServices]);

  const primaryPet = pets.find(p => p.isPrimary);
  const primaryGuardian = primaryPet ? people.find(p => p.id === primaryPet.guardianId) : null;
  const nominatedContact = people.find(p => p.roles.includes("Nominated Contact"));

  const availableServices = [
    {
      id: "attend-check",
      name: "Attend & Check",
      description: "If motion timer expires a SMS will be sent to your primary contact",
      icon: Shield,
      available: true,
      needsSetup: false,
      setupMessage: "",
    },
    {
      id: "pet-guardian",
      name: "Pet Guardian",
      description: primaryPet && primaryGuardian 
        ? `${primaryPet.name} will be cared for and handed to ${primaryGuardian.name}`
        : "Your pet will be cared for and handed to their guardian",
      icon: Dog,
      available: true,
      needsSetup: !primaryPet || !primaryGuardian,
      setupMessage: "⚠️ Set up a pet and guardian to activate this service",
    },
    {
      id: "reputation-guard",
      name: "Reputation Guard",
      description: "Pants On Service active — 3 items secured",
      icon: Lock,
      available: true,
      needsSetup: false,
      setupMessage: "",
    },
    {
      id: "friend-alert",
      name: "Friend Alert",
      description: nominatedContact
        ? `Your nominated contact ${nominatedContact.name} will be notified`
        : "Your nominated contact will be notified",
      icon: User,
      available: true,
      needsSetup: !nominatedContact,
      setupMessage: "⚠️ Set up a nominated contact to activate this service",
    },
    {
      id: "battery-rule",
      name: "Battery Rule",
      description: "Define what happens if your phone goes offline unexpectedly",
      icon: BatteryLow,
      available: true,
      needsSetup: false,
      setupMessage: "",
    },
  ];

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const handleSave = () => {
    // Update the plan with new active services
    updateActiveServices(selectedServices);
    
    toast.success("Instructions updated", {
      description: `${selectedServices.length} of ${availableServices.filter(s => s.available).length} services active`
    });
    
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="inset-x-2 bottom-2 rounded-2xl h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl uppercase tracking-wide font-black">
            Edit Active Instruction
          </SheetTitle>
          <SheetDescription className="text-base">
            Select the services you want activated when your motion timer expires. These are the actions we'll take on your behalf.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 pt-6 pb-24">
          {/* Current Tier Badge */}
          <div className="bg-card border-2 border-primary/30 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide font-bold text-muted-foreground">Current Plan</p>
                <p className="text-lg font-bold text-primary">{plan.tier.toUpperCase().replace("-", " ")}</p>
              </div>
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Service Options */}
          <div className="space-y-4">
            <Label className="uppercase text-xs font-bold tracking-wide">
              Available Services
            </Label>
            
            {availableServices.map((service) => {
              const Icon = service.icon;
              const isSelected = selectedServices.includes(service.id);
              const isDisabled = !service.available;

              return (
                <button
                  key={service.id}
                  onClick={() => service.available && toggleService(service.id)}
                  disabled={isDisabled}
                  className={`w-full text-left transition-all ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-accent'
                  }`}
                >
                  <div className={`border-2 rounded-2xl p-5 ${
                    isSelected 
                      ? 'border-primary bg-primary/5' 
                      : isDisabled 
                        ? 'border-border bg-card' 
                        : 'border-border bg-card'
                  }`}>
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <div className="pt-1 pointer-events-none">
                        <Checkbox
                          checked={isSelected}
                          disabled={isDisabled}
                          className={isSelected ? "data-[state=checked]:bg-primary data-[state=checked]:border-primary" : ""}
                        />
                      </div>

                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-primary/20' : 'bg-accent'
                      }`}>
                        <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-base">{service.name}</h3>
                          {isSelected && (
                            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {service.description}
                        </p>
                        {isDisabled && (
                          <p className="text-xs text-yellow-600 mt-2">
                            ⚠️ Not available - complete setup first
                          </p>
                        )}
                        {service.needsSetup && (
                          <p className="text-xs text-yellow-600 mt-2">
                            {service.setupMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Info Box */}
          <div className="bg-accent/50 border border-border rounded-2xl p-4">
            <p className="text-sm font-medium mb-2">How it works</p>
            <ul className="text-sm text-muted-foreground space-y-1 pl-4">
              <li>• Selected services activate when your motion timer expires</li>
              <li>• You can change these anytime</li>
              <li>• Some services require setup (pets, contacts, etc.)</li>
              <li>• Your plan tier determines available options</li>
            </ul>
          </div>
        </div>

        {/* Fixed Footer with Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-background border-t border-border">
          <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-full uppercase font-medium tracking-wide"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="rounded-full uppercase font-bold tracking-wide bg-primary hover:bg-primary/90"
              disabled={selectedServices.length === 0}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}