import { useState } from "react";
import { Card } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import { Label } from "../../../ui/label";
import { Input } from "../../../ui/input";
import { Switch } from "../../../ui/switch";
import {
  Shield,
  Smartphone,
  Fingerprint,
  Key,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  Lock,
  Eye,
  Monitor,
  MapPin,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../../ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../ui/alert-dialog";
import { usePin } from "../../../../contexts/PinContext";
import { toast } from "sonner";

interface AccountSecurityProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export function AccountSecurity({ open, onOpenChange }: AccountSecurityProps) {
  const { hasPin, updatePin: updatePinContext } = usePin();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showSetupTwoFactor, setShowSetupTwoFactor] = useState(false);
  const [showDataExport, setShowDataExport] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showChangePinDialog, setShowChangePinDialog] = useState(false);

  const [security, setSecurity] = useState({
    biometricLock: true,
    pinEnabled: true,
    twoFactorEnabled: false,
    loginNotifications: true,
  });

  const [pinForm, setPinForm] = useState({
    currentPin: "",
    newPin: "",
    confirmPin: "",
  });
  const [pinError, setPinError] = useState("");

  const handleChangePinSubmit = () => {
    setPinError("");

    if (pinForm.newPin.length !== 4 || !/^\d{4}$/.test(pinForm.newPin)) {
      setPinError("PIN must be exactly 4 digits");
      return;
    }

    if (pinForm.newPin !== pinForm.confirmPin) {
      setPinError("New PINs do not match");
      return;
    }

    if (pinForm.newPin === "1234" || pinForm.newPin === "0000" || /^(\d)\1{3}$/.test(pinForm.newPin)) {
      setPinError("Please choose a more secure PIN");
      return;
    }

    const success = updatePinContext(pinForm.currentPin, pinForm.newPin);
    
    if (success) {
      toast.success("PIN updated successfully");
      setShowChangePinDialog(false);
      setPinForm({ currentPin: "", newPin: "", confirmPin: "" });
    } else {
      setPinError("Current PIN is incorrect");
    }
  };

  const [sessions, setSessions] = useState<Session[]>([
    {
      id: "session_1",
      device: "iPhone 14 Pro • iOS 17.2",
      location: "Melbourne, VIC",
      lastActive: "Active now",
      isCurrent: true,
    },
    {
      id: "session_2",
      device: "Safari • macOS",
      location: "Melbourne, VIC",
      lastActive: "2 hours ago",
      isCurrent: false,
    },
    {
      id: "session_3",
      device: "Chrome • Windows",
      location: "Sydney, NSW",
      lastActive: "3 days ago",
      isCurrent: false,
    },
  ]);

  const handleRevokeSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
  };

  const handleRevokeAllOther = () => {
    setSessions(sessions.filter((s) => s.isCurrent));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[95vh] overflow-y-auto">
        <SheetHeader className="pb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-black uppercase tracking-tight text-xl">
              Security & Privacy
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-left">
            Manage your security settings and privacy controls
          </p>
        </SheetHeader>

        <div className="space-y-6 pb-24">
          {/* Security Status */}
          <Card className="p-5 bg-primary/10 border-primary/30">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Your Account is Secure</p>
                <p className="text-sm text-muted-foreground">
                  Biometric lock and PIN are enabled. Consider enabling
                  two-factor authentication for additional protection.
                </p>
              </div>
            </div>
          </Card>

          {/* App Security */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Fingerprint className="w-5 h-5 text-primary" />
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground">
                App Security
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Biometric Lock</Label>
                  <p className="text-xs text-muted-foreground">
                    Face ID or fingerprint to open the app
                  </p>
                </div>
                <Switch
                  checked={security.biometricLock}
                  onCheckedChange={(checked) =>
                    setSecurity({ ...security, biometricLock: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">PIN Lock</Label>
                  <p className="text-xs text-muted-foreground">
                    Require PIN when biometric fails
                  </p>
                </div>
                <Switch
                  checked={security.pinEnabled}
                  onCheckedChange={(checked) =>
                    setSecurity({ ...security, pinEnabled: checked })
                  }
                />
              </div>

              {security.pinEnabled && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => setShowChangePinDialog(true)}
                >
                  <Key className="w-4 h-4" />
                  Change PIN
                </Button>
              )}
            </div>
          </Card>

          {/* Account Security */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-primary" />
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground">
                Account Security
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-medium">Password</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowChangePassword(true)}
                  >
                    Change
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Last changed 6 months ago
                </p>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <Label className="font-medium">Two-Factor Authentication</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  {security.twoFactorEnabled ? (
                    <Badge className="bg-primary text-primary-foreground gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      ENABLED
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      DISABLED
                    </Badge>
                  )}
                </div>
                {!security.twoFactorEnabled ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => setShowSetupTwoFactor(true)}
                  >
                    Enable Two-Factor Authentication
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() =>
                      setSecurity({ ...security, twoFactorEnabled: false })
                    }
                  >
                    Disable Two-Factor Authentication
                  </Button>
                )}
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Login Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Alert me about new sign-ins
                    </p>
                  </div>
                  <Switch
                    checked={security.loginNotifications}
                    onCheckedChange={(checked) =>
                      setSecurity({ ...security, loginNotifications: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Active Sessions */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" />
                <h3 className="text-xs uppercase tracking-wide text-muted-foreground">
                  Active Sessions
                </h3>
              </div>
              {sessions.filter((s) => !s.isCurrent).length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRevokeAllOther}
                  className="text-destructive"
                >
                  Revoke All Others
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {sessions.map((session) => (
                <Card key={session.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-muted">
                      {session.device.includes("iPhone") ? (
                        <Smartphone className="w-4 h-4" />
                      ) : (
                        <Monitor className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{session.device}</p>
                        {session.isCurrent && (
                          <Badge className="bg-primary text-primary-foreground text-xs">
                            CURRENT
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{session.location}</span>
                        <span>•</span>
                        <span>{session.lastActive}</span>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeSession(session.id)}
                        className="text-destructive flex-shrink-0"
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Sessions expire after 30 days of inactivity
            </p>
          </Card>

          {/* Privacy Controls */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-primary" />
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground">
                Privacy Controls
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="font-medium mb-2 block">
                  Data Encryption
                </Label>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-start gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      All sensitive data (access details, legal documents) is
                      encrypted at rest using AES-256 encryption
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      Data is only decrypted during active incidents with proper
                      authorization
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Label className="font-medium mb-2 block">
                  Access Audit Trail
                </Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Every time your data is accessed, we log who, when, and why
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Access Log
                </Button>
              </div>
            </div>
          </Card>

          {/* Data Export & Deletion */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Download className="w-5 h-5 text-primary" />
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground">
                Your Data
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="font-medium mb-2 block">Export Your Data</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Download a complete copy of all your Legacy Wolf data
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => setShowDataExport(true)}
                >
                  <Download className="w-4 h-4" />
                  Request Data Export
                </Button>
              </div>

              <div className="pt-4 border-t">
                <Label className="font-medium mb-2 block">
                  Delete Your Account
                </Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Permanently delete your account and all associated data
                </p>
                <Card className="p-4 bg-destructive/10 border-destructive/30 mb-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      This action cannot be undone. Your plan will be canceled
                      and all data will be permanently deleted after 30 days.
                    </p>
                  </div>
                </Card>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-destructive text-destructive hover:bg-destructive hover:text-white gap-2"
                  onClick={() => setShowDeleteAccount(true)}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete My Account
                </Button>
              </div>
            </div>
          </Card>

          {/* Compliance */}
          <Card className="p-5 bg-muted">
            <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
              Privacy & Compliance
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                • Legacy Wolf complies with Australian Privacy Principles (APPs)
              </p>
              <p>
                • We never sell your data to third parties
              </p>
              <p>
                • Responders can only access your data during active incidents
              </p>
              <p>
                • All data access is logged and auditable
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="ghost" size="sm" className="text-xs h-auto p-0">
                Privacy Policy
              </Button>
              <span className="text-muted-foreground">•</span>
              <Button variant="ghost" size="sm" className="text-xs h-auto p-0">
                Terms of Service
              </Button>
            </div>
          </Card>
        </div>

        {/* Change Password Dialog */}
        <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-black uppercase">
                Change Password
              </DialogTitle>
              <DialogDescription>
                Enter your current password and choose a new one
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input type="password" />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowChangePassword(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setShowChangePassword(false)}>
                Change Password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Two-Factor Setup Dialog */}
        <Dialog open={showSetupTwoFactor} onOpenChange={setShowSetupTwoFactor}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-black uppercase">
                Enable Two-Factor Authentication
              </DialogTitle>
              <DialogDescription>
                Scan this QR code with your authenticator app
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex justify-center">
                <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">QR Code</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Or enter this code manually</Label>
                <Input value="ABCD EFGH IJKL MNOP" readOnly />
              </div>
              <div className="space-y-2">
                <Label>Verification Code</Label>
                <Input placeholder="Enter 6-digit code" maxLength={6} />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowSetupTwoFactor(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setSecurity({ ...security, twoFactorEnabled: true });
                  setShowSetupTwoFactor(false);
                }}
              >
                Enable 2FA
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Data Export Dialog */}
        <Dialog open={showDataExport} onOpenChange={setShowDataExport}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-black uppercase">
                Request Data Export
              </DialogTitle>
              <DialogDescription>
                We'll compile all your data and send you a download link
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Card className="p-4 bg-muted">
                <p className="text-sm mb-3">Your export will include:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Profile and account information</li>
                  <li>Plan details and service history</li>
                  <li>Nominated contacts and pet information</li>
                  <li>Property access details</li>
                  <li>Legal authorizations (PDF)</li>
                  <li>Incident history and audit logs</li>
                </ul>
              </Card>
              <p className="text-xs text-muted-foreground mt-4">
                Processing typically takes 24-48 hours. You'll receive an email
                with a secure download link.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDataExport(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowDataExport(false)}>
                Request Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Account Dialog */}
        <AlertDialog open={showDeleteAccount} onOpenChange={setShowDeleteAccount}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-black uppercase">
                Delete Your Account?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove all your data from our servers after 30 days.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Card className="p-4 bg-muted my-4">
              <p className="text-sm font-medium mb-2">What happens next:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Your subscription will be canceled immediately</li>
                <li>Your Motion Timer will be deactivated</li>
                <li>All nominated contacts will be notified</li>
                <li>Data will be kept for 30 days, then permanently deleted</li>
                <li>You can restore your account within 30 days</li>
              </ul>
            </Card>
            <div className="space-y-2">
              <Label>Type "DELETE" to confirm</Label>
              <Input placeholder="DELETE" />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete My Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Change PIN Dialog */}
        <Dialog open={showChangePinDialog} onOpenChange={setShowChangePinDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-black uppercase">
                Change PIN
              </DialogTitle>
              <DialogDescription>
                Enter your current PIN and choose a new one
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Current PIN</Label>
                <Input
                  type="password"
                  value={pinForm.currentPin}
                  onChange={(e) => setPinForm({ ...pinForm, currentPin: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>New PIN</Label>
                <Input
                  type="password"
                  value={pinForm.newPin}
                  onChange={(e) => setPinForm({ ...pinForm, newPin: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm New PIN</Label>
                <Input
                  type="password"
                  value={pinForm.confirmPin}
                  onChange={(e) => setPinForm({ ...pinForm, confirmPin: e.target.value })}
                />
              </div>
              {pinError && (
                <p className="text-sm text-red-500 mt-2">{pinError}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowChangePinDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleChangePinSubmit}>
                Change PIN
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
}