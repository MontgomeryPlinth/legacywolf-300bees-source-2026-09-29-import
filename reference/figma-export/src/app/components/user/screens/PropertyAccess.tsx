import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Building2, Key, Lock, AlertTriangle, Eye, EyeOff, MapPin, Edit, Camera, Video } from "lucide-react";
import { propertyAccessMedia, type AccessMedia } from "../../forms/PropertyAccessEditDialog";

function SectionMedia({ section }: { section: AccessMedia["section"] }) {
  const items = propertyAccessMedia.filter(m => m.section === section);
  if (items.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {items.map(item => (
        <div key={item.id} className="rounded-lg overflow-hidden border border-border relative">
          {item.type === "image" ? (
            <img src={item.dataUrl} alt={item.label || "Access photo"} className="w-full h-24 object-cover" />
          ) : (
            <video src={item.dataUrl} controls className="w-full h-24 object-cover bg-black" />
          )}
          <span className="absolute top-1 left-1 flex items-center gap-0.5 bg-black/60 text-white text-[10px] rounded-full px-1.5 py-0.5">
            {item.type === "image" ? <Camera className="w-2.5 h-2.5" /> : <Video className="w-2.5 h-2.5" />}
          </span>
          {item.label && <p className="px-2 py-1 text-xs text-muted-foreground truncate">{item.label}</p>}
        </div>
      ))}
    </div>
  );
}
import { useState } from "react";
import { useApp } from "../../../contexts/AppContext";
import { usePin } from "../../../contexts/PinContext";
import { toast } from "sonner";
import { AddressFormDialog, type PropertyAddressData } from "../../forms/AddressFormDialog";
import { PinPromptDialog } from "../../auth/PinPromptDialog";
import { PropertyAccessEditDialog } from "../../forms/PropertyAccessEditDialog";

export function PropertyAccess() {
  const { property, updateProperty } = useApp();
  const { isPinVerified, lockPin } = usePin();
  const [showAccessDetails, setShowAccessDetails] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const toggleAccessDetails = () => {
    if (!showAccessDetails) {
      // Need to verify PIN before showing
      setShowPinPrompt(true);
    } else {
      // Lock when hiding
      setShowAccessDetails(false);
      lockPin();
      toast.info("Access details hidden", {
        description: "Details are now encrypted again"
      });
    }
  };

  const handlePinSuccess = () => {
    setShowAccessDetails(true);
    toast.success("Access details revealed", {
      description: "These details are encrypted and only visible when you authenticate"
    });
  };

  const handleEditClick = () => {
    if (!showAccessDetails) {
      // Need to unlock first
      setShowPinPrompt(true);
      // Will open edit dialog after PIN verification
    } else {
      setShowEditDialog(true);
    }
  };

  const handleAccessDetailsSave = (data: any) => {
    updateProperty({
      buildingAccess: data.buildingAccess,
      unitAccess: data.unitAccess,
      alarm: data.alarm,
    });
    toast.success("Access details updated", {
      description: "Your property access information has been saved"
    });
  };

  const handleAddressSave = (address: PropertyAddressData) => {
    // Convert property type from form value to display value
    const propertyTypeMap: Record<string, string> = {
      'house': 'House',
      'apartment': 'Apartment Building',
      'townhouse': 'Townhouse',
      'unit': 'Unit',
      'other': 'Other',
    };

    // Update the property in the app context
    updateProperty({
      address: address.street,
      unit: address.unit,
      city: address.suburb,
      state: address.state,
      postcode: address.postcode,
      propertyType: propertyTypeMap[address.propertyType] || address.propertyType,
    });
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="font-black uppercase tracking-tight text-2xl">PROPERTY</h2>
        <p className="text-muted-foreground">
          Your address and access instructions for emergency response
        </p>
      </div>

      {/* Home Address */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm uppercase tracking-wider font-bold">HOME ADDRESS</h3>
          <MapPin className="w-5 h-5 text-primary" />
        </div>
        <div className="space-y-2">
          <p className="font-medium text-lg">{property.address}</p>
          {property.unit && <p className="text-muted-foreground">{property.unit}</p>}
          <p className="text-muted-foreground">{property.city} {property.state} {property.postcode}</p>
          <p className="text-muted-foreground">Australia</p>
        </div>
        <div className="pt-2">
          <p className="text-xs uppercase text-muted-foreground tracking-wide mb-2">PROPERTY TYPE</p>
          <Badge variant="outline">{property.propertyType}</Badge>
        </div>
        <Button
          variant="outline"
          className="w-full rounded-full uppercase font-medium tracking-wide"
          onClick={() => setShowAddressDialog(true)}
        >
          Update Address
        </Button>
      </Card>

      {/* Address Form Dialog */}
      <AddressFormDialog
        open={showAddressDialog}
        onOpenChange={setShowAddressDialog}
        initialAddress={{
          street: property.address,
          unit: property.unit,
          suburb: property.city,
          state: property.state,
          postcode: property.postcode,
          propertyType: property.propertyType.toLowerCase().replace(' ', '-'),
        }}
        onSave={handleAddressSave}
      />

      {/* Access Details - Encrypted */}
      <Card className="p-6 space-y-4 border-2 border-primary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            <h3 className="text-sm uppercase tracking-wider font-bold">ACCESS DETAILS</h3>
          </div>
          <Badge className="bg-primary text-primary-foreground text-xs">ENCRYPTED</Badge>
        </div>

        <Card className="p-4 bg-muted/50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              These details are encrypted and only revealed to authorized responders during an active incident.
            </p>
          </div>
        </Card>

        <div className="space-y-4">
          {/* Building Access */}
          <div>
            <p className="text-xs uppercase text-muted-foreground tracking-wide mb-2">BUILDING ACCESS</p>
            <div className="bg-muted rounded-lg p-4">
              {showAccessDetails ? (
                <div className="space-y-2">
                  {property.buildingAccess.intercom && (
                    <p className="text-sm"><strong>Intercom:</strong> {property.buildingAccess.intercom}</p>
                  )}
                  {property.buildingAccess.concierge && (
                    <p className="text-sm"><strong>Concierge:</strong> {property.buildingAccess.concierge}</p>
                  )}
                  {property.buildingAccess.afterHoursCode && (
                    <p className="text-sm"><strong>After Hours Code:</strong> {property.buildingAccess.afterHoursCode}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">••••••••••••••</p>
              )}
            </div>
            {showAccessDetails && <SectionMedia section="building" />}
          </div>

          {/* Unit Access */}
          <div>
            <p className="text-xs uppercase text-muted-foreground tracking-wide mb-2">UNIT ACCESS</p>
            <div className="bg-muted rounded-lg p-4">
              {showAccessDetails ? (
                <div className="space-y-2">
                  {property.unitAccess.keysafeLocation && (
                    <p className="text-sm"><strong>Keysafe Location:</strong> {property.unitAccess.keysafeLocation}</p>
                  )}
                  {property.unitAccess.keysafeCode && (
                    <p className="text-sm"><strong>Keysafe Code:</strong> {property.unitAccess.keysafeCode}</p>
                  )}
                  {property.unitAccess.doorType && (
                    <p className="text-sm"><strong>Door:</strong> {property.unitAccess.doorType}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">••••••••••••••</p>
              )}
            </div>
            {showAccessDetails && <SectionMedia section="unit" />}
          </div>

          {/* Alarm Code */}
          <div>
            <p className="text-xs uppercase text-muted-foreground tracking-wide mb-2">ALARM SYSTEM</p>
            <div className="bg-muted rounded-lg p-4">
              {showAccessDetails ? (
                <div className="space-y-2">
                  {property.alarm.system && (
                    <p className="text-sm"><strong>System:</strong> {property.alarm.system}</p>
                  )}
                  {property.alarm.code && (
                    <p className="text-sm"><strong>Disarm Code:</strong> {property.alarm.code}</p>
                  )}
                  {property.alarm.panelLocation && (
                    <p className="text-sm"><strong>Panel Location:</strong> {property.alarm.panelLocation}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">••••••••••••••</p>
              )}
            </div>
            {showAccessDetails && <SectionMedia section="alarm" />}
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full rounded-full uppercase font-medium tracking-wide"
          onClick={toggleAccessDetails}
        >
          {showAccessDetails ? (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              Hide Details
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Reveal Details
            </>
          )}
        </Button>

        <Button
          variant="outline"
          className="w-full rounded-full uppercase font-medium tracking-wide"
          onClick={handleEditClick}
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Details
        </Button>
      </Card>

      {/* Pin Prompt Dialog */}
      <PinPromptDialog
        open={showPinPrompt}
        onOpenChange={setShowPinPrompt}
        onSuccess={handlePinSuccess}
      />

      {/* Property Access Edit Dialog */}
      <PropertyAccessEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        initialData={{
          buildingAccess: property.buildingAccess,
          unitAccess: property.unitAccess,
          alarm: property.alarm,
        }}
        onSave={handleAccessDetailsSave}
      />

      {/* Privacy Notice */}
      <Card className="p-5 bg-muted/30">
        <div className="space-y-3">
          <h4 className="font-bold text-sm uppercase tracking-wide">WHAT WE SHARE, WHEN, WITH WHOM</h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <Key className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
              <span>Access details remain encrypted until a verified incident triggers your protection</span>
            </li>
            <li className="flex items-start gap-2">
              <Key className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
              <span>Only dispatched Accredited Legacy Wolf responders see these details</span>
            </li>
            <li className="flex items-start gap-2">
              <Key className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
              <span>Every access is logged and auditable</span>
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
}