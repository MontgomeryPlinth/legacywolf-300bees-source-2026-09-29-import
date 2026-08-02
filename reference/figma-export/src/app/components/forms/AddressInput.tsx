import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  AUSTRALIAN_STATES,
  validateAddress,
  getAddressSuggestionsFromPostcode,
  type AddressData,
  type AddressValidationResult,
} from '../../../lib/utils/addressValidation';

export interface AddressInputProps {
  value: AddressData;
  onChange: (address: AddressData) => void;
  onValidationChange?: (result: AddressValidationResult) => void;
  disabled?: boolean;
}

export function AddressInput({ value, onChange, onValidationChange, disabled }: AddressInputProps) {
  const [validationResult, setValidationResult] = useState<AddressValidationResult>({
    isValid: true,
    errors: {},
  });
  const [isValidating, setIsValidating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Validate address when it changes
  useEffect(() => {
    const validateCurrentAddress = async () => {
      // Only validate if all required fields are filled
      if (value.street && value.suburb && value.state && value.postcode) {
        setIsValidating(true);
        const result = await validateAddress(value);
        setValidationResult(result);
        setShowSuggestions(!result.isValid && !!result.suggestions);
        setIsValidating(false);
        
        if (onValidationChange) {
          onValidationChange(result);
        }
      } else {
        setValidationResult({ isValid: false, errors: {} });
        setShowSuggestions(false);
      }
    };

    const timeoutId = setTimeout(validateCurrentAddress, 500);
    return () => clearTimeout(timeoutId);
  }, [value, onValidationChange]);

  // Auto-fill state and show suburb suggestions when postcode changes
  useEffect(() => {
    if (value.postcode.length === 4) {
      const suggestions = getAddressSuggestionsFromPostcode(value.postcode);
      
      // Auto-fill state if available and current state is empty or doesn't match
      if (suggestions.state && (!value.state || value.state !== suggestions.state)) {
        onChange({
          ...value,
          state: suggestions.state,
        });
      }
    }
  }, [value.postcode]);

  const handleFieldChange = (field: keyof AddressData, fieldValue: string) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  const applySuggestion = (field: keyof AddressData, suggestionValue: string) => {
    onChange({
      ...value,
      [field]: suggestionValue,
    });
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-4">
      {/* Street Address */}
      <div className="space-y-2">
        <Label htmlFor="street" className="flex items-center gap-2 text-xs uppercase tracking-wide">
          <MapPin className="w-3.5 h-3.5" />
          Street Address *
        </Label>
        <Input
          id="street"
          value={value.street}
          onChange={(e) => handleFieldChange('street', e.target.value)}
          placeholder="e.g., 42 Melbourne Street"
          disabled={disabled}
          className={validationResult.errors.street ? 'border-destructive' : ''}
        />
        {validationResult.errors.street && (
          <p className="text-xs text-destructive">{validationResult.errors.street}</p>
        )}
      </div>

      {/* Unit/Apartment (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="unit" className="text-xs uppercase tracking-wide text-muted-foreground">
          Unit/Apartment (Optional)
        </Label>
        <Input
          id="unit"
          value={value.unit || ''}
          onChange={(e) => handleFieldChange('unit', e.target.value)}
          placeholder="e.g., Apartment 7B"
          disabled={disabled}
        />
      </div>

      {/* Postcode */}
      <div className="space-y-2">
        <Label htmlFor="postcode" className="text-xs uppercase tracking-wide">
          Postcode *
        </Label>
        <Input
          id="postcode"
          value={value.postcode}
          onChange={(e) => handleFieldChange('postcode', e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="2060"
          maxLength={4}
          disabled={disabled}
          className={validationResult.errors.postcode ? 'border-destructive' : ''}
        />
        {validationResult.errors.postcode && (
          <p className="text-xs text-destructive">{validationResult.errors.postcode}</p>
        )}
      </div>

      {/* Suburb */}
      <div className="space-y-2">
        <Label htmlFor="suburb" className="text-xs uppercase tracking-wide">
          Suburb *
        </Label>
        <Input
          id="suburb"
          value={value.suburb}
          onChange={(e) => handleFieldChange('suburb', e.target.value)}
          placeholder="North Sydney"
          disabled={disabled}
          className={validationResult.errors.suburb ? 'border-destructive' : ''}
        />
        {validationResult.errors.suburb && (
          <p className="text-xs text-destructive">{validationResult.errors.suburb}</p>
        )}
        
        {/* Suburb Suggestions */}
        {showSuggestions && validationResult.suggestions?.suburb && validationResult.suggestions.suburb.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <p className="text-sm font-medium">Did you mean:</p>
              <div className="flex flex-wrap gap-2">
                {validationResult.suggestions.suburb.map((suggestion) => (
                  <Badge
                    key={suggestion}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => applySuggestion('suburb', suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* State */}
      <div className="space-y-2">
        <Label htmlFor="state" className="text-xs uppercase tracking-wide">
          State/Territory *
        </Label>
        <Select
          value={value.state}
          onValueChange={(newValue) => handleFieldChange('state', newValue)}
          disabled={disabled}
        >
          <SelectTrigger className={validationResult.errors.state ? 'border-destructive' : ''}>
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            {AUSTRALIAN_STATES.map((state) => (
              <SelectItem key={state.code} value={state.code}>
                {state.code} - {state.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {validationResult.errors.state && (
          <p className="text-xs text-destructive">{validationResult.errors.state}</p>
        )}
        
        {/* State Suggestion */}
        {showSuggestions && validationResult.suggestions?.state && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="text-sm">
                Based on the postcode, the state should be:{' '}
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => applySuggestion('state', validationResult.suggestions!.state!)}
                >
                  {validationResult.suggestions.state}
                </Badge>
              </p>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Validation Status */}
      {!isValidating && value.street && value.suburb && value.state && value.postcode && (
        <Alert className={validationResult.isValid ? 'border-primary' : 'border-destructive'}>
          {validationResult.isValid ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                Address verified with postal data
              </AlertDescription>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-sm">
                Please correct the errors above to verify your address
              </AlertDescription>
            </>
          )}
        </Alert>
      )}
    </div>
  );
}
