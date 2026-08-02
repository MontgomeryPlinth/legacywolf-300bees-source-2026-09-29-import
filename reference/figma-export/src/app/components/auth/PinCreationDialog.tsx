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
import { Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { usePin } from "../../contexts/PinContext";

interface PinCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export function PinCreationDialog({
  open,
  onOpenChange,
  onSuccess,
  title = "Create Your Security PIN",
  description = "This PIN protects access to your sensitive property details",
}: PinCreationDialogProps) {
  const { createPin } = usePin();
  const [step, setStep] = useState<"create" | "confirm">("create");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (open) {
      setStep("create");
      setPin(["", "", "", ""]);
      setConfirmPin(["", "", "", ""]);
      setError("");
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [open]);

  const handleChange = (
    index: number,
    value: string,
    isConfirm: boolean = false
  ) => {
    if (value && !/^\d$/.test(value)) return;

    const refs = isConfirm ? confirmInputRefs : inputRefs;
    const currentPin = isConfirm ? confirmPin : pin;
    const setCurrentPin = isConfirm ? setConfirmPin : setPin;

    const newPin = [...currentPin];
    newPin[index] = value;
    setCurrentPin(newPin);
    setError("");

    if (value && index < 3) {
      refs.current[index + 1]?.focus();
    }

    // Auto-advance to confirmation step
    if (!isConfirm && index === 3 && value) {
      setTimeout(() => {
        setStep("confirm");
        confirmInputRefs.current[0]?.focus();
      }, 200);
    }

    // Auto-verify when confirmation is complete
    if (isConfirm && index === 3 && value) {
      setTimeout(() => {
        const fullConfirmPin = [...newPin.slice(0, 3), value].join("");
        verifyAndCreate(fullConfirmPin);
      }, 100);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent,
    isConfirm: boolean = false
  ) => {
    const refs = isConfirm ? confirmInputRefs : inputRefs;
    const currentPin = isConfirm ? confirmPin : pin;

    if (e.key === "Backspace" && !currentPin[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }

    // Allow going back to create step on first input backspace
    if (
      isConfirm &&
      e.key === "Backspace" &&
      index === 0 &&
      !currentPin[0]
    ) {
      setStep("create");
      setConfirmPin(["", "", "", ""]);
      setTimeout(() => inputRefs.current[3]?.focus(), 100);
    }
  };

  const verifyAndCreate = (fullConfirmPin: string) => {
    const fullPin = pin.join("");

    if (fullPin !== fullConfirmPin) {
      setError("PINs do not match. Please try again.");
      setConfirmPin(["", "", "", ""]);
      confirmInputRefs.current[0]?.focus();
      return;
    }

    // Validate PIN strength (not sequential, not all same)
    if (/^(\d)\1{3}$/.test(fullPin)) {
      setError("PIN cannot be all the same digit.");
      setConfirmPin(["", "", "", ""]);
      confirmInputRefs.current[0]?.focus();
      return;
    }

    if (
      fullPin === "1234" ||
      fullPin === "4321" ||
      fullPin === "0000"
    ) {
      setError("Please choose a more secure PIN.");
      setConfirmPin(["", "", "", ""]);
      confirmInputRefs.current[0]?.focus();
      return;
    }

    // Create the PIN
    createPin(fullPin);
    onSuccess();
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === "create") {
      const fullPin = pin.join("");
      if (fullPin.length === 4) {
        setStep("confirm");
        setTimeout(() => confirmInputRefs.current[0]?.focus(), 100);
      }
    } else {
      const fullConfirmPin = confirmPin.join("");
      if (fullConfirmPin.length === 4) {
        verifyAndCreate(fullConfirmPin);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10">
              {step === "confirm" ? (
                <CheckCircle2 className="w-8 h-8 text-primary" />
              ) : (
                <Lock className="w-8 h-8 text-primary" />
              )}
            </div>
          </div>
          <DialogTitle className="font-black uppercase text-center">
            {step === "create" ? title : "Confirm Your PIN"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === "create"
              ? description
              : "Enter your PIN again to confirm"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                step === "create" ? "bg-primary" : "bg-muted"
              }`}
            />
            <div
              className={`w-2 h-2 rounded-full ${
                step === "confirm" ? "bg-primary" : "bg-muted"
              }`}
            />
          </div>

          {/* PIN Input - Create */}
          {step === "create" && (
            <div className="flex justify-center gap-3">
              {pin.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value, false)}
                  onKeyDown={(e) => handleKeyDown(index, e, false)}
                  className="w-14 h-14 text-center text-2xl font-bold"
                  autoComplete="off"
                />
              ))}
            </div>
          )}

          {/* PIN Input - Confirm */}
          {step === "confirm" && (
            <div className="flex justify-center gap-3">
              {confirmPin.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (confirmInputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value, true)}
                  onKeyDown={(e) => handleKeyDown(index, e, true)}
                  className="w-14 h-14 text-center text-2xl font-bold"
                  autoComplete="off"
                />
              ))}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* PIN Requirements */}
          {step === "create" && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs font-medium mb-2">PIN Requirements:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Must be exactly 4 digits</li>
                <li>• Cannot be 1234, 0000, or all same digits</li>
                <li>• Choose something memorable but secure</li>
              </ul>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            {step === "confirm" && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setStep("create");
                  setConfirmPin(["", "", "", ""]);
                  setTimeout(() => inputRefs.current[0]?.focus(), 100);
                }}
              >
                Back
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1"
              disabled={
                step === "create"
                  ? pin.join("").length !== 4
                  : confirmPin.join("").length !== 4
              }
            >
              {step === "create" ? "Continue" : "Create PIN"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
