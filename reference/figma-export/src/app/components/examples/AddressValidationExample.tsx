/**
 * Address Validation Example Component
 * 
 * This component demonstrates all address validation features.
 * Use it as a reference for implementing address inputs in your forms.
 * 
 * NOTE: This is an example/demo component. 
 * It's not used in the main app but can be imported for testing.
 */

import { useState } from 'react';
import { AddressInput } from '../forms/AddressInput';
import { AddressFormDialog, type PropertyAddressData } from '../forms/AddressFormDialog';
import { AddressDisplay } from '../ui/address-display';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { AddressData, AddressValidationResult } from '../../../lib/utils/addressValidation';

export function AddressValidationExample() {
  // Example 1: Basic AddressInput
  const [address1, setAddress1] = useState<AddressData>({
    street: '',
    unit: '',
    suburb: '',
    state: '',
    postcode: '',
  });
  const [validation1, setValidation1] = useState<AddressValidationResult>({
    isValid: false,
    errors: {},
  });

  // Example 2: Pre-filled Address
  const [address2, setAddress2] = useState<AddressData>({
    street: '42 Melbourne Street',
    unit: 'Apartment 7B',
    suburb: 'North Sydney',
    state: 'NSW',
    postcode: '2060',
  });
  const [validation2, setValidation2] = useState<AddressValidationResult>({
    isValid: true,
    errors: {},
  });

  // Example 3: Dialog
  const [showDialog, setShowDialog] = useState(false);
  const [savedAddress, setSavedAddress] = useState<PropertyAddressData | null>(null);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-black uppercase tracking-tight">
          Address Validation Examples
        </h1>
        <p className="text-muted-foreground">
          Interactive examples demonstrating all address validation features
        </p>
      </div>

      <Tabs defaultValue="input" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="input">Address Input</TabsTrigger>
          <TabsTrigger value="dialog">Dialog Form</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
        </TabsList>

        {/* Tab 1: Address Input */}
        <TabsContent value="input" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold uppercase tracking-wide">
                  Example 1: Empty Form
                </h3>
                {validation1.isValid ? (
                  <Badge className="bg-primary">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Valid
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <XCircle className="w-3 h-3 mr-1" />
                    Invalid
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Try entering a valid address. Use postcode <code className="px-1 py-0.5 bg-muted rounded">2060</code> to see auto-fill and suggestions.
              </p>
              <AddressInput
                value={address1}
                onChange={setAddress1}
                onValidationChange={setValidation1}
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold uppercase tracking-wide">
                  Example 2: Pre-filled Valid Address
                </h3>
                {validation2.isValid ? (
                  <Badge className="bg-primary">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Valid
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <XCircle className="w-3 h-3 mr-1" />
                    Invalid
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                This form is pre-filled with a valid address. Try changing the suburb to see suggestions.
              </p>
              <AddressInput
                value={address2}
                onChange={setAddress2}
                onValidationChange={setValidation2}
              />
            </div>
          </Card>

          {/* Valid Postcodes Reference */}
          <Card className="p-6 bg-muted/30">
            <h4 className="font-bold text-sm uppercase tracking-wide mb-3">
              Valid Test Postcodes
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><code>2060</code> - North Sydney, NSW</div>
              <div><code>2000</code> - Sydney, NSW</div>
              <div><code>2009</code> - Pyrmont, NSW</div>
              <div><code>3000</code> - Melbourne, VIC</div>
              <div><code>4000</code> - Brisbane, QLD</div>
              <div><code>5000</code> - Adelaide, SA</div>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: Dialog Form */}
        <TabsContent value="dialog" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold uppercase tracking-wide">
                Address Form Dialog
              </h3>
              <p className="text-sm text-muted-foreground">
                Click the button below to open the address update dialog.
                This is the same dialog used in the Property Access page.
              </p>
              <Button
                onClick={() => setShowDialog(true)}
                className="rounded-full uppercase font-medium tracking-wide"
              >
                Open Address Dialog
              </Button>

              {savedAddress && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-3">Last Saved Address:</p>
                  <AddressDisplay
                    address={savedAddress}
                    propertyType={savedAddress.propertyType}
                    variant="card"
                  />
                </div>
              )}
            </div>
          </Card>

          <AddressFormDialog
            open={showDialog}
            onOpenChange={setShowDialog}
            initialAddress={savedAddress || {
              street: '42 Melbourne Street',
              unit: 'Apartment 7B',
              suburb: 'North Sydney',
              state: 'NSW',
              postcode: '2060',
              propertyType: 'apartment',
            }}
            onSave={(address) => {
              setSavedAddress(address);
            }}
          />
        </TabsContent>

        {/* Tab 3: Display */}
        <TabsContent value="display" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold uppercase tracking-wide mb-2">
                  Default Variant
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Full address display with icon and property type.
                </p>
                <AddressDisplay
                  address={{
                    street: '42 Melbourne Street',
                    unit: 'Apartment 7B',
                    suburb: 'North Sydney',
                    state: 'NSW',
                    postcode: '2060',
                  }}
                  propertyType="Apartment Building"
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-bold uppercase tracking-wide mb-2">
                  Compact Variant
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Single-line truncated display, perfect for lists.
                </p>
                <AddressDisplay
                  address={{
                    street: '42 Melbourne Street',
                    unit: 'Apartment 7B',
                    suburb: 'North Sydney',
                    state: 'NSW',
                    postcode: '2060',
                  }}
                  variant="compact"
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-bold uppercase tracking-wide mb-2">
                  Card Variant
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Address wrapped in a card component.
                </p>
                <AddressDisplay
                  address={{
                    street: '42 Melbourne Street',
                    unit: 'Apartment 7B',
                    suburb: 'North Sydney',
                    state: 'NSW',
                    postcode: '2060',
                  }}
                  propertyType="Apartment Building"
                  variant="card"
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-bold uppercase tracking-wide mb-2">
                  Without Icon
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Display address without the location icon.
                </p>
                <AddressDisplay
                  address={{
                    street: '120 Collins Street',
                    suburb: 'Melbourne',
                    state: 'VIC',
                    postcode: '3000',
                  }}
                  propertyType="House"
                  showIcon={false}
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Code Examples */}
      <Card className="p-6 bg-muted/30">
        <h3 className="font-bold uppercase tracking-wide mb-4">Quick Code Examples</h3>
        <div className="space-y-4 text-sm font-mono">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Basic Usage:</p>
            <pre className="bg-background p-3 rounded-lg overflow-x-auto">
{`<AddressInput
  value={address}
  onChange={setAddress}
  onValidationChange={(result) => {
    setIsValid(result.isValid);
  }}
/>`}
            </pre>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Dialog Usage:</p>
            <pre className="bg-background p-3 rounded-lg overflow-x-auto">
{`<AddressFormDialog
  open={showDialog}
  onOpenChange={setShowDialog}
  initialAddress={currentAddress}
  onSave={(address) => {
    updateAddress(address);
  }}
/>`}
            </pre>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Display Usage:</p>
            <pre className="bg-background p-3 rounded-lg overflow-x-auto">
{`<AddressDisplay
  address={myAddress}
  propertyType="Apartment"
  variant="card"
/>`}
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
}
