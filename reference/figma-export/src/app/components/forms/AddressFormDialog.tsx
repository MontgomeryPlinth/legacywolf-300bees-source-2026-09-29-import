import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AddressInput } from './AddressInput';
import { toast } from 'sonner';
import { Home, Building2, Castle } from 'lucide-react';
import type { AddressData, AddressValidationResult } from '../../../lib/utils/addressValidation';

const PROPERTY_TYPES = [
  { value: 'house', label: 'House', icon: Home },
  { value: 'apartment', label: 'Apartment Building', icon: Building2 },
  { value: 'townhouse', label: 'Townhouse', icon: Castle },
  { value: 'unit', label: 'Unit', icon: Building2 },
  { value: 'other', label: 'Other', icon: Home },
];

export interface PropertyAddressData extends AddressData {
  propertyType: string;
}

export interface AddressFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAddress?: PropertyAddressData;
  onSave: (address: PropertyAddressData) => void;
  title?: string;
  description?: string;
}

export function AddressFormDialog({
  open,
  onOpenChange,
  initialAddress,
  onSave,
  title = 'Update Address',
  description = 'Update your home address and property type',
}: AddressFormDialogProps) {
  const [address, setAddress] = useState<PropertyAddressData>(
    initialAddress || {
      street: '',
      unit: '',
      suburb: '',
      state: '',
      postcode: '',
      propertyType: 'house',
    }
  );

  const [validationResult, setValidationResult] = useState<AddressValidationResult>({
    isValid: false,
    errors: {},
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!validationResult.isValid) {
      toast.error('Invalid Address', {
        description: 'Please correct the errors before saving',
      });
      return;
    }

    setIsSaving(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    onSave(address);
    setIsSaving(false);
    
    toast.success('Address Updated', {
      description: 'Your property address has been successfully updated',
    });
    
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset to initial values
    if (initialAddress) {
      setAddress(initialAddress);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="uppercase tracking-tight font-black text-xl">
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Address Input Component */}
          <AddressInput
            value={address}
            onChange={setAddress}
            onValidationChange={setValidationResult}
          />

          {/* Property Type */}
          <div className="space-y-2 pt-2">
            <Label htmlFor="propertyType" className="text-xs uppercase tracking-wide">
              Property Type *
            </Label>
            <Select
              value={address.propertyType}
              onValueChange={(value) => setAddress({ ...address, propertyType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="rounded-full uppercase font-medium tracking-wide"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!validationResult.isValid || isSaving}
            className="rounded-full uppercase font-medium tracking-wide"
          >
            {isSaving ? 'Saving...' : 'Save Address'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
