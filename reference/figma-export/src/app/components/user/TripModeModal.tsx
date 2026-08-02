import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Calendar, Clock, Plane } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TripModeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (endDate: Date) => void;
}

export function TripModeModal({ open, onOpenChange, onConfirm }: TripModeModalProps) {
  // Set default to tomorrow at noon
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];
  
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [selectedTime, setSelectedTime] = useState("12:00");

  // Generate time options (every hour from midnight to 11 PM)
  const timeOptions = [
    { value: "00:00", label: "12:00 AM (Midnight)" },
    { value: "01:00", label: "1:00 AM" },
    { value: "02:00", label: "2:00 AM" },
    { value: "03:00", label: "3:00 AM" },
    { value: "04:00", label: "4:00 AM" },
    { value: "05:00", label: "5:00 AM" },
    { value: "06:00", label: "6:00 AM" },
    { value: "07:00", label: "7:00 AM" },
    { value: "08:00", label: "8:00 AM" },
    { value: "09:00", label: "9:00 AM" },
    { value: "10:00", label: "10:00 AM" },
    { value: "11:00", label: "11:00 AM" },
    { value: "12:00", label: "12:00 PM (Noon)" },
    { value: "13:00", label: "1:00 PM" },
    { value: "14:00", label: "2:00 PM" },
    { value: "15:00", label: "3:00 PM" },
    { value: "16:00", label: "4:00 PM" },
    { value: "17:00", label: "5:00 PM" },
    { value: "18:00", label: "6:00 PM" },
    { value: "19:00", label: "7:00 PM" },
    { value: "20:00", label: "8:00 PM" },
    { value: "21:00", label: "9:00 PM" },
    { value: "22:00", label: "10:00 PM" },
    { value: "23:00", label: "11:00 PM" },
  ];

  const handleConfirm = () => {
    const endDate = new Date(selectedDate + "T" + selectedTime);
    const now = new Date();

    if (endDate <= now) {
      toast.error("Please select a future date and time");
      return;
    }

    onConfirm(endDate);
    toast.success("Trip Mode activated", {
      description: `Monitoring paused until ${endDate.toLocaleDateString()} at ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Plane className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Enable Trip Mode</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Your motion timer will be paused until you return. Choose when you'd like Wolf Watch to resume monitoring.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Date Selector */}
          <div className="space-y-2">
            <Label htmlFor="trip-date" className="uppercase text-xs font-bold tracking-wide flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Return Date
            </Label>
            <Input
              id="trip-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="h-12"
            />
          </div>

          {/* Time Selector */}
          <div className="space-y-2">
            <Label htmlFor="trip-time" className="uppercase text-xs font-bold tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Return Time
            </Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Info Box */}
          <div className="bg-primary/10 border border-primary rounded-lg p-4">
            <p className="text-sm text-center">
              <strong>Your protection pauses now</strong><br />
              Wolf Watch will auto-resume at the time you select
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-full uppercase font-medium tracking-wide"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="rounded-full uppercase font-bold tracking-wide bg-primary hover:bg-primary/90"
            >
              Activate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}