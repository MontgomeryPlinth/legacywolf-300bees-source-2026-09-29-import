import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { User, Dog, FileText, Phone, Mail, ChevronRight, UserPlus, Trash2 } from "lucide-react";
import { useApp } from "../../../contexts/AppContext";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Checkbox } from "../../ui/checkbox";
import { PersonDetailSheet } from "../PersonDetailSheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";

export function PeopleManagement() {
  const { people, addPerson, updatePerson, deletePerson, primaryContactId, setPrimaryContact } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<string | null>(null);
  const [showPersonDetail, setShowPersonDetail] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [showPrimaryConfirm, setShowPrimaryConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    phone: "",
    email: "",
    roles: [] as string[],
    instructions: "",
    isPrimary: false
  });

  const getRoleIcon = (role: string) => {
    if (role.includes("Pet")) return Dog;
    if (role.includes("Estate")) return FileText;
    return User;
  };

  const availableRoles = [
    "Nominated Contact",
    "Pet Guardian",
    "Backup Pet Guardian",
    "Estate Recipient"
  ];

  const handleAdd = () => {
    setEditingPerson(null);
    setFormData({
      name: "",
      relationship: "",
      phone: "",
      email: "",
      roles: [],
      instructions: "",
      isPrimary: false
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (person: typeof people[0]) => {
    setEditingPerson(person.id);
    setFormData({
      name: person.name,
      relationship: person.relationship,
      phone: person.phone,
      email: person.email,
      roles: person.roles,
      instructions: person.instructions || "",
      isPrimary: person.id === primaryContactId
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name}?`)) {
      deletePerson(id);
      toast.success("Person removed", {
        description: `${name} has been removed from your contacts`
      });
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.relationship || !formData.phone || formData.roles.length === 0) {
      toast.error("Missing fields", {
        description: "Please fill in all required fields"
      });
      return;
    }

    // Check if changing primary and there's already a primary contact
    if (formData.isPrimary && formData.roles.includes("Nominated Contact")) {
      if (primaryContactId && primaryContactId !== editingPerson) {
        setShowPrimaryConfirm(true);
        return;
      }
    }

    submitForm();
  };

  const submitForm = (newPersonId?: string) => {
    let personId = editingPerson;

    if (editingPerson) {
      updatePerson(editingPerson, {
        name: formData.name,
        relationship: formData.relationship,
        phone: formData.phone,
        email: formData.email,
        roles: formData.roles,
        instructions: formData.instructions,
        status: "pending"
      });
      toast.success("Person updated", {
        description: `${formData.name} has been updated`
      });
    } else {
      const newPerson = {
        name: formData.name,
        relationship: formData.relationship,
        phone: formData.phone,
        email: formData.email,
        roles: formData.roles,
        instructions: formData.instructions,
        status: "pending" as const
      };
      addPerson(newPerson);
      
      // Get the newly added person's ID (it will be the last one)
      personId = Date.now().toString();
      
      toast.success("Person added", {
        description: `${formData.name} has been added. They will receive an invitation to verify.`
      });
    }

    // Set as primary contact if checkbox is checked
    if (formData.isPrimary && formData.roles.includes("Nominated Contact")) {
      setPrimaryContact(newPersonId || personId);
    } else if (!formData.isPrimary && primaryContactId === personId) {
      // Remove as primary if unchecked
      setPrimaryContact(null);
    }

    setIsDialogOpen(false);
    setShowPrimaryConfirm(false);
  };

  const toggleRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="font-black uppercase tracking-tight text-2xl">PEOPLE</h2>
        <p className="text-muted-foreground">
          Manage your nominated contacts and guardians
        </p>
      </div>

      {/* Add Person CTA */}
      <Button
        className="w-full rounded-full py-6 uppercase font-bold tracking-wide"
        size="lg"
        onClick={handleAdd}
      >
        <UserPlus className="w-5 h-5 mr-2" />
        Add Person
      </Button>

      {/* People List */}
      <div className="space-y-3">
        {people.map((person) => (
          <Card 
            key={person.id} 
            className="p-5 cursor-pointer hover:border-primary/50 transition-all"
            onClick={() => {
              setSelectedPersonId(person.id);
              setShowPersonDetail(true);
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg">{person.name}</h3>
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
                <p className="text-sm text-muted-foreground">{person.relationship}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{person.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{person.email}</span>
              </div>
            </div>

            {/* Roles */}
            <div className="flex flex-wrap gap-2">
              {person.roles.map((role) => {
                const Icon = getRoleIcon(role);
                return (
                  <Badge key={role} variant="secondary" className="text-xs">
                    <Icon className="w-3 h-3 mr-1" />
                    {role}
                  </Badge>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="p-5 bg-muted/30">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Verification required.</strong> Every person you nominate receives an invitation to accept their role. They'll see exactly what they're responsible for before an incident occurs.
        </p>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-wide">
              {editingPerson ? "Edit Person" : "Add Person"}
            </DialogTitle>
            <DialogDescription>
              {editingPerson
                ? "Update the person's details and roles"
                : "Add someone to your Legacy Wolf plan"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full name"
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship *</Label>
              <Input
                id="relationship"
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                placeholder="Friend, Family, Neighbor, etc."
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+61 4XX XXX XXX"
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className="rounded-lg"
              />
            </div>

            <div className="space-y-3">
              <Label>Roles *</Label>
              {availableRoles.map((role) => (
                <div key={role} className="flex items-center space-x-2">
                  <Checkbox
                    id={role}
                    checked={formData.roles.includes(role)}
                    onCheckedChange={() => toggleRole(role)}
                  />
                  <label
                    htmlFor={role}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {role}
                  </label>
                </div>
              ))}
            </div>

            {/* Primary Contact Checkbox - Only show if Nominated Contact role is selected */}
            {formData.roles.includes("Nominated Contact") && (
              <div className="flex items-center space-x-2 p-4 border border-primary/20 rounded-lg bg-primary/5">
                <Checkbox
                  id="isPrimary"
                  checked={formData.isPrimary}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPrimary: checked as boolean })}
                />
                <label
                  htmlFor="isPrimary"
                  className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Set as Primary Contact
                </label>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="instructions">Special Instructions</Label>
              <Textarea
                id="instructions"
                rows={4}
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Any specific instructions for this person..."
                className="rounded-lg resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-full">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="rounded-full">
              {editingPerson ? "Update" : "Add"} Person
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Person Detail Sheet */}
      <PersonDetailSheet
        open={showPersonDetail}
        onOpenChange={setShowPersonDetail}
        personId={selectedPersonId}
        onEdit={(personId) => {
          const person = people.find(p => p.id === personId);
          if (person) {
            handleEdit(person);
          }
        }}
      />

      {/* Primary Contact Confirmation Dialog */}
      <AlertDialog open={showPrimaryConfirm} onOpenChange={setShowPrimaryConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Primary Contact?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to change the primary contact. This will remove the current primary contact and set the new one.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => submitForm()}>Change Primary</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}