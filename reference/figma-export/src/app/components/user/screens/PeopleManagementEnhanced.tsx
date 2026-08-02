import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { User, Phone, Mail, ChevronRight, UserPlus, Trash2 } from "lucide-react";
import { useApp } from "../../../contexts/AppContext";
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormData } from "../../../../lib/validations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Checkbox } from "../../ui/checkbox";

export function PeopleManagement() {
  const { people, addPerson, updatePerson, deletePerson } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<string | null>(null);

  const availableRoles = [
    "Nominated Contact",
    "Pet Guardian",
    "Backup Pet Guardian",
    "Estate Recipient"
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      relationship: "",
      phone: "",
      email: "",
      roles: [],
      instructions: ""
    },
  });

  const selectedRoles = watch("roles");

  const handleAdd = () => {
    setEditingPerson(null);
    reset({
      name: "",
      relationship: "",
      phone: "",
      email: "",
      roles: [],
      instructions: ""
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (person: typeof people[0]) => {
    setEditingPerson(person.id);
    reset({
      name: person.name,
      relationship: person.relationship,
      phone: person.phone,
      email: person.email,
      roles: person.roles,
      instructions: person.instructions || ""
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

  const toggleRole = (role: string) => {
    const current = selectedRoles || [];
    if (current.includes(role)) {
      setValue("roles", current.filter(r => r !== role));
    } else {
      setValue("roles", [...current, role]);
    }
  };

  const getRoleIcon = (role: string) => {
    if (role.includes("Pet")) return "🐾";
    if (role.includes("Estate")) return "📄";
    return "👤";
  };

  const onSubmit = (data: ContactFormData) => {
    if (editingPerson) {
      updatePerson(editingPerson, {
        ...data,
        status: "pending"
      });
      toast.success("Person updated", {
        description: `${data.name} has been updated`
      });
    } else {
      addPerson({
        ...data,
        status: "pending"
      });
      toast.success("Person added", {
        description: `${data.name} has been added. They will receive an invitation to verify.`
      });
    }

    setIsDialogOpen(false);
    reset();
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
          <Card key={person.id} className="p-5 cursor-pointer hover:border-primary/50 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1" onClick={() => handleEdit(person)}>
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
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(person.id, person.name);
                  }}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </div>
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
              {person.roles.map((role) => (
                <Badge key={role} variant="secondary" className="text-xs">
                  <span className="mr-1">{getRoleIcon(role)}</span>
                  {role}
                </Badge>
              ))}
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Full name"
                className="rounded-lg"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship *</Label>
              <Input
                id="relationship"
                placeholder="Friend, Family, Neighbor, etc."
                className="rounded-lg"
                {...register("relationship")}
              />
              {errors.relationship && (
                <p className="text-sm text-destructive">{errors.relationship.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                placeholder="+61 XXX XXX XXX"
                className="rounded-lg"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                className="rounded-lg"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label>Roles *</Label>
              {availableRoles.map((role) => (
                <div key={role} className="flex items-center space-x-2">
                  <Checkbox
                    id={role}
                    checked={selectedRoles?.includes(role)}
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
              {errors.roles && (
                <p className="text-sm text-destructive">{errors.roles.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Special Instructions</Label>
              <Input
                id="instructions"
                placeholder="Any specific instructions for this person..."
                className="rounded-lg"
                {...register("instructions")}
              />
            </div>

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-full">
                {editingPerson ? "Update" : "Add"} Person
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
