import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../ui/alert-dialog";
import { AlertTriangle, Shield } from "lucide-react";
import { Button } from "../ui/button";
import { useApp } from "../../contexts/AppContext";
import { toast } from "sonner";

interface EmergencyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmergencyModal({ open, onOpenChange }: EmergencyModalProps) {
  const { checkIn, triggerEmergency } = useApp();

  const handleCheckIn = () => {
    checkIn();
    onOpenChange(false);
    toast.success("Check-in successful", {
      description: "Timer has been reset. You're safe.",
    });
  };

  const handleEmergency = () => {
    triggerEmergency();
    onOpenChange(false);
    toast.error("Emergency protocol activated", {
      description: "Your emergency contacts have been notified. Help is on the way.",
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-destructive/10">
              <AlertTriangle className="w-12 h-12 text-destructive" />
            </div>
          </div>
          <AlertDialogTitle className="text-2xl text-center uppercase font-black tracking-tight">
            Are You OK?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-base pt-2">
            We haven't detected motion from your device. If you're safe, check in now to reset your timer. If you need help, we'll activate your emergency protocol.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex-col sm:flex-col gap-3 mt-4">
          <Button
            onClick={handleCheckIn}
            className="w-full rounded-full py-6 uppercase font-bold tracking-wide text-base"
            size="lg"
          >
            <Shield className="w-5 h-5 mr-2" />
            I'm Safe - Check In
          </Button>
          <Button
            onClick={handleEmergency}
            variant="destructive"
            className="w-full rounded-full py-6 uppercase font-bold tracking-wide text-base"
            size="lg"
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            I Need Help
          </Button>
          <AlertDialogCancel className="w-full rounded-full py-4 uppercase font-medium tracking-wide mt-0">
            Dismiss
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
