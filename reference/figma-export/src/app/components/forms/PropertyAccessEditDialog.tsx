import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Building2, Home, Shield, Camera, Video, Plus, X, Info } from "lucide-react";

export interface AccessMedia {
  id: string;
  section: "building" | "unit" | "alarm";
  type: "image" | "video";
  dataUrl: string;
  label: string;
}

// Module-level store so media survives dialog close/reopen
export const propertyAccessMedia: AccessMedia[] = [];

interface PropertyAccessData {
  buildingAccess: {
    intercom?: string;
    concierge?: string;
    afterHoursCode?: string;
  };
  unitAccess: {
    keysafeLocation?: string;
    keysafeCode?: string;
    doorType?: string;
  };
  alarm: {
    system?: string;
    code?: string;
    panelLocation?: string;
  };
}

interface PropertyAccessEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: PropertyAccessData;
  onSave: (data: PropertyAccessData) => void;
}

function TabMediaSection({
  section,
  media,
  onAdd,
  onRemove,
  onLabelChange,
}: {
  section: "building" | "unit" | "alarm";
  media: AccessMedia[];
  onAdd: (items: Omit<AccessMedia, "id">[]) => void;
  onRemove: (id: string) => void;
  onLabelChange: (id: string, label: string) => void;
}) {
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const sectionMedia = media.filter(m => m.section === section);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        onAdd([{ section, type, dataUrl: ev.target?.result as string, label: "" }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  return (
    <div className="space-y-3 pt-2 border-t border-border mt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Photos & Videos
            {sectionMedia.length > 0 && (
              <span className="ml-1.5 bg-primary text-primary-foreground text-[10px] rounded-full px-1.5 py-0.5 font-bold">
                {sectionMedia.length}
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => photoRef.current?.click()}
            className="flex items-center gap-1 text-xs text-primary font-bold hover:text-primary/70 transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            Photo
          </button>
          <span className="text-border">|</span>
          <button
            type="button"
            onClick={() => videoRef.current?.click()}
            className="flex items-center gap-1 text-xs text-primary font-bold hover:text-primary/70 transition-colors"
          >
            <Video className="w-3.5 h-3.5" />
            Video
          </button>
        </div>
      </div>

      <div className="flex items-start gap-2 bg-primary/5 border border-primary/15 rounded-lg px-3 py-2">
        <Info className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Photos and videos help responders locate access points quickly. Be as specific as possible.
        </p>
      </div>

      <input ref={photoRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e, "image")} />
      <input ref={videoRef} type="file" accept="video/*" multiple className="hidden" onChange={e => handleFiles(e, "video")} />

      {sectionMedia.length === 0 ? (
        <button
          type="button"
          onClick={() => photoRef.current?.click()}
          className="w-full border-2 border-dashed border-border rounded-xl py-4 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" />
          Add a photo or video
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {sectionMedia.map(item => (
            <div key={item.id} className="border border-border rounded-xl overflow-hidden">
              <div className="relative">
                {item.type === "image" ? (
                  <img src={item.dataUrl} alt={item.label || "Access photo"} className="w-full h-32 object-cover" />
                ) : (
                  <video src={item.dataUrl} controls className="w-full h-32 object-cover bg-black" />
                )}
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
                <span className="absolute top-1.5 left-1.5 flex items-center gap-0.5 bg-black/60 text-white text-[10px] rounded-full px-1.5 py-0.5">
                  {item.type === "image" ? <Camera className="w-2.5 h-2.5" /> : <Video className="w-2.5 h-2.5" />}
                </span>
              </div>
              <div className="px-2 py-1.5">
                {editingLabel === item.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={item.label}
                    onChange={e => onLabelChange(item.id, e.target.value)}
                    onBlur={() => setEditingLabel(null)}
                    onKeyDown={e => e.key === "Enter" && setEditingLabel(null)}
                    placeholder="Add caption…"
                    className="w-full text-xs bg-transparent border-b border-primary outline-none pb-0.5 text-foreground placeholder:text-muted-foreground"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingLabel(item.id)}
                    className="w-full text-left text-xs text-muted-foreground hover:text-foreground transition-colors truncate"
                  >
                    {item.label || "Add caption…"}
                  </button>
                )}
              </div>
            </div>
          ))}
          {/* Inline add more button */}
          <button
            type="button"
            onClick={() => photoRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl h-32 flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs">Add more</span>
          </button>
        </div>
      )}
    </div>
  );
}

export function PropertyAccessEditDialog({
  open,
  onOpenChange,
  initialData,
  onSave,
}: PropertyAccessEditDialogProps) {
  const [formData, setFormData] = useState<PropertyAccessData>(initialData);
  const [media, setMedia] = useState<AccessMedia[]>([...propertyAccessMedia]);

  const syncMedia = (updated: AccessMedia[]) => {
    propertyAccessMedia.length = 0;
    propertyAccessMedia.push(...updated);
    setMedia(updated);
  };

  const addMedia = (items: Omit<AccessMedia, "id">[]) => {
    const newItems = items.map(i => ({ ...i, id: `${Date.now()}-${Math.random()}` }));
    syncMedia([...media, ...newItems]);
  };

  const removeMedia = (id: string) => syncMedia(media.filter(m => m.id !== id));

  const updateLabel = (id: string, label: string) =>
    syncMedia(media.map(m => m.id === id ? { ...m, label } : m));

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  const updateBuildingAccess = (field: string, value: string) =>
    setFormData({ ...formData, buildingAccess: { ...formData.buildingAccess, [field]: value } });

  const updateUnitAccess = (field: string, value: string) =>
    setFormData({ ...formData, unitAccess: { ...formData.unitAccess, [field]: value } });

  const updateAlarm = (field: string, value: string) =>
    setFormData({ ...formData, alarm: { ...formData.alarm, [field]: value } });

  const mediaProps = { media, onAdd: addMedia, onRemove: removeMedia, onLabelChange: updateLabel };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-black uppercase">Edit Access Details</DialogTitle>
          <DialogDescription>
            Update your property access information for emergency responders
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="building" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="building" className="gap-1.5 text-xs">
              <Building2 className="w-3.5 h-3.5" />
              Building
            </TabsTrigger>
            <TabsTrigger value="unit" className="gap-1.5 text-xs">
              <Home className="w-3.5 h-3.5" />
              Unit
            </TabsTrigger>
            <TabsTrigger value="alarm" className="gap-1.5 text-xs">
              <Shield className="w-3.5 h-3.5" />
              Alarm
            </TabsTrigger>
          </TabsList>

          {/* Building Access */}
          <TabsContent value="building" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Intercom Instructions</Label>
              <Textarea
                value={formData.buildingAccess.intercom || ""}
                onChange={e => updateBuildingAccess("intercom", e.target.value)}
                placeholder="e.g., Buzz unit 304, or press '0' for concierge"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">How responders should use the intercom to gain building access</p>
            </div>
            <div className="space-y-2">
              <Label>Concierge Information</Label>
              <Textarea
                value={formData.buildingAccess.concierge || ""}
                onChange={e => updateBuildingAccess("concierge", e.target.value)}
                placeholder="e.g., 24/7 concierge desk in main lobby, ask for access to Level 3"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Details about building staff who can assist</p>
            </div>
            <div className="space-y-2">
              <Label>After Hours Access Code</Label>
              <Input
                type="text"
                value={formData.buildingAccess.afterHoursCode || ""}
                onChange={e => updateBuildingAccess("afterHoursCode", e.target.value)}
                placeholder="e.g., #1234 or C5678"
              />
              <p className="text-xs text-muted-foreground">Code for building entry outside business hours</p>
            </div>
            <TabMediaSection section="building" {...mediaProps} />
          </TabsContent>

          {/* Unit Access */}
          <TabsContent value="unit" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Keysafe Location</Label>
              <Textarea
                value={formData.unitAccess.keysafeLocation || ""}
                onChange={e => updateUnitAccess("keysafeLocation", e.target.value)}
                placeholder="e.g., Left side of front door, hidden behind plant pot"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Detailed location of your keysafe or hidden key</p>
            </div>
            <div className="space-y-2">
              <Label>Keysafe Code</Label>
              <Input
                type="text"
                value={formData.unitAccess.keysafeCode || ""}
                onChange={e => updateUnitAccess("keysafeCode", e.target.value)}
                placeholder="e.g., 5678"
              />
              <p className="text-xs text-muted-foreground">The combination or code to access your keysafe</p>
            </div>
            <div className="space-y-2">
              <Label>Door & Lock Information</Label>
              <Textarea
                value={formData.unitAccess.doorType || ""}
                onChange={e => updateUnitAccess("doorType", e.target.value)}
                placeholder="e.g., Wooden door with deadbolt, sometimes sticks and needs firm push"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Important details about your door and locks</p>
            </div>
            <TabMediaSection section="unit" {...mediaProps} />
          </TabsContent>

          {/* Alarm System */}
          <TabsContent value="alarm" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Alarm System</Label>
              <Input
                type="text"
                value={formData.alarm.system || ""}
                onChange={e => updateAlarm("system", e.target.value)}
                placeholder="e.g., ADT, SimpliSafe, or None"
              />
              <p className="text-xs text-muted-foreground">The brand or type of alarm system installed</p>
            </div>
            <div className="space-y-2">
              <Label>Disarm Code</Label>
              <Input
                type="text"
                value={formData.alarm.code || ""}
                onChange={e => updateAlarm("code", e.target.value)}
                placeholder="e.g., 1234"
              />
              <p className="text-xs text-muted-foreground">The code to disarm your alarm system</p>
            </div>
            <div className="space-y-2">
              <Label>Panel Location & Instructions</Label>
              <Textarea
                value={formData.alarm.panelLocation || ""}
                onChange={e => updateAlarm("panelLocation", e.target.value)}
                placeholder="e.g., Inside front door on left wall. Enter code within 30 seconds of entry."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Where the alarm panel is and how to disarm it</p>
            </div>
            <TabMediaSection section="alarm" {...mediaProps} />
          </TabsContent>
        </Tabs>

        <div className="p-4 bg-muted rounded-lg mt-4">
          <p className="text-xs font-medium mb-2">Security Notice:</p>
          <p className="text-xs text-muted-foreground">
            This information is encrypted and only visible to authorized accredited Legacy Wolf responders during an active incident. Every access is logged and auditable.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
