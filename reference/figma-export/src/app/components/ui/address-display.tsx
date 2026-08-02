import { MapPin, Home, Building2 } from 'lucide-react';
import { Card } from './card';
import { Badge } from './badge';
import type { AddressData } from '../../../lib/utils/addressValidation';

interface AddressDisplayProps {
  address: AddressData;
  propertyType?: string;
  showIcon?: boolean;
  variant?: 'default' | 'compact' | 'card';
  className?: string;
}

/**
 * AddressDisplay Component
 * Displays a formatted address with optional property type and icon
 */
export function AddressDisplay({
  address,
  propertyType,
  showIcon = true,
  variant = 'default',
  className = '',
}: AddressDisplayProps) {
  const { street, unit, suburb, state, postcode } = address;

  const renderIcon = () => {
    if (!showIcon) return null;

    const iconClass = 'w-5 h-5 text-primary flex-shrink-0';
    
    if (propertyType?.toLowerCase().includes('apartment') || propertyType?.toLowerCase().includes('unit')) {
      return <Building2 className={iconClass} />;
    }
    
    return <MapPin className={iconClass} />;
  };

  const renderAddress = () => (
    <div className="space-y-1">
      {unit && <p className="text-sm text-muted-foreground">{unit}</p>}
      <p className="font-medium">{street}</p>
      <p className="text-sm text-muted-foreground">
        {suburb} {state} {postcode}
      </p>
      <p className="text-sm text-muted-foreground">Australia</p>
      {propertyType && (
        <div className="pt-1">
          <Badge variant="outline" className="text-xs">
            {propertyType}
          </Badge>
        </div>
      )}
    </div>
  );

  if (variant === 'compact') {
    return (
      <div className={`flex items-start gap-2 ${className}`}>
        {renderIcon()}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">
            {unit ? `${unit}, ` : ''}{street}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {suburb} {state} {postcode}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-start gap-3">
          {renderIcon()}
          <div className="flex-1">
            {renderAddress()}
          </div>
        </div>
      </Card>
    );
  }

  // Default variant
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      {renderIcon()}
      <div className="flex-1">
        {renderAddress()}
      </div>
    </div>
  );
}
