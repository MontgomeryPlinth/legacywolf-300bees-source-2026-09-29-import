import { Dog, User, Stethoscope, Heart, Clock, AlertCircle, Plus, Trash2, Edit, Eye, EyeOff } from "lucide-react";
import { useApp } from "../../../contexts/AppContext";
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { petSchema, type PetFormData } from "../../../../lib/validations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

export function PetManagement() {
  const { pets, people, addPet, updatePet, deletePet } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<string | null>(null);
  const [revealedMicrochips, setRevealedMicrochips] = useState<Set<string>>(new Set());

  const guardians = people.filter(p =>
    p.roles.includes("Pet Guardian") || p.roles.includes("Backup Pet Guardian")
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: "",
      species: "Dog",
      breed: "",
      age: 0,
      sex: "Female",
      weight: 0,
      microchip: "",
      vetName: "",
      vetPhone: "",
      conditions: "",
      medications: "",
      morningRoutine: "",
      eveningRoutine: "",
      preferences: "",
      guardianId: "",
      backupGuardianId: "",
    },
  });

  const selectedGuardianId = watch("guardianId");

  const handleAdd = () => {
    setEditingPet(null);
    reset({
      name: "",
      species: "Dog",
      breed: "",
      age: 0,
      sex: "Female",
      weight: 0,
      microchip: "",
      vetName: "",
      vetPhone: "",
      conditions: "",
      medications: "",
      morningRoutine: "",
      eveningRoutine: "",
      preferences: "",
      guardianId: "",
      backupGuardianId: "",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (pet: typeof pets[0]) => {
    setEditingPet(pet.id);
    reset({
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age,
      sex: pet.sex,
      weight: pet.weight,
      microchip: pet.microchip,
      vetName: pet.vetName,
      vetPhone: pet.vetPhone,
      conditions: pet.conditions.join(", "),
      medications: pet.medications.join(", "),
      morningRoutine: pet.routine.morning,
      eveningRoutine: pet.routine.evening,
      preferences: pet.preferences,
      guardianId: pet.guardianId || "",
      backupGuardianId: pet.backupGuardianId || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name}?`)) {
      deletePet(id);
      toast.success("Pet removed", {
        description: `${name} has been removed from your plan`,
      });
    }
  };

  const onSubmit = (data: PetFormData) => {
    const petData = {
      name: data.name,
      species: data.species,
      breed: data.breed,
      age: data.age,
      sex: data.sex,
      weight: data.weight,
      microchip: data.microchip,
      vetName: data.vetName,
      vetPhone: data.vetPhone,
      conditions: data.conditions ? data.conditions.split(",").map(c => c.trim()).filter(Boolean) : [],
      medications: data.medications ? data.medications.split(",").map(m => m.trim()).filter(Boolean) : [],
      routine: {
        morning: data.morningRoutine,
        evening: data.eveningRoutine,
      },
      preferences: data.preferences,
      guardianId: data.guardianId,
      backupGuardianId: data.backupGuardianId || undefined,
    };

    if (editingPet) {
      updatePet(editingPet, petData);
      toast.success("Pet updated", {
        description: `${data.name}'s details have been updated`,
      });
    } else {
      addPet(petData);
      toast.success("Pet added", {
        description: `${data.name} has been added to your plan`,
      });
    }

    setIsDialogOpen(false);
    reset();
  };

  const toggleMicrochipVisibility = (petId: string) => {
    setRevealedMicrochips(prev => {
      const newSet = new Set(prev);
      if (newSet.has(petId)) {
        newSet.delete(petId);
      } else {
        newSet.add(petId);
      }
      return newSet;
    });
  };

  const maskMicrochip = (microchip: string) => {
    if (microchip.length <= 6) return "••••••";
    return microchip.slice(0, 6) + "•".repeat(microchip.length - 6);
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="font-black uppercase tracking-tight text-2xl">PETS</h2>
        <p className="text-muted-foreground">
          Manage your pet's care instructions and guardians
        </p>
      </div>

      {/* Add Pet CTA */}
      <Button
        className="w-full rounded-full py-6 uppercase font-bold tracking-wide"
        size="lg"
        onClick={handleAdd}
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Pet
      </Button>

      {/* Pets List */}
      {pets.length === 0 ? (
        <Card className="p-12 text-center">
          <Dog className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-bold mb-2">No pets added yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Add your pet to ensure they're cared for during an incident
          </p>
          <Button onClick={handleAdd} variant="outline" className="rounded-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Pet
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {pets.map((pet) => (
            <Card key={pet.id} className="p-6 space-y-4 hover:border-primary/50 transition-all">
              {/* Pet Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Dog className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{pet.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {pet.breed} • {pet.age} years • {pet.sex}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(pet)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(pet.id, pet.name)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Pet Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Microchip */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                    <AlertCircle className="w-3 h-3" />
                    <span>Microchip ID</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono">
                      {revealedMicrochips.has(pet.id) ? pet.microchip : maskMicrochip(pet.microchip)}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleMicrochipVisibility(pet.id)}
                      className="h-6 w-6 p-0"
                    >
                      {revealedMicrochips.has(pet.id) ? (
                        <EyeOff className="w-3 h-3" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Vet Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                    <Stethoscope className="w-3 h-3" />
                    <span>Veterinarian</span>
                  </div>
                  <p className="text-sm font-medium">{pet.vetName}</p>
                  <p className="text-sm text-muted-foreground">{pet.vetPhone}</p>
                </div>

                {/* Guardian */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span>Guardian</span>
                  </div>
                  <p className="text-sm font-medium">
                    {people.find(p => p.id === pet.guardianId)?.name || "Not assigned"}
                  </p>
                  {pet.backupGuardianId && (
                    <p className="text-sm text-muted-foreground">
                      Backup: {people.find(p => p.id === pet.backupGuardianId)?.name}
                    </p>
                  )}
                </div>

                {/* Medical */}
                {(pet.conditions.length > 0 || pet.medications.length > 0) && (
                  <div className="space-y-1 md:col-span-2">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                      <Heart className="w-3 h-3" />
                      <span>Medical</span>
                    </div>
                    {pet.conditions.length > 0 && (
                      <p className="text-sm">
                        <strong>Conditions:</strong> {pet.conditions.join(", ")}
                      </p>
                    )}
                    {pet.medications.length > 0 && (
                      <p className="text-sm">
                        <strong>Medications:</strong> {pet.medications.join(", ")}
                      </p>
                    )}
                  </div>
                )}

                {/* Routine */}
                <div className="space-y-1 md:col-span-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Daily Routine</span>
                  </div>
                  <p className="text-sm">
                    <strong>Morning:</strong> {pet.routine.morning}
                  </p>
                  <p className="text-sm">
                    <strong>Evening:</strong> {pet.routine.evening}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      {guardians.length === 0 && (
        <Card className="p-5 bg-muted/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">No pet guardians assigned</p>
              <p className="text-sm text-muted-foreground">
                Add people with "Pet Guardian" role in the People tab before adding pets.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-wide">
              {editingPet ? "Edit Pet" : "Add Pet"}
            </DialogTitle>
            <DialogDescription>
              {editingPet
                ? "Update your pet's details and care instructions"
                : "Add a new pet to your protection plan"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wide">Basic Information</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Daisy"
                    className="rounded-lg"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="species">Species *</Label>
                  <select
                    id="species"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background"
                    {...register("species")}
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Rabbit">Rabbit</option>
                    <option value="Snake">Snake</option>
                    <option value="Pig">Pig</option>
                    <option value="Horse">Horse</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.species && (
                    <p className="text-sm text-destructive">{errors.species.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="breed">Breed *</Label>
                  <Input
                    id="breed"
                    placeholder="e.g., Golden Retriever"
                    className="rounded-lg"
                    {...register("breed")}
                  />
                  {errors.breed && (
                    <p className="text-sm text-destructive">{errors.breed.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age (years) *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="0"
                    placeholder="e.g., 6"
                    className="rounded-lg"
                    {...register("age")}
                  />
                  {errors.age && (
                    <p className="text-sm text-destructive">{errors.age.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sex">Sex *</Label>
                  <select
                    id="sex"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background"
                    {...register("sex")}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  {errors.sex && (
                    <p className="text-sm text-destructive">{errors.sex.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g., 28"
                    className="rounded-lg"
                    {...register("weight")}
                  />
                  {errors.weight && (
                    <p className="text-sm text-destructive">{errors.weight.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="microchip">Microchip Number *</Label>
                <Input
                  id="microchip"
                  placeholder="e.g., 985112******234"
                  className="rounded-lg"
                  {...register("microchip")}
                />
                {errors.microchip && (
                  <p className="text-sm text-destructive">{errors.microchip.message}</p>
                )}
              </div>
            </div>

            {/* Veterinarian */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wide">Veterinarian</h4>

              <div className="space-y-2">
                <Label htmlFor="vetName">Vet Clinic Name *</Label>
                <Input
                  id="vetName"
                  placeholder="e.g., North Sydney Veterinary Hospital"
                  className="rounded-lg"
                  {...register("vetName")}
                />
                {errors.vetName && (
                  <p className="text-sm text-destructive">{errors.vetName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vetPhone">Vet Phone Number *</Label>
                <Input
                  id="vetPhone"
                  placeholder="+61 2 9955 3486"
                  className="rounded-lg"
                  {...register("vetPhone")}
                />
                {errors.vetPhone && (
                  <p className="text-sm text-destructive">{errors.vetPhone.message}</p>
                )}
              </div>
            </div>

            {/* Medical */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wide">Medical Information</h4>

              <div className="space-y-2">
                <Label htmlFor="conditions">Medical Conditions</Label>
                <Input
                  id="conditions"
                  placeholder="Separate multiple conditions with commas"
                  className="rounded-lg"
                  {...register("conditions")}
                />
                <p className="text-xs text-muted-foreground">
                  e.g., Hip dysplasia, Allergies
                </p>
                {errors.conditions && (
                  <p className="text-sm text-destructive">{errors.conditions.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="medications">Medications</Label>
                <Input
                  id="medications"
                  placeholder="Separate multiple medications with commas"
                  className="rounded-lg"
                  {...register("medications")}
                />
                <p className="text-xs text-muted-foreground">
                  e.g., Carprofen 50mg - one tablet with evening meal
                </p>
                {errors.medications && (
                  <p className="text-sm text-destructive">{errors.medications.message}</p>
                )}
              </div>
            </div>

            {/* Daily Routine */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wide">Daily Routine</h4>

              <div className="space-y-2">
                <Label htmlFor="morningRoutine">Morning Routine *</Label>
                <Textarea
                  id="morningRoutine"
                  placeholder="Describe morning feeding, walks, and activities..."
                  className="rounded-lg min-h-[80px]"
                  {...register("morningRoutine")}
                />
                {errors.morningRoutine && (
                  <p className="text-sm text-destructive">{errors.morningRoutine.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="eveningRoutine">Evening Routine *</Label>
                <Textarea
                  id="eveningRoutine"
                  placeholder="Describe evening feeding, walks, and activities..."
                  className="rounded-lg min-h-[80px]"
                  {...register("eveningRoutine")}
                />
                {errors.eveningRoutine && (
                  <p className="text-sm text-destructive">{errors.eveningRoutine.message}</p>
                )}
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wide">Care Preferences</h4>

              <div className="space-y-2">
                <Label htmlFor="preferences">Special Instructions & Preferences *</Label>
                <Textarea
                  id="preferences"
                  placeholder="Behavioral notes, favorite toys, sleeping location, fears, etc..."
                  className="rounded-lg min-h-[100px]"
                  {...register("preferences")}
                />
                <p className="text-xs text-muted-foreground">
                  Help guardians understand your pet's personality and needs
                </p>
                {errors.preferences && (
                  <p className="text-sm text-destructive">{errors.preferences.message}</p>
                )}
              </div>
            </div>

            {/* Guardians */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wide">Guardians</h4>

              <div className="space-y-2">
                <Label htmlFor="guardianId">Primary Guardian *</Label>
                <select
                  id="guardianId"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background"
                  {...register("guardianId")}
                >
                  <option value="">Select guardian...</option>
                  {guardians.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name} - {person.relationship}
                    </option>
                  ))}
                </select>
                {errors.guardianId && (
                  <p className="text-sm text-destructive">{errors.guardianId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="backupGuardianId">Backup Guardian</Label>
                <select
                  id="backupGuardianId"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background"
                  {...register("backupGuardianId")}
                >
                  <option value="">Select backup guardian...</option>
                  {guardians
                    .filter(p => p.id !== selectedGuardianId)
                    .map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name} - {person.relationship}
                      </option>
                    ))}
                </select>
                {errors.backupGuardianId && (
                  <p className="text-sm text-destructive">{errors.backupGuardianId.message}</p>
                )}
              </div>
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
                {editingPet ? "Update Pet" : "Add Pet"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}