import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { X, Check, ChevronRight, User } from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { toast } from "sonner";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface PrimaryContactSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrimaryContactSheet({ open, onOpenChange }: PrimaryContactSheetProps) {
  const { people, primaryContactId, setPrimaryContact } = useApp();
  const [pendingContactId, setPendingContactId] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Filter for nominated contacts
  const nominatedContacts = people.filter(p => 
    p.roles.includes("Nominated Contact")
  );

  if (!open) return null;

  const handleSelectContact = (personId: string) => {
    // If there's already a primary contact, show confirmation
    if (primaryContactId && primaryContactId !== personId) {
      setPendingContactId(personId);
      setShowConfirmDialog(true);
    } else {
      // No primary contact set yet, or removing current primary
      setPrimaryContact(personId);
      const person = people.find(p => p.id === personId);
      toast.success("Primary contact updated", {
        description: `${person?.name} is now your primary contact`
      });
      onOpenChange(false);
    }
  };

  const confirmChange = () => {
    if (pendingContactId) {
      setPrimaryContact(pendingContactId);
      const person = people.find(p => p.id === pendingContactId);
      toast.success("Primary contact changed", {
        description: `${person?.name} is now your primary contact`
      });
      setShowConfirmDialog(false);
      setPendingContactId(null);
      onOpenChange(false);
    }
  };

  const currentPrimary = people.find(p => p.id === primaryContactId);

  return (
    <>
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
        onClick={() => onOpenChange(false)}
      >
        <div 
          className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">
                Primary Contact
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Select your main emergency contact
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full flex-shrink-0"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Current Primary */}
          {currentPrimary && (
            <div className="p-6 border-b border-border bg-muted/30">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                Current Primary
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-bold">{currentPrimary.name}</p>
                  <p className="text-sm text-muted-foreground">{currentPrimary.relationship}</p>
                </div>
                <Check className="w-5 h-5 text-primary" />
              </div>
            </div>
          )}

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto p-6">
            {nominatedContacts.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No nominated contacts</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add a nominated contact first
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {nominatedContacts.map((person) => {
                  const isPrimary = person.id === primaryContactId;
                  
                  return (
                    <Card 
                      key={person.id} 
                      className={`p-4 cursor-pointer hover:border-primary/50 transition-all ${
                        isPrimary ? "border-primary bg-primary/5" : ""
                      }`}
                      onClick={() => handleSelectContact(person.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isPrimary ? "bg-primary/20" : "bg-muted"
                        }`}>
                          <User className={`w-5 h-5 ${
                            isPrimary ? "text-primary" : "text-muted-foreground"
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold truncate">{person.name}</h3>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                person.status === "verified"
                                  ? "border-primary text-primary"
                                  : "border-muted-foreground text-muted-foreground"
                              }`}
                            >
                              {person.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {person.relationship}
                          </p>
                        </div>
                        {isPrimary ? (
                          <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Primary Contact?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change your primary contact from{" "}
              <strong>{currentPrimary?.name}</strong> to{" "}
              <strong>{people.find(p => p.id === pendingContactId)?.name}</strong>?
              <br /><br />
              Your primary contact will be the first person notified in an emergency.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowConfirmDialog(false);
              setPendingContactId(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmChange}>
              Change Contact
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
