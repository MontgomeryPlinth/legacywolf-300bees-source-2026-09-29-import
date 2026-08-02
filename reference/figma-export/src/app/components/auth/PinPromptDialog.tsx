import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Lock, AlertCircle } from "lucide-react";
import { usePin } from "../../contexts/PinContext";

interface PinPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export function PinPromptDialog({
  open,
  onOpenChange,
  onSuccess,
  title = "Enter Your PIN",
  description = "Enter your 4-digit PIN to access sensitive information",
}: PinPromptDialogProps) {
  const { verifyPin } = usePin();
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (open) {
      setPin(["", "", "", ""]);
      setError("");
      setAttempts(0);
      // Focus first input when dialog opens
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [open]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError("");

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 4 digits entered
    if (index === 3 && value) {
      const fullPin = [...newPin.slice(0, 3), value].join("");
      setTimeout(() => verifyEnteredPin(fullPin), 100);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyEnteredPin = (enteredPin: string) => {
    if (verifyPin(enteredPin)) {
      onSuccess();
      onOpenChange(false);
    } else {
      setError("Incorrect PIN. Please try again.");
      setAttempts(attempts + 1);
      setPin(["", "", "", ""]);
      inputRefs.current[0]?.focus();
      
      if (attempts >= 2) {
        setError("Too many failed attempts. Please try again later.");
        setTimeout(() => onOpenChange(false), 2000);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullPin = pin.join("");
    if (fullPin.length === 4) {
      verifyEnteredPin(fullPin);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="font-black uppercase text-center">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* PIN Input */}
          <div className="flex justify-center gap-3">
            {pin.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-14 h-14 text-center text-2xl font-bold"
                autoComplete="off"
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={pin.join("").length !== 4 || attempts >= 3}
            >
              Unlock
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Forgot your PIN? Contact support for assistance
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
