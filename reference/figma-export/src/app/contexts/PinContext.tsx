import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface PinContextType {
  hasPin: boolean;
  isPinVerified: boolean;
  createPin: (pin: string) => void;
  verifyPin: (pin: string) => boolean;
  updatePin: (oldPin: string, newPin: string) => boolean;
  lockPin: () => void;
  getStoredPin: () => string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _g = globalThis as any;
const PinContext: ReturnType<typeof createContext<PinContextType | undefined>> =
  _g.__LW_PIN_CONTEXT ?? (_g.__LW_PIN_CONTEXT = createContext<PinContextType | undefined>(undefined));

export function PinProvider({ children }: { children: ReactNode }) {
  // In production, this would be stored securely (encrypted in backend)
  // For demo purposes, storing in localStorage with a simple hash
  const [isPinVerified, setIsPinVerified] = useState(false);

  const hashPin = (pin: string): string => {
    // Simple hash for demo - in production use proper crypto
    return btoa(pin + "legacy-wolf-salt");
  };

  // Initialize with default test PIN "1234" if none exists
  useEffect(() => {
    const storedPin = localStorage.getItem("lwUserPin");
    if (!storedPin) {
      const defaultPin = hashPin("1234");
      localStorage.setItem("lwUserPin", defaultPin);
    }
  }, []);

  const createPin = (pin: string) => {
    const hashedPin = hashPin(pin);
    try { localStorage.setItem("lwUserPin", hashedPin); } catch { /* sandboxed */ }
    setIsPinVerified(true);
  };

  const verifyPin = (pin: string): boolean => {
    const storedPin = localStorage.getItem("lwUserPin");
    if (!storedPin) return false;

    const hashedPin = hashPin(pin);
    const isValid = hashedPin === storedPin;
    
    if (isValid) {
      setIsPinVerified(true);
    }
    
    return isValid;
  };

  const updatePin = (oldPin: string, newPin: string): boolean => {
    if (!verifyPin(oldPin)) {
      return false;
    }
    
    createPin(newPin);
    return true;
  };

  const lockPin = () => {
    setIsPinVerified(false);
  };

  const getStoredPin = (): string | null => {
    try { return localStorage.getItem("lwUserPin"); } catch { return null; }
  };

  const hasPin = !!getStoredPin();

  return (
    <PinContext.Provider
      value={{
        hasPin,
        isPinVerified,
        createPin,
        verifyPin,
        updatePin,
        lockPin,
        getStoredPin,
      }}
    >
      {children}
    </PinContext.Provider>
  );
}

export function usePin() {
  const context = useContext(PinContext);
  if (context === undefined) {
    throw new Error("usePin must be used within a PinProvider");
  }
  return context;
}