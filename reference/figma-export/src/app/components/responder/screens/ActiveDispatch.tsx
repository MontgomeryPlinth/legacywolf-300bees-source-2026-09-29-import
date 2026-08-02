import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  Navigation, MapPin, Key, Dog, Eye, Clock, User, Shield,
  Phone, Camera, CheckCircle, Video, Pill, AlertCircle
} from "lucide-react";
import { useApp } from "../../../contexts/AppContext";
import { propertyAccessMedia } from "../../forms/PropertyAccessEditDialog";
import { petPhotos } from "../../../stores/petPhotos";

const SERVICE_LABELS: Record<string, string> = {
  "attend-check": "ATTEND & CHECK",
  "pet-guardian": "PET GUARDIAN",
  "reputation-guard": "PANTS ON",
  "friend-alert": "PRIMARY CONTACT",
};

function formatTime(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function SectionMedia({ section }: { section: "building" | "unit" | "alarm" }) {
  const items = propertyAccessMedia.filter(m => m.section === section);
  if (items.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {items.map(item => (
        <div key={item.id} className="rounded-lg overflow-hidden border border-border relative">
          {item.type === "image" ? (
            <img src={item.dataUrl} alt={item.label || "Access photo"} className="w-full h-24 object-cover" />
          ) : (
            <video src={item.dataUrl} controls className="w-full h-24 object-cover bg-black" />
          )}
          <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
            {item.type === "image" ? <Camera className="w-2.5 h-2.5" /> : <Video className="w-2.5 h-2.5" />}
          </span>
          {item.label && <p className="px-2 py-1 text-xs text-muted-foreground truncate">{item.label}</p>}
        </div>
      ))}
    </div>
  );
}

export function ActiveDispatch() {
  const { user, plan, property, pets, people } = useApp();

  const activeServiceBadges = plan.activeServices
    .map(s => SERVICE_LABELS[s])
    .filter(Boolean);

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Dispatch Header */}
      <Card className="p-6 bg-primary/10 border-2 border-primary">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">DISPATCH ID</p>
            <h2 className="text-2xl font-black tracking-wide">#LW-2346</h2>
          </div>
          <Badge className="bg-primary text-primary-foreground">EN ROUTE</Badge>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Accepted 34 minutes ago</span>
        </div>
      </Card>

      {/* Service Tier */}
      <Card className="p-5 bg-muted/30">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">SERVICE TIER</p>
            <p className="font-bold text-lg capitalize">{plan.tier.replace("-", " ")}</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            {activeServiceBadges.map(label => (
              <Badge key={label} variant="outline" className="text-xs border-primary text-primary">{label}</Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* User Brief */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          <h3 className="text-sm uppercase tracking-wider font-bold">USER BRIEF</h3>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-black text-2xl flex-shrink-0">
            {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-bold mb-1">{user.name}</h4>
            <p className="text-sm text-muted-foreground mb-2">Lives alone</p>
            <p className="text-xs uppercase text-muted-foreground tracking-wide">USER ID: {user.id}</p>
          </div>
        </div>
        <Card className="p-4 bg-primary/5">
          <p className="text-xs uppercase text-muted-foreground tracking-wide mb-2">USER'S INSTRUCTIONS</p>
          <p className="text-sm italic">
            "Please check on me{pets.length > 0 ? ` and ${pets.map(p => p.name).join(", ")}` : ""}. If I'm unresponsive, follow the Pants On checklist in my bedroom."
          </p>
        </Card>
      </Card>

      {/* Property & Access */}
      <Card className="p-6 space-y-4 border-2 border-primary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="text-sm uppercase tracking-wider font-bold">PROPERTY ACCESS</h3>
          </div>
          <Badge className="bg-primary text-primary-foreground text-xs">DECRYPTED</Badge>
        </div>

        <div className="space-y-4">
          {/* Address */}
          <div>
            <p className="text-xs uppercase text-muted-foreground tracking-wide mb-2">ADDRESS</p>
            <div className="bg-muted p-3 rounded-lg">
              <p className="font-medium">{property.address}{property.unit ? `, ${property.unit}` : ""}</p>
              <p className="text-sm text-muted-foreground">{property.city} {property.state} {property.postcode}</p>
            </div>
          </div>

          {/* Building Entry */}
          <div>
            <p className="text-xs uppercase text-muted-foreground tracking-wide mb-2">BUILDING ENTRY</p>
            <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
              {property.buildingAccess.intercom && <p><strong>Intercom:</strong> {property.buildingAccess.intercom}</p>}
              {property.buildingAccess.concierge && <p><strong>Concierge:</strong> {property.buildingAccess.concierge}</p>}
              {property.buildingAccess.afterHoursCode && <p><strong>After Hours Code:</strong> {property.buildingAccess.afterHoursCode}</p>}
              {!property.buildingAccess.intercom && !property.buildingAccess.concierge && !property.buildingAccess.afterHoursCode && (
                <p className="text-muted-foreground">No building access details provided</p>
              )}
            </div>
            <SectionMedia section="building" />
          </div>

          {/* Unit Access */}
          <div>
            <p className="text-xs uppercase text-muted-foreground tracking-wide mb-2">UNIT ACCESS</p>
            <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
              {property.unitAccess.keysafeLocation && <p><strong>Keysafe Location:</strong> {property.unitAccess.keysafeLocation}</p>}
              {property.unitAccess.keysafeCode && <p><strong>Keysafe Code:</strong> {property.unitAccess.keysafeCode}</p>}
              {property.unitAccess.doorType && <p><strong>Door:</strong> {property.unitAccess.doorType}</p>}
              {!property.unitAccess.keysafeLocation && !property.unitAccess.keysafeCode && !property.unitAccess.doorType && (
                <p className="text-muted-foreground">No unit access details provided</p>
              )}
            </div>
            <SectionMedia section="unit" />
          </div>

          {/* Alarm */}
          <div>
            <p className="text-xs uppercase text-muted-foreground tracking-wide mb-2">ALARM SYSTEM</p>
            <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
              {property.alarm.system && <p><strong>System:</strong> {property.alarm.system}</p>}
              {property.alarm.code && <p><strong>Disarm Code:</strong> {property.alarm.code} (within 30 seconds)</p>}
              {property.alarm.panelLocation && <p><strong>Panel:</strong> {property.alarm.panelLocation}</p>}
              {!property.alarm.system && !property.alarm.code && !property.alarm.panelLocation && (
                <p className="text-muted-foreground">No alarm details provided</p>
              )}
            </div>
            <SectionMedia section="alarm" />
          </div>
        </div>

        <Button className="w-full rounded-full py-6 uppercase font-bold tracking-wide" size="lg">
          <Navigation className="w-5 h-5 mr-2" />
          Navigate to Property
        </Button>
      </Card>

      {/* Pets */}
      {pets.length > 0 && pets.map(pet => {
        const guardian = people.find(p => p.id === pet.guardianId);
        const photo = petPhotos[pet.id];
        return (
          <Card key={pet.id} className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Dog className="w-5 h-5 text-primary" />
              <h3 className="text-sm uppercase tracking-wider font-bold">PET: {pet.name.toUpperCase()}</h3>
              {photo && (
                <img src={photo} alt={pet.name} className="w-10 h-10 rounded-full object-cover ml-auto" />
              )}
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">BREED & DETAILS</p>
                <p className="font-medium">
                  {pet.breed} • {pet.age} year{pet.age !== 1 ? "s" : ""} • {pet.sex}{pet.weight ? ` • ${pet.weight}kg` : ""}
                </p>
              </div>

              {pet.preferences && (
                <div>
                  <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">CALMING PROTOCOL</p>
                  <p className="font-medium">{pet.preferences}</p>
                </div>
              )}

              {(pet.conditions.length > 0 || pet.medications.length > 0) && (
                <div>
                  <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">MEDICAL</p>
                  {pet.conditions.map((c, i) => (
                    <div key={i} className="flex items-start gap-1.5 mb-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="font-medium">{c}</p>
                    </div>
                  ))}
                  {pet.medications.map((m, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="font-medium">
                        {m.name}{m.type ? ` (${m.type})` : ""}{m.frequency ? ` — ${m.frequency}` : ""}
                        {m.timeOfDay.length > 0 ? ` at ${m.timeOfDay.map(formatTime).join(", ")}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {(pet.routine.morning || pet.routine.evening) && (
                <div>
                  <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">ROUTINE</p>
                  {pet.routine.morning && <p className="font-medium">Morning: {pet.routine.morning}</p>}
                  {pet.routine.evening && <p className="font-medium">Evening: {pet.routine.evening}</p>}
                </div>
              )}

              {guardian && (
                <div>
                  <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">PET GUARDIAN</p>
                  <p className="font-medium">{guardian.name} (Primary){guardian.phone ? ` • ${guardian.phone}` : ""}</p>
                </div>
              )}

              {pet.vetName && (
                <div>
                  <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">VETERINARIAN</p>
                  <p className="font-medium">{pet.vetName}</p>
                  {pet.vetPhone && <p className="text-muted-foreground">{pet.vetPhone}</p>}
                </div>
              )}
            </div>
          </Card>
        );
      })}

      {/* Pants On Checklist */}
      {plan.activeServices.includes("reputation-guard") && (
        <Card className="p-6 space-y-4 bg-primary/5">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            <h3 className="text-sm uppercase tracking-wider font-bold">PANTS ON CHECKLIST</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Personal documents", location: "Bedroom nightstand, top drawer", action: "Secure in provided envelope" },
              { label: "••••••••••", location: "Bathroom cabinet", action: "Dispose per protocol" },
              { label: "Laptop & devices", location: "Living room desk", action: "Power off, secure in provided bag" },
            ].map((item, i) => (
              <Card key={i} className="p-4 bg-background">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium mb-1">Item {i + 1}: {item.label}</p>
                    <p className="text-sm text-muted-foreground">Location: {item.location}</p>
                    <p className="text-sm text-muted-foreground">Action: {item.action}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button className="w-full rounded-full py-6 uppercase font-bold tracking-wide" size="lg">
          I've Arrived — Begin Protocol
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="rounded-full py-4 uppercase font-medium tracking-wide">
            <Camera className="w-4 h-4 mr-2" />
            Document Scene
          </Button>
          <Button variant="outline" className="rounded-full py-4 uppercase font-medium tracking-wide">
            <Phone className="w-4 h-4 mr-2" />
            Call Operations
          </Button>
        </div>
      </div>

      {/* Emergency Override */}
      <Card className="p-5 bg-destructive/10 border-destructive/30">
        <p className="text-sm text-center">
          <strong className="text-foreground">Emergency?</strong> Call 000 immediately if life-threatening situation.
        </p>
      </Card>
    </div>
  );
}
