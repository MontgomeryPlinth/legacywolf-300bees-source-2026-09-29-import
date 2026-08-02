import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import {
  Dog, User, Stethoscope, Heart, Clock, AlertCircle,
  Plus, Trash2, Edit, ChevronDown, ChevronUp, Camera, Pill, X
} from "lucide-react";
import { useApp } from "../../../contexts/AppContext";
import type { Medication } from "../../../contexts/AppContext";
import { petPhotos } from "../../../stores/petPhotos";
import { toast } from "sonner";
import { useState, useRef } from "react";
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

const FREQUENCIES = ["Once daily", "Twice daily", "Three times daily", "Every other day", "Weekly", "As needed"];
const WITH_MEALS_OPTIONS = [
  { value: "none", label: "Not with meals" },
  { value: "with-breakfast", label: "With breakfast" },
  { value: "with-lunch", label: "With lunch" },
  { value: "with-dinner", label: "With dinner" },
  { value: "with-any-meal", label: "With any meal" },
  { value: "with-all-meals", label: "With all meals" },
];

function formatTime(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function MedicationBadge({ med }: { med: Medication }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full px-2 py-0.5 font-medium">
      <Pill className="w-3 h-3" />
      {med.name}
    </span>
  );
}

function MedicationForm({
  med,
  index,
  onChange,
  onRemove,
}: {
  med: Medication;
  index: number;
  onChange: (updated: Medication) => void;
  onRemove: () => void;
}) {
  const addTime = () => onChange({ ...med, timeOfDay: [...med.timeOfDay, "08:00"] });
  const updateTime = (i: number, val: string) => {
    const times = [...med.timeOfDay];
    times[i] = val;
    onChange({ ...med, timeOfDay: times });
  };
  const removeTime = (i: number) =>
    onChange({ ...med, timeOfDay: med.timeOfDay.filter((_, idx) => idx !== i) });

  return (
    <div className="border border-border rounded-xl p-4 space-y-3 bg-card relative">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs uppercase font-bold tracking-wide text-muted-foreground">Medication {index + 1}</p>
        <button onClick={onRemove} className="text-muted-foreground hover:text-destructive transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Name + Type */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Medication name *</Label>
          <Input
            value={med.name}
            onChange={e => onChange({ ...med, name: e.target.value })}
            placeholder="e.g. Carprofen"
            className="rounded-lg h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Type / dose</Label>
          <Input
            value={med.type}
            onChange={e => onChange({ ...med, type: e.target.value })}
            placeholder="e.g. 50mg tablet"
            className="rounded-lg h-9 text-sm"
          />
        </div>
      </div>

      {/* Frequency + With meals */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Frequency</Label>
          <Select value={med.frequency} onValueChange={v => onChange({ ...med, frequency: v })}>
            <SelectTrigger className="rounded-lg h-9 text-sm">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCIES.map(f => (
                <SelectItem key={f} value={f.toLowerCase()}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">With meals</Label>
          <Select value={med.withMeals || "none"} onValueChange={v => onChange({ ...med, withMeals: v })}>
            <SelectTrigger className="rounded-lg h-9 text-sm">
              <SelectValue placeholder="With meals?" />
            </SelectTrigger>
            <SelectContent>
              {WITH_MEALS_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Time of day — clock time inputs */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Time of day</Label>
          <button
            type="button"
            onClick={addTime}
            className="flex items-center gap-1 text-xs text-primary font-bold hover:text-primary/70 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add time
          </button>
        </div>
        {med.timeOfDay.length === 0 && (
          <button
            type="button"
            onClick={addTime}
            className="w-full border border-dashed border-border rounded-lg py-2.5 text-xs text-muted-foreground hover:border-primary/40 transition-colors flex items-center justify-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            Add a dose time
          </button>
        )}
        <div className="space-y-2">
          {med.timeOfDay.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="time"
                value={t}
                onChange={e => updateTime(i, e.target.value)}
                className="flex-1 h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="text-xs text-muted-foreground w-16 flex-shrink-0">{formatTime(t)}</span>
              <button
                type="button"
                onClick={() => removeTime(i)}
                className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


function PetAvatar({ petId, name, size = "md" }: { petId: string; name: string; size?: "sm" | "md" | "lg" }) {
  const photo = petPhotos[petId];
  const dim = size === "sm" ? "w-12 h-12" : size === "lg" ? "w-24 h-24" : "w-16 h-16";
  const iconDim = size === "sm" ? "w-6 h-6" : size === "lg" ? "w-12 h-12" : "w-8 h-8";

  if (photo) {
    return <img src={photo} alt={name} className={`${dim} rounded-full object-cover flex-shrink-0`} />;
  }
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0`}>
      <Dog className={`${iconDim} text-primary`} />
    </div>
  );
}

const emptyMed = (): Medication => ({ name: "", type: "", frequency: "", timeOfDay: [], withMeals: "none" });

export function PetManagement() {
  const { pets, people, addPet, updatePet, deletePet } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<string | null>(null);
  const [expandedPets, setExpandedPets] = useState<Record<string, boolean>>({});
  const [, forceUpdate] = useState(0);
  const [formData, setFormData] = useState({
    name: "", species: "Dog", breed: "", age: 0, sex: "Female",
    weight: 0, microchip: "", vetName: "", vetPhone: "",
    conditions: "",
    medications: [] as Medication[],
    morningRoutine: "", eveningRoutine: "",
    preferences: "", guardianId: "", backupGuardianId: "",
    photoDataUrl: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardPhotoRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const guardians = people.filter(p =>
    p.roles.includes("Pet Guardian") || p.roles.includes("Backup Pet Guardian")
  );

  const toggleExpanded = (id: string) =>
    setExpandedPets(prev => ({ ...prev, [id]: !prev[id] }));

  const handleAdd = () => {
    setEditingPet(null);
    setFormData({
      name: "", species: "Dog", breed: "", age: 0, sex: "Female",
      weight: 0, microchip: "", vetName: "", vetPhone: "",
      conditions: "", medications: [],
      morningRoutine: "", eveningRoutine: "",
      preferences: "", guardianId: "", backupGuardianId: "", photoDataUrl: "",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (pet: typeof pets[0]) => {
    setEditingPet(pet.id);
    setFormData({
      name: pet.name, species: pet.species, breed: pet.breed,
      age: pet.age, sex: pet.sex, weight: pet.weight, microchip: pet.microchip,
      vetName: pet.vetName, vetPhone: pet.vetPhone,
      conditions: pet.conditions.join(", "),
      medications: pet.medications.map(m => ({ ...m })),
      morningRoutine: pet.routine.morning, eveningRoutine: pet.routine.evening,
      preferences: pet.preferences,
      guardianId: pet.guardianId || "", backupGuardianId: pet.backupGuardianId || "",
      photoDataUrl: petPhotos[pet.id] || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name}?`)) {
      deletePet(id);
      delete petPhotos[id];
      toast.success("Pet removed", { description: `${name} has been removed from your plan` });
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>, forCard?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      if (forCard) {
        petPhotos[forCard] = dataUrl;
        forceUpdate(n => n + 1);
        toast.success("Photo updated");
      } else {
        setFormData(prev => ({ ...prev, photoDataUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const addMedication = () =>
    setFormData(prev => ({ ...prev, medications: [...prev.medications, emptyMed()] }));

  const updateMedication = (index: number, updated: Medication) =>
    setFormData(prev => {
      const meds = [...prev.medications];
      meds[index] = updated;
      return { ...prev, medications: meds };
    });

  const removeMedication = (index: number) =>
    setFormData(prev => ({ ...prev, medications: prev.medications.filter((_, i) => i !== index) }));

  const handleSubmit = () => {
    if (!formData.name || !formData.breed || !formData.species) {
      toast.error("Missing fields", { description: "Please fill in all required fields" });
      return;
    }
    const validMeds = formData.medications.filter(m => m.name.trim());

    const petData = {
      name: formData.name, species: formData.species, breed: formData.breed,
      age: formData.age, sex: formData.sex, weight: formData.weight,
      microchip: formData.microchip, vetName: formData.vetName, vetPhone: formData.vetPhone,
      conditions: formData.conditions.split(",").map(c => c.trim()).filter(Boolean),
      medications: validMeds,
      routine: { morning: formData.morningRoutine, evening: formData.eveningRoutine },
      preferences: formData.preferences,
      guardianId: formData.guardianId, backupGuardianId: formData.backupGuardianId,
    };

    if (editingPet) {
      updatePet(editingPet, petData);
      if (formData.photoDataUrl) petPhotos[editingPet] = formData.photoDataUrl;
      toast.success("Pet updated", { description: `${formData.name}'s profile has been updated` });
    } else {
      addPet(petData);
      toast.success("Pet added", { description: `${formData.name} has been added to your plan` });
    }
    setIsDialogOpen(false);
  };

  if (pets.length === 0) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="space-y-2">
          <h2 className="font-black uppercase tracking-tight text-2xl">PETS</h2>
          <p className="text-muted-foreground">Your pet's profile and care instructions</p>
        </div>
        <Card className="p-8 text-center">
          <Dog className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-bold text-lg mb-2">No pets added yet</h3>
          <p className="text-sm text-muted-foreground mb-6">Add your pet to ensure they're protected and cared for in an emergency</p>
          <Button className="rounded-full uppercase font-bold tracking-wide" onClick={handleAdd}>
            <Plus className="w-5 h-5 mr-2" />Add Your Pet
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black uppercase tracking-tight text-2xl">PETS</h2>
          <p className="text-muted-foreground text-sm">Your pet's profile and care instructions</p>
        </div>
        <Button size="sm" variant="outline" className="rounded-full uppercase font-bold tracking-wide text-xs" onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-1" />Add
        </Button>
      </div>

      {pets.map(pet => {
        const guardian = people.find(p => p.id === pet.guardianId);
        const backupGuardian = people.find(p => p.id === pet.backupGuardianId);
        const isExpanded = expandedPets[pet.id] ?? false;
        const hasMeds = pet.medications.length > 0;
        const hasConditions = pet.conditions.length > 0;

        return (
          <Card key={pet.id} className="overflow-hidden">
            {/* Collapsed summary row */}
            <button
              className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/30 transition-colors"
              onClick={() => toggleExpanded(pet.id)}
            >
              <div className="relative flex-shrink-0">
                <PetAvatar petId={pet.id} name={pet.name} size="md" />
                <button
                  className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-colors"
                  onClick={e => { e.stopPropagation(); cardPhotoRefs.current[pet.id]?.click(); }}
                  title="Upload photo"
                >
                  <Camera className="w-3 h-3" />
                </button>
                <input
                  ref={el => { cardPhotoRefs.current[pet.id] = el; }}
                  type="file" accept="image/*" className="hidden"
                  onChange={e => handlePhotoSelect(e, pet.id)}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-base leading-tight">{pet.name}</p>
                <p className="text-sm text-muted-foreground">{pet.breed} · {pet.age}yr · {pet.sex}</p>
                {hasMeds && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {pet.medications.map((m, i) => <MedicationBadge key={i} med={m} />)}
                  </div>
                )}
                {!hasMeds && hasConditions && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <AlertCircle className="w-3 h-3 text-amber-500" />
                    <span className="text-xs text-amber-500">{pet.conditions[0]}</span>
                  </div>
                )}
              </div>

              {isExpanded
                ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              }
            </button>

            {isExpanded && (
              <div className="border-t border-border px-4 pb-4 space-y-4 pt-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground tracking-wide mb-0.5">WEIGHT</p>
                    <p className="font-medium text-sm">{pet.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground tracking-wide mb-0.5">MICROCHIP</p>
                    <p className="font-medium text-sm truncate">{pet.microchip || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground tracking-wide mb-0.5">SPECIES</p>
                    <p className="font-medium text-sm">{pet.species}</p>
                  </div>
                </div>

                {guardian && (
                  <div className="border-t border-border pt-3">
                    <p className="text-xs uppercase text-muted-foreground tracking-wide mb-2">PET GUARDIAN</p>
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-full bg-primary/10">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{guardian.name}</p>
                        <p className="text-xs text-muted-foreground">Primary Guardian</p>
                      </div>
                      <Badge variant="outline" className="border-primary text-primary text-xs">VERIFIED</Badge>
                    </div>
                    {backupGuardian && (
                      <div className="flex items-center gap-3 mt-2">
                        <div className="p-1.5 rounded-full bg-muted">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{backupGuardian.name}</p>
                          <p className="text-xs text-muted-foreground">Backup Guardian</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {pet.vetName && (
                  <div className="border-t border-border pt-3">
                    <p className="text-xs uppercase text-muted-foreground tracking-wide mb-2">VETERINARIAN</p>
                    <div className="flex items-start gap-3">
                      <Stethoscope className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{pet.vetName}</p>
                        {pet.vetPhone && <p className="text-xs text-muted-foreground">{pet.vetPhone}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {(hasConditions || hasMeds) && (
                  <div className="border-t border-border pt-3 space-y-3">
                    <p className="text-xs uppercase text-muted-foreground tracking-wide">MEDICAL</p>
                    {hasConditions && (
                      <div className="space-y-1">
                        {pet.conditions.map((c, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm">{c}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {hasMeds && (
                      <div className="space-y-2">
                        {pet.medications.map((m, i) => (
                          <div key={i} className="bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2.5">
                            <div className="flex items-center gap-2 mb-1">
                              <Pill className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                              <p className="text-sm font-semibold">{m.name}</p>
                              {m.type && <span className="text-xs text-muted-foreground">· {m.type}</span>}
                            </div>
                            <div className="flex flex-wrap gap-1.5 pl-5">
                              {m.frequency && (
                                <span className="text-xs bg-muted rounded-full px-2 py-0.5 capitalize">{m.frequency}</span>
                              )}
                              {m.timeOfDay.map(t => (
                                <span key={t} className="text-xs bg-muted rounded-full px-2 py-0.5">{formatTime(t)}</span>
                              ))}
                              {m.withMeals && m.withMeals !== "none" && (
                                <span className="text-xs bg-muted rounded-full px-2 py-0.5 capitalize">
                                  {WITH_MEALS_OPTIONS.find(o => o.value === m.withMeals)?.label ?? m.withMeals}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {(pet.routine.morning || pet.routine.evening) && (
                  <div className="border-t border-border pt-3">
                    <p className="text-xs uppercase text-muted-foreground tracking-wide mb-2">DAILY ROUTINE</p>
                    <div className="space-y-2">
                      {pet.routine.morning && (
                        <div className="flex items-start gap-2">
                          <Clock className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium">Morning</p>
                            <p className="text-xs text-muted-foreground">{pet.routine.morning}</p>
                          </div>
                        </div>
                      )}
                      {pet.routine.evening && (
                        <div className="flex items-start gap-2">
                          <Clock className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium">Evening</p>
                            <p className="text-xs text-muted-foreground">{pet.routine.evening}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {pet.preferences && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
                    <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">CALMING WORDS</p>
                    <p className="text-sm">{pet.preferences}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" className="flex-1 rounded-full uppercase font-bold tracking-wide text-xs" onClick={() => handleEdit(pet)}>
                    <Edit className="w-3.5 h-3.5 mr-1" />Edit
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full px-4" onClick={() => handleDelete(pet.id, pet.name)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        );
      })}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-wide">{editingPet ? "Edit Pet" : "Add Pet"}</DialogTitle>
            <DialogDescription>
              {editingPet ? "Update your pet's profile and care instructions" : "Add your pet to ensure they're protected"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Photo */}
            <div className="flex items-center gap-4">
              <div className="relative">
                {formData.photoDataUrl
                  ? <img src={formData.photoDataUrl} alt="Pet photo" className="w-20 h-20 rounded-full object-cover" />
                  : <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center"><Dog className="w-9 h-9 text-muted-foreground" /></div>
                }
              </div>
              <div>
                <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => fileInputRef.current?.click()}>
                  <Camera className="w-4 h-4 mr-2" />
                  {formData.photoDataUrl ? "Change Photo" : "Upload Photo"}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG or WEBP</p>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handlePhotoSelect(e)} />
              </div>
            </div>

            {/* Basic info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Pet name" className="rounded-lg" />
              </div>
              <div className="space-y-2">
                <Label>Species *</Label>
                <Select value={formData.species} onValueChange={v => setFormData({ ...formData, species: v })}>
                  <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Dog", "Cat", "Bird", "Other"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="breed">Breed *</Label>
                <Input id="breed" value={formData.breed} onChange={e => setFormData({ ...formData, breed: e.target.value })} className="rounded-lg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" value={formData.age ?? ""} onChange={e => { const v = parseInt(e.target.value); setFormData({ ...formData, age: isNaN(v) ? undefined as any : v }); }} className="rounded-lg" />
              </div>
              <div className="space-y-2">
                <Label>Sex</Label>
                <Select value={formData.sex} onValueChange={v => setFormData({ ...formData, sex: v })}>
                  <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input id="weight" type="number" value={formData.weight ?? ""} onChange={e => { const v = parseFloat(e.target.value); setFormData({ ...formData, weight: isNaN(v) ? undefined as any : v }); }} className="rounded-lg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="microchip">Microchip ID</Label>
                <Input id="microchip" value={formData.microchip} onChange={e => setFormData({ ...formData, microchip: e.target.value })} className="rounded-lg" />
              </div>
            </div>

            {/* Guardians */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary Guardian</Label>
                <Select value={formData.guardianId} onValueChange={v => setFormData({ ...formData, guardianId: v })}>
                  <SelectTrigger className="rounded-lg"><SelectValue placeholder="Select guardian" /></SelectTrigger>
                  <SelectContent>
                    {guardians.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Backup Guardian</Label>
                <Select value={formData.backupGuardianId} onValueChange={v => setFormData({ ...formData, backupGuardianId: v })}>
                  <SelectTrigger className="rounded-lg"><SelectValue placeholder="Select backup" /></SelectTrigger>
                  <SelectContent>
                    {guardians.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Vet */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vetName">Vet Name</Label>
                <Input id="vetName" value={formData.vetName} onChange={e => setFormData({ ...formData, vetName: e.target.value })} className="rounded-lg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vetPhone">Vet Phone</Label>
                <Input id="vetPhone" value={formData.vetPhone} onChange={e => setFormData({ ...formData, vetPhone: e.target.value })} className="rounded-lg" />
              </div>
            </div>

            {/* Medical conditions */}
            <div className="space-y-2">
              <Label htmlFor="conditions">Medical Conditions (comma separated)</Label>
              <Input id="conditions" value={formData.conditions} onChange={e => setFormData({ ...formData, conditions: e.target.value })} placeholder="Hip dysplasia, allergies..." className="rounded-lg" />
            </div>

            {/* Medications — structured */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Medications</Label>
                <button
                  type="button"
                  onClick={addMedication}
                  className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wide"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add medication
                </button>
              </div>
              {formData.medications.length === 0 && (
                <button
                  type="button"
                  onClick={addMedication}
                  className="w-full border-2 border-dashed border-border rounded-xl py-4 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add a medication
                </button>
              )}
              {formData.medications.map((med, i) => (
                <MedicationForm
                  key={i}
                  med={med}
                  index={i}
                  onChange={updated => updateMedication(i, updated)}
                  onRemove={() => removeMedication(i)}
                />
              ))}
            </div>

            {/* Routine */}
            <div className="space-y-2">
              <Label htmlFor="morningRoutine">Morning Routine</Label>
              <Textarea id="morningRoutine" value={formData.morningRoutine} onChange={e => setFormData({ ...formData, morningRoutine: e.target.value })} placeholder="7:00 AM - Breakfast + walk" className="rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eveningRoutine">Evening Routine</Label>
              <Textarea id="eveningRoutine" value={formData.eveningRoutine} onChange={e => setFormData({ ...formData, eveningRoutine: e.target.value })} placeholder="6:00 PM - Dinner + walk" className="rounded-lg" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferences">Calming Words & Preferences</Label>
              <Textarea id="preferences" value={formData.preferences} onChange={e => setFormData({ ...formData, preferences: e.target.value })} placeholder="Responds to 'good girl', favorite toy is blue rope..." className="rounded-lg min-h-[80px]" />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-full">Cancel</Button>
            <Button onClick={handleSubmit} className="rounded-full">{editingPet ? "Update" : "Add"} Pet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
