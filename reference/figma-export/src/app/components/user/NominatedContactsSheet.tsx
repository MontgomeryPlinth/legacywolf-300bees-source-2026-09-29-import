import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { X, UserPlus, Phone, Mail, ChevronRight } from "lucide-react";
import { useApp } from "../../contexts/AppContext";

interface NominatedContactsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNew: () => void;
  onViewPerson: (personId: string) => void;
}

export function NominatedContactsSheet({ 
  open, 
  onOpenChange, 
  onAddNew,
  onViewPerson 
}: NominatedContactsSheetProps) {
  const { people } = useApp();
  
  // Filter for nominated contacts
  const nominatedContacts = people.filter(p => 
    p.roles.includes("Nominated Contact")
  );

  if (!open) return null;

  return (
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
              Nominated Contacts
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {nominatedContacts.length} {nominatedContacts.length === 1 ? 'contact' : 'contacts'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Scrollable Contact List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {nominatedContacts.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                <UserPlus className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No contacts yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add someone you trust to be notified in case of emergency
                </p>
              </div>
            </div>
          ) : (
            nominatedContacts.map((contact) => (
              <Card 
                key={contact.id}
                className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => {
                  onViewPerson(contact.id);
                  onOpenChange(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-base">{contact.name}</h3>
                      <Badge 
                        variant={contact.status === "active" ? "default" : "outline"}
                        className="text-xs"
                      >
                        {contact.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {contact.relationship}
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span>{contact.phone}</span>
                      </div>
                      {contact.email && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span>{contact.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Footer with Add Button */}
        <div className="p-6 border-t border-border">
          <Button
            className="w-full rounded-full py-6 uppercase font-bold tracking-wide"
            onClick={() => {
              onAddNew();
              onOpenChange(false);
            }}
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Add New Contact
          </Button>
        </div>
      </div>
    </div>
  );
}
