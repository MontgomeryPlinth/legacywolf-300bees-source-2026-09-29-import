import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { AlertCircle, MapPin, Key, Shield, Dog, Phone, Clock, Navigation, Camera, Video, Pill } from "lucide-react";
import { useApp } from "../../../contexts/AppContext";
import { propertyAccessMedia } from "../../forms/PropertyAccessEditDialog";
import { petPhotos } from "../../../stores/petPhotos";

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

export function ActiveAlert() {
  const { user, property, pets, people, primaryContactId } = useApp();

  const primaryContact = people.find(p => p.id === primaryContactId);

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Alert Banner */}
      <Card className="p-6 bg-destructive/10 border-2 border-destructive">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-8 h-8 text-destructive flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h2 className="text-xl font-black uppercase tracking-wide mb-2">
              {user.name.split(" ")[0].toUpperCase()} IS UNRESPONSIVE
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              {user.name} has not responded to their Motion Timer check-in. You have been activated.
            </p>
            <Badge className="bg-destructive text-white">ACTIVE INCIDENT</Badge>
          </div>
        </div>
      </Card>

      {/* Timer */}
      <Card className="p-6 text-center border-2 border-primary">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">INCIDENT ACTIVATED</p>
        <div className="text-3xl font-black text-primary mb-1">23 minutes ago</div>
        <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}</p>
      </Card>

      {/* Instructions */}
      <Card className="p-6 space-y-4 border-2 border-primary/50">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" />
          <h3 className="text-sm uppercase tracking-wider font-bold">
            {user.name.split(" ")[0].toUpperCase()}'S INSTRUCTIONS FOR YOU
          </h3>
        </div>
        <div className="bg-primary/10 p-4 rounded-lg border border-primary/30">
          <p className="text-sm font-medium italic">
            {primaryContact?.instructions
              ? `"${primaryContact.instructions}"`
              : `"${primaryContact?.name ? primaryContact.name + ", please" : "Please"} go to my address and check on me${pets.length > 0 ? ` and ${pets.map(p => p.name).join(", ")}` : ""}. The responder will meet you there."`
            }
          </p>
        </div>
      </Card>

      {/* Property Access */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm uppercase tracking-wider font-bold">PROPERTY ACCESS</h3>
          <Badge className="bg-primary text-primary-foreground text-xs">UNLOCKED</Badge>
        </div>

        <div className="space-y-4">
          {/* Address */}
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">ADDRESS</p>
              <p className="font-medium">{property.address}{property.unit ? `, ${property.unit}` : ""}</p>
              <p className="text-sm text-muted-foreground">{property.city} {property.state} {property.postcode}</p>
            </div>
          </div>

          {/* Access details */}
          <div className="flex items-start gap-3">
            <Key className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs uppercase text-muted-foreground tracking-wide mb-2">ACCESS</p>
              <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
                {property.buildingAccess.intercom && (
                  <p><strong>Building:</strong> {property.buildingAccess.intercom}{property.buildingAccess.concierge ? `, ${property.buildingAccess.concierge}` : ""}</p>
                )}
                {property.buildingAccess.afterHoursCode && (
                  <p><strong>After hours code:</strong> {property.buildingAccess.afterHoursCode}</p>
                )}
                {property.unitAccess.keysafeLocation && (
                  <p><strong>Unit:</strong> Keysafe — {property.unitAccess.keysafeLocation}</p>
                )}
                {property.unitAccess.keysafeCode && (
                  <p><strong>Keysafe code:</strong> {property.unitAccess.keysafeCode}</p>
                )}
                {property.alarm.code && (
                  <p><strong>Alarm:</strong> {property.alarm.code} within 30 seconds</p>
                )}
              </div>

              {/* Access media grouped by section */}
              {propertyAccessMedia.length > 0 && (
                <div className="mt-3 space-y-3">
                  {(["building", "unit", "alarm"] as const).map(section => {
                    const hasMedia = propertyAccessMedia.some(m => m.section === section);
                    if (!hasMedia) return null;
                    return (
                      <div key={section}>
                        <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">{section} photos</p>
                        <SectionMedia section={section} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <Button className="w-full rounded-full py-6 uppercase font-bold tracking-wide" size="lg">
          <Navigation className="w-5 h-5 mr-2" />
          Navigate There
        </Button>
      </Card>

      {/* Responder Status */}
      <Card className="p-6 space-y-4 bg-primary/5">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-sm uppercase tracking-wider font-bold">RESPONDER STATUS</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Emma Rodriguez</p>
              <p className="text-sm text-muted-foreground">Accredited Legacy Wolf Responder • Registered Nurse</p>
            </div>
            <Badge className="bg-primary text-primary-foreground">EN ROUTE</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">ETA: 8 minutes</p>
          </div>
        </div>
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
                <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">BREED & AGE</p>
                <p className="font-medium">{pet.breed}, {pet.age} year{pet.age !== 1 ? "s" : ""} old, {pet.sex}</p>
              </div>

              {pet.preferences && (
                <div>
                  <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">CALMING</p>
                  <p className="font-medium">{pet.preferences}</p>
                </div>
              )}

              {pet.medications.length > 0 && (
                <div>
                  <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">MEDICATION</p>
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

              {pet.vetName && (
                <div>
                  <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">VET</p>
                  <p className="font-medium">{pet.vetName}</p>
                  {pet.vetPhone && <p className="text-muted-foreground">{pet.vetPhone}</p>}
                </div>
              )}

              {guardian && (
                <div>
                  <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">PET GUARDIAN</p>
                  <p className="font-medium">{guardian.name}{guardian.phone ? ` • ${guardian.phone}` : ""}</p>
                </div>
              )}
            </div>
          </Card>
        );
      })}

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button className="w-full rounded-full py-6 uppercase font-bold tracking-wide" size="lg">
          I'm On My Way
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="rounded-full py-4 uppercase font-medium tracking-wide">
            <Phone className="w-4 h-4 mr-2" />
            Call Responder
          </Button>
          <Button variant="outline" className="rounded-full py-4 uppercase font-medium tracking-wide">
            <Phone className="w-4 h-4 mr-2" />
            Call Legacy Wolf
          </Button>
        </div>
        <Button variant="outline" className="w-full rounded-full py-4 text-destructive border-destructive hover:bg-destructive hover:text-white uppercase font-medium tracking-wide">
          I Can't Make It
        </Button>
      </div>

      {/* Support Line */}
      <Card className="p-5 bg-muted/30">
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-medium">24/7 Support Line</p>
            <p className="text-lg font-black text-primary">1800 LEGACY</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
