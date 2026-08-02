import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { X, Edit, Trash2, Phone, Mail, User, FileText, Send, Link2 } from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { toast } from "sonner";

interface PersonDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personId: string | null;
  onEdit: (personId: string) => void;
}

export function PersonDetailSheet({ 
  open, 
  onOpenChange, 
  personId,
  onEdit 
}: PersonDetailSheetProps) {
  const { people, deletePerson } = useApp();
  
  const person = people.find(p => p.id === personId);

  if (!open || !person) return null;

  const handleDelete = () => {
    if (confirm(`Are you sure you want to remove ${person.name}?`)) {
      deletePerson(person.id);
      toast.success("Person removed", {
        description: `${person.name} has been removed from your contacts`
      });
      onOpenChange(false);
    }
  };

  const handleResendInvite = () => {
    // Simulate sending invite via email/SMS
    toast.success("Invite sent!", {
      description: `Invitation resent to ${person.name} via ${person.email ? 'email' : 'SMS'}`
    });
  };

  const handleCopyInviteLink = () => {
    // Generate unique invite link with person ID and account reference
    const inviteLink = `${window.location.origin}/accept-invite?ref=${personId}&role=${encodeURIComponent(person.roles[0])}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(inviteLink).then(() => {
      toast.success("Link copied!", {
        description: "Invitation link copied to clipboard. Share it with your contact."
      });
    }).catch(() => {
      toast.error("Failed to copy", {
        description: "Please try again"
      });
    });
  };

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
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black uppercase tracking-tight">
              {person.name}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {person.relationship}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge 
              variant={person.status === "active" ? "default" : "outline"}
              className="text-sm px-4 py-1"
            >
              {person.status.toUpperCase()}
            </Badge>
          </div>

          {/* Contact Information */}
          <Card className="p-4 space-y-3">
            <h3 className="text-xs uppercase font-bold tracking-wide text-muted-foreground">
              Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase text-muted-foreground">Phone</p>
                  <p className="font-medium">{person.phone}</p>
                </div>
              </div>
              {person.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase text-muted-foreground">Email</p>
                    <p className="font-medium break-all">{person.email}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Roles */}
          <Card className="p-4 space-y-3">
            <h3 className="text-xs uppercase font-bold tracking-wide text-muted-foreground">
              Roles
            </h3>
            <div className="flex flex-wrap gap-2">
              {person.roles.map((role) => (
                <Badge key={role} variant="secondary" className="text-xs">
                  {role}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Instructions */}
          {person.instructions && (
            <Card className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <h3 className="text-xs uppercase font-bold tracking-wide text-muted-foreground">
                  Special Instructions
                </h3>
              </div>
              <p className="text-sm leading-relaxed">
                {person.instructions}
              </p>
            </Card>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border space-y-3">
          {/* Show invite actions only for pending contacts */}
          {person.status === "pending" && (
            <>
              <Card className="p-4 mb-3 bg-muted/30 border-primary/20">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Invitation pending.</strong> Send the invite link to {person.name} so they can accept their role.
                </p>
              </Card>
              
              <Button
                variant="default"
                className="w-full rounded-full py-6 uppercase font-bold tracking-wide"
                onClick={handleResendInvite}
              >
                <Send className="w-5 h-5 mr-2" />
                Resend Invite
              </Button>
              
              <Button
                variant="outline"
                className="w-full rounded-full py-4 uppercase font-medium tracking-wide"
                onClick={handleCopyInviteLink}
              >
                <Link2 className="w-4 h-4 mr-2" />
                Copy Invite Link
              </Button>
            </>
          )}

          <Button
            className="w-full rounded-full py-6 uppercase font-bold tracking-wide"
            onClick={() => {
              onEdit(person.id);
              onOpenChange(false);
            }}
          >
            <Edit className="w-5 h-5 mr-2" />
            Edit Details
          </Button>
          
          <Button
            variant="destructive"
            className="w-full rounded-full py-4 uppercase font-medium tracking-wide"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove Contact
          </Button>
        </div>
      </div>
    </div>
  );
}