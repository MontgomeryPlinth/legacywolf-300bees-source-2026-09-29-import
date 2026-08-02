import { useState } from "react";
import { Card } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Badge } from "../../../ui/badge";
import {
  CreditCard,
  CheckCircle2,
  Plus,
  Trash2,
  AlertCircle,
  Shield,
  X,
  Star,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { RadioGroup, RadioGroupItem } from "../../../ui/radio-group";

interface AccountSubscriptionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PaymentMethod {
  id: string;
  type: "card" | "bank";
  last4: string;
  brand?: string;
  expiryMonth?: string;
  expiryYear?: string;
  bankName?: string;
  isPrimary: boolean;
  isBackup: boolean;
  backupOrder?: number;
}

export function AccountSubscription({
  open,
  onOpenChange,
}: AccountSubscriptionProps) {
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showChangePlan, setShowChangePlan] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "pm_1",
      type: "card",
      last4: "4242",
      brand: "Visa",
      expiryMonth: "12",
      expiryYear: "2027",
      isPrimary: true,
      isBackup: false,
    },
    {
      id: "pm_2",
      type: "card",
      last4: "5555",
      brand: "Mastercard",
      expiryMonth: "09",
      expiryYear: "2026",
      isPrimary: false,
      isBackup: true,
      backupOrder: 1,
    },
  ]);

  const currentPlan = {
    tier: "full",
    name: "Full Tier",
    price: 89,
    features: [
      "Attend & Check",
      "Pet Guardian",
      "Reputation Guard / Pants On Service",
      "Priority response",
      "Hand-off Letters",
    ],
  };

  const plans = [
    {
      tier: "friend-alert",
      name: "Friend Alert",
      price: 29,
      features: [
        "Nominated Contact notification only",
        "No physical response",
        "Access details sharing (optional)",
      ],
    },
    {
      tier: "attend-check",
      name: "Attend & Check",
      price: 59,
      features: [
        "Accredited Legacy Wolf Responder dispatch",
        "Physical check-in at property",
        "Emergency services coordination",
      ],
    },
    {
      tier: "pet-guardian",
      name: "Pet Guardian",
      price: 69,
      features: [
        "Everything in Attend & Check",
        "Pet care and handover",
        "Vet coordination if needed",
      ],
    },
    {
      tier: "full",
      name: "Full Tier",
      price: 89,
      features: [
        "Everything in Pet Guardian",
        "Reputation Guard / Pants On Service",
        "Priority response",
        "Hand-off Letters",
      ],
    },
  ];

  const canAddMoreBackups = paymentMethods.filter((pm) => pm.isBackup).length < 6;

  const handleSetPrimary = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((pm) => ({
        ...pm,
        isPrimary: pm.id === id,
      }))
    );
  };

  const handleSetAsBackup = (id: string) => {
    const currentBackups = paymentMethods.filter((pm) => pm.isBackup);
    if (currentBackups.length >= 6) return;

    setPaymentMethods(
      paymentMethods.map((pm) =>
        pm.id === id
          ? {
              ...pm,
              isBackup: true,
              backupOrder: currentBackups.length + 1,
            }
          : pm
      )
    );
  };

  const handleRemoveBackup = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((pm) =>
        pm.id === id ? { ...pm, isBackup: false, backupOrder: undefined } : pm
      )
    );
  };

  const handleRemovePayment = (id: string) => {
    setPaymentMethods(paymentMethods.filter((pm) => pm.id !== id));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[95vh] overflow-y-auto">
        <SheetHeader className="pb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-black uppercase tracking-tight text-xl">
              Subscription & Billing
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
            Manage your plan and payment methods
          </p>
        </SheetHeader>

        <div className="space-y-6 pb-24">
          {/* Current Plan */}
          <Card className="p-6 bg-primary/10 border-primary/30">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-black uppercase">
                    {currentPlan.name}
                  </h3>
                  <Badge className="bg-primary text-primary-foreground">
                    ACTIVE
                  </Badge>
                </div>
                <p className="text-3xl font-black text-primary">
                  ${currentPlan.price}
                  <span className="text-base text-muted-foreground font-normal">
                    {" "}
                    / month
                  </span>
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChangePlan(true)}
              >
                Change Plan
              </Button>
            </div>

            <div className="space-y-2 mb-4">
              {currentPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border/50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs uppercase text-muted-foreground tracking-wide">
                    Next Billing Date
                  </p>
                  <p className="font-medium mt-1">February 23, 2026</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase text-muted-foreground tracking-wide">
                    Amount Due
                  </p>
                  <p className="font-medium mt-1">${currentPlan.price}.00 AUD</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Methods */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground">
                Payment Methods
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddPayment(true)}
                disabled={!canAddMoreBackups}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Payment
              </Button>
            </div>

            {/* Primary Payment Method */}
            <Card className="p-5 mb-3">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Primary Payment Method
                </p>
              </div>
              {paymentMethods
                .filter((pm) => pm.isPrimary)
                .map((pm) => (
                  <div key={pm.id} className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {pm.brand} •••• {pm.last4}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Expires {pm.expiryMonth}/{pm.expiryYear}
                      </p>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">
                      PRIMARY
                    </Badge>
                  </div>
                ))}
            </Card>

            {/* Mandatory Backup - Always Show Alert if No Backup */}
            {paymentMethods.filter((pm) => pm.isBackup).length === 0 && (
              <Card className="p-5 mb-3 bg-destructive/10 border-destructive/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium mb-1">Backup Payment Required</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Add at least one backup payment method to ensure
                      uninterrupted service
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setShowAddPayment(true)}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Backup Payment
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Backup Payment Methods */}
            {paymentMethods.filter((pm) => pm.isBackup).length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Backup Payment Methods (
                    {paymentMethods.filter((pm) => pm.isBackup).length}/6)
                  </p>
                </div>

                {paymentMethods
                  .filter((pm) => pm.isBackup)
                  .sort((a, b) => (a.backupOrder || 0) - (b.backupOrder || 0))
                  .map((pm) => (
                    <Card key={pm.id} className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs font-bold">
                          #{pm.backupOrder}
                        </div>
                        <div className="p-3 rounded-full bg-muted">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {pm.brand} •••• {pm.last4}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Expires {pm.expiryMonth}/{pm.expiryYear}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetPrimary(pm.id)}
                          >
                            Set Primary
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveBackup(pm.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            )}

            {/* Other Payment Methods (not primary, not backup) */}
            {paymentMethods.filter((pm) => !pm.isPrimary && !pm.isBackup)
              .length > 0 && (
              <div className="space-y-3 mt-6">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Other Payment Methods
                </p>
                {paymentMethods
                  .filter((pm) => !pm.isPrimary && !pm.isBackup)
                  .map((pm) => (
                    <Card key={pm.id} className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-muted">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {pm.brand} •••• {pm.last4}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Expires {pm.expiryMonth}/{pm.expiryYear}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetPrimary(pm.id)}
                          >
                            Set Primary
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetAsBackup(pm.id)}
                            disabled={!canAddMoreBackups}
                          >
                            Set as Backup
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemovePayment(pm.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-4">
              We recommend maintaining at least 2 backup payment methods to
              prevent service interruption. You can add up to 6 backup methods.
            </p>
          </div>

          {/* Billing History */}
          <Card className="p-6">
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-4">
              Recent Billing History
            </h3>
            <div className="space-y-3">
              {[
                {
                  date: "Jan 23, 2026",
                  amount: 89,
                  status: "paid",
                  invoice: "INV-2026-001",
                },
                {
                  date: "Dec 23, 2025",
                  amount: 89,
                  status: "paid",
                  invoice: "INV-2025-012",
                },
                {
                  date: "Nov 23, 2025",
                  amount: 89,
                  status: "paid",
                  invoice: "INV-2025-011",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b last:border-b-0"
                >
                  <div>
                    <p className="font-medium">{item.date}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.invoice}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="font-medium">${item.amount}.00</p>
                      <Badge
                        variant="outline"
                        className="text-xs border-primary text-primary"
                      >
                        {item.status.toUpperCase()}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm">
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Invoices
            </Button>
          </Card>

          {/* Cancel Subscription */}
          <Card className="p-6 bg-destructive/10 border-destructive/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium mb-1">Cancel Subscription</p>
                <p className="text-sm text-muted-foreground mb-4">
                  You'll lose access to all Legacy Wolf services. We'll keep
                  your data for 30 days in case you change your mind.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                  onClick={() => setShowCancelDialog(true)}
                >
                  Cancel My Subscription
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Add Payment Dialog */}
        <Dialog open={showAddPayment} onOpenChange={setShowAddPayment}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-black uppercase">
                Add Payment Method
              </DialogTitle>
              <DialogDescription>
                Enter your card details to add a new payment method
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Card Number</Label>
                <Input placeholder="1234 5678 9012 3456" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input placeholder="MM/YY" />
                </div>
                <div className="space-y-2">
                  <Label>CVC</Label>
                  <Input placeholder="123" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cardholder Name</Label>
                <Input placeholder="Name on card" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddPayment(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowAddPayment(false)}>
                Add Payment Method
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Change Plan Dialog */}
        <Dialog open={showChangePlan} onOpenChange={setShowChangePlan}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-black uppercase">
                Change Your Plan
              </DialogTitle>
              <DialogDescription>
                Select a new tier. Changes take effect on your next billing date.
              </DialogDescription>
            </DialogHeader>
            <RadioGroup defaultValue={currentPlan.tier} className="space-y-3 py-4">
              {plans.map((plan) => (
                <Card
                  key={plan.tier}
                  className={`p-5 cursor-pointer ${
                    plan.tier === currentPlan.tier
                      ? "border-primary bg-primary/5"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <RadioGroupItem value={plan.tier} id={plan.tier} />
                    <Label htmlFor={plan.tier} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-black uppercase">{plan.name}</h4>
                        <p className="text-xl font-black">
                          ${plan.price}
                          <span className="text-sm text-muted-foreground font-normal">
                            /mo
                          </span>
                        </p>
                      </div>
                      <div className="space-y-1">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Label>
                  </div>
                </Card>
              ))}
            </RadioGroup>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowChangePlan(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowChangePlan(false)}>
                Confirm Plan Change
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel Subscription Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-black uppercase">
                Cancel Subscription
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel your Legacy Wolf subscription?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Reason for canceling (required)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="too-expensive">Too expensive</SelectItem>
                    <SelectItem value="not-needed">
                      No longer need the service
                    </SelectItem>
                    <SelectItem value="technical-issues">
                      Technical issues
                    </SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Card className="p-4 bg-muted">
                <p className="text-sm font-medium mb-2">What happens next:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Your plan remains active until February 23, 2026</li>
                  <li>No further charges will be made</li>
                  <li>We'll keep your data for 30 days in case you return</li>
                  <li>You can reactivate anytime during this period</li>
                </ul>
              </Card>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                Keep My Subscription
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowCancelDialog(false)}
              >
                Confirm Cancellation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
}
