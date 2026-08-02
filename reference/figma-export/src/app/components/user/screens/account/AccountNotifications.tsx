import { useState } from "react";
import { Card } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Label } from "../../../ui/label";
import { Switch } from "../../../ui/switch";
import { Bell, Moon, Timer, Calendar, Shield, Zap, Mail, MessageSquare, X, BatteryLow } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../../ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";

interface AccountNotificationsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountNotifications({
  open,
  onOpenChange,
}: AccountNotificationsProps) {
  const [notifications, setNotifications] = useState({
    // Motion Timer & Check-ins
    motionTimerReminders: true,
    graceWindowAlerts: true,
    checkInConfirmations: true,
    timerPauseNotifications: true,
    
    // Plan & Account
    planHealthUpdates: true,
    monthlyPlanReviews: true,
    subscriptionReminders: true,
    paymentFailures: true,
    
    // Emergency & Drills
    drillReminders: true,
    drillCompletionSummary: true,
    emergencyAlerts: true,
    incidentUpdates: true,
    
    // People & Contacts
    contactAcceptance: true,
    contactChanges: true,
    petGuardianUpdates: true,
    
    // Security & Privacy
    loginAlerts: true,
    unusualActivity: true,
    dataAccessLogs: true,
    authorizationChanges: true,
    
    // Battery
    batteryLowWarning: true,
    batteryContactAlert: true,

    // Marketing & Updates
    productUpdates: true,
    tips: false,
    newsletter: false,
    surveys: false,
  });

  const [batteryBehaviour, setBatteryBehaviour] = useState<"keep-monitoring" | "pause" | "alert-contact">("keep-monitoring");

  const [quietHours, setQuietHours] = useState({
    enabled: true,
    startTime: "22:00",
    endTime: "07:00",
    allowEmergencies: true,
  });

  const [channels, setChannels] = useState({
    push: true,
    sms: true,
    email: true,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const toggleChannel = (key: keyof typeof channels) => {
    setChannels({ ...channels, [key]: !channels[key] });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[95vh] overflow-y-auto">
        <SheetHeader className="pb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-black uppercase tracking-tight text-xl">
              Notifications
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
            Control when and how you receive notifications
          </p>
        </SheetHeader>

        <div className="space-y-6 pb-24">
          {/* Notification Channels */}
          <Card className="p-6">
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-4">
              Notification Channels
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <Label className="font-medium">Push Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      In-app alerts and mobile notifications
                    </p>
                  </div>
                </div>
                <Switch
                  checked={channels.push}
                  onCheckedChange={() => toggleChannel("push")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <Label className="font-medium">SMS Messages</Label>
                    <p className="text-xs text-muted-foreground">
                      Critical alerts via text message
                    </p>
                  </div>
                </div>
                <Switch
                  checked={channels.sms}
                  onCheckedChange={() => toggleChannel("sms")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <Label className="font-medium">Email</Label>
                    <p className="text-xs text-muted-foreground">
                      Summaries and non-urgent updates
                    </p>
                  </div>
                </div>
                <Switch
                  checked={channels.email}
                  onCheckedChange={() => toggleChannel("email")}
                />
              </div>
            </div>
          </Card>

          {/* Quiet Hours */}
          <Card className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <Moon className="w-5 h-5 text-primary mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs uppercase tracking-wide text-muted-foreground">
                    Quiet Hours
                  </h3>
                  <Switch
                    checked={quietHours.enabled}
                    onCheckedChange={(checked) =>
                      setQuietHours({ ...quietHours, enabled: checked })
                    }
                  />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Silence non-emergency notifications during specific hours
                </p>

                {quietHours.enabled && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                          Start Time
                        </Label>
                        <Select
                          value={quietHours.startTime}
                          onValueChange={(value) =>
                            setQuietHours({ ...quietHours, startTime: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i.toString().padStart(2, "0");
                              return (
                                <SelectItem key={hour} value={`${hour}:00`}>
                                  {hour}:00
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                          End Time
                        </Label>
                        <Select
                          value={quietHours.endTime}
                          onValueChange={(value) =>
                            setQuietHours({ ...quietHours, endTime: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i.toString().padStart(2, "0");
                              return (
                                <SelectItem key={hour} value={`${hour}:00`}>
                                  {hour}:00
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <Label className="font-medium">
                          Allow Emergency Alerts
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Grace window and emergency alerts ignore quiet hours
                        </p>
                      </div>
                      <Switch
                        checked={quietHours.allowEmergencies}
                        onCheckedChange={(checked) =>
                          setQuietHours({
                            ...quietHours,
                            allowEmergencies: checked,
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Motion Timer & Check-ins */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Timer className="w-5 h-5 text-primary" />
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground">
                Motion Timer & Check-ins
              </h3>
            </div>
            <div className="space-y-4">
              <NotificationToggle
                label="Motion Timer Reminders"
                description="Alerts before your next check-in is due"
                checked={notifications.motionTimerReminders}
                onChange={() => toggleNotification("motionTimerReminders")}
              />
              <NotificationToggle
                label="Grace Window Alerts"
                description="Critical alerts when grace window is active"
                checked={notifications.graceWindowAlerts}
                onChange={() => toggleNotification("graceWindowAlerts")}
                critical
              />
              <NotificationToggle
                label="Check-in Confirmations"
                description="Confirmation when you check in successfully"
                checked={notifications.checkInConfirmations}
                onChange={() => toggleNotification("checkInConfirmations")}
              />
              <NotificationToggle
                label="Timer Pause Notifications"
                description="When you pause or resume your timer"
                checked={notifications.timerPauseNotifications}
                onChange={() => toggleNotification("timerPauseNotifications")}
              />
            </div>
          </Card>

          {/* Battery Behaviour */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <BatteryLow className="w-5 h-5 text-primary" />
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground">Battery Behaviour</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-5 pl-7">
              Choose what Legacy Wolf does if your phone battery dies and monitoring is interrupted.
            </p>

            <div className="space-y-2 mb-5">
              {[
                {
                  value: "keep-monitoring" as const,
                  label: "Keep monitoring",
                  description: "Assume you're alive. Timer continues on our end. You'll be prompted to check in when the phone turns back on.",
                },
                {
                  value: "pause" as const,
                  label: "Pause monitoring",
                  description: "Suspend the timer until your device reconnects. No alert is triggered.",
                },
                {
                  value: "alert-contact" as const,
                  label: "Alert primary contact",
                  description: "Notify your primary contact that your phone has gone offline. They can check on you.",
                },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBatteryBehaviour(opt.value)}
                  className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-all ${
                    batteryBehaviour === opt.value
                      ? "border-primary bg-primary/8"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                      batteryBehaviour === opt.value ? "border-primary" : "border-border"
                    }`}>
                      {batteryBehaviour === opt.value && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${batteryBehaviour === opt.value ? "text-primary" : "text-foreground"}`}>
                        {opt.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{opt.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-4 pt-3 border-t border-border">
              <NotificationToggle
                label="Low battery warning"
                description="Alert you at 20% battery so you can charge before monitoring is interrupted"
                checked={notifications.batteryLowWarning}
                onChange={() => toggleNotification("batteryLowWarning")}
              />
              <NotificationToggle
                label="Battery offline alert to contact"
                description="Send a heads-up to your primary contact if your phone goes offline unexpectedly"
                checked={notifications.batteryContactAlert}
                onChange={() => toggleNotification("batteryContactAlert")}
              />
            </div>
          </Card>

          {/* Plan & Account */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground">
                Plan & Account
              </h3>
            </div>
            <div className="space-y-4">
              <NotificationToggle
                label="Plan Health Updates"
                description="When your plan health score changes"
                checked={notifications.planHealthUpdates}
                onChange={() => toggleNotification("planHealthUpdates")}
              />
              <NotificationToggle
                label="Monthly Plan Reviews"
                description="Monthly reminder to review your plan"
                checked={notifications.monthlyPlanReviews}
                onChange={() => toggleNotification("monthlyPlanReviews")}
              />
              <NotificationToggle
                label="Subscription Reminders"
                description="Upcoming billing and renewal notices"
                checked={notifications.subscriptionReminders}
                onChange={() => toggleNotification("subscriptionReminders")}
              />
              <NotificationToggle
                label="Payment Failures"
                description="Immediate alerts for failed payments"
                checked={notifications.paymentFailures}
                onChange={() => toggleNotification("paymentFailures")}
                critical
              />
            </div>
          </Card>

          {/* Emergency & Drills */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground">
                Emergency & Drills
              </h3>
            </div>
            <div className="space-y-4">
              <NotificationToggle
                label="Drill Reminders"
                description="Reminders to run regular test drills"
                checked={notifications.drillReminders}
                onChange={() => toggleNotification("drillReminders")}
              />
              <NotificationToggle
                label="Drill Completion Summary"
                description="Results after completing a drill"
                checked={notifications.drillCompletionSummary}
                onChange={() => toggleNotification("drillCompletionSummary")}
              />
              <NotificationToggle
                label="Emergency Alerts"
                description="All emergency incident notifications"
                checked={notifications.emergencyAlerts}
                onChange={() => toggleNotification("emergencyAlerts")}
                critical
              />
              <NotificationToggle
                label="Incident Updates"
                description="Real-time updates during active incidents"
                checked={notifications.incidentUpdates}
                onChange={() => toggleNotification("incidentUpdates")}
                critical
              />
            </div>
          </Card>

          {/* People & Contacts */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground">
                People & Contacts
              </h3>
            </div>
            <div className="space-y-4">
              <NotificationToggle
                label="Contact Acceptance"
                description="When a nominated contact accepts their role"
                checked={notifications.contactAcceptance}
                onChange={() => toggleNotification("contactAcceptance")}
              />
              <NotificationToggle
                label="Contact Changes"
                description="When contacts update their information"
                checked={notifications.contactChanges}
                onChange={() => toggleNotification("contactChanges")}
              />
              <NotificationToggle
                label="Pet Guardian Updates"
                description="Changes to your pet guardian status"
                checked={notifications.petGuardianUpdates}
                onChange={() => toggleNotification("petGuardianUpdates")}
              />
            </div>
          </Card>

          {/* Security & Privacy */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground">
                Security & Privacy
              </h3>
            </div>
            <div className="space-y-4">
              <NotificationToggle
                label="Login Alerts"
                description="New device or location sign-ins"
                checked={notifications.loginAlerts}
                onChange={() => toggleNotification("loginAlerts")}
              />
              <NotificationToggle
                label="Unusual Activity"
                description="Suspicious account activity detected"
                checked={notifications.unusualActivity}
                onChange={() => toggleNotification("unusualActivity")}
                critical
              />
              <NotificationToggle
                label="Data Access Logs"
                description="When your data is accessed during incidents"
                checked={notifications.dataAccessLogs}
                onChange={() => toggleNotification("dataAccessLogs")}
              />
              <NotificationToggle
                label="Authorization Changes"
                description="When legal authorizations require updates"
                checked={notifications.authorizationChanges}
                onChange={() => toggleNotification("authorizationChanges")}
              />
            </div>
          </Card>

          {/* Marketing & Updates */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-primary" />
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground">
                Marketing & Updates
              </h3>
            </div>
            <div className="space-y-4">
              <NotificationToggle
                label="Product Updates"
                description="New features and improvements"
                checked={notifications.productUpdates}
                onChange={() => toggleNotification("productUpdates")}
              />
              <NotificationToggle
                label="Tips & Best Practices"
                description="Helpful tips to get the most from Legacy Wolf"
                checked={notifications.tips}
                onChange={() => toggleNotification("tips")}
              />
              <NotificationToggle
                label="Newsletter"
                description="Monthly newsletter and community stories"
                checked={notifications.newsletter}
                onChange={() => toggleNotification("newsletter")}
              />
              <NotificationToggle
                label="Surveys & Feedback"
                description="Occasional requests for product feedback"
                checked={notifications.surveys}
                onChange={() => toggleNotification("surveys")}
              />
            </div>
          </Card>

          {/* Save Button */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
            <Button className="w-full" onClick={() => onOpenChange(false)}>
              Save Notification Preferences
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface NotificationToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  critical?: boolean;
}

function NotificationToggle({
  label,
  description,
  checked,
  onChange,
  critical,
}: NotificationToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Label className="font-medium">{label}</Label>
          {critical && (
            <span className="text-xs text-destructive font-medium">
              CRITICAL
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={critical} />
    </div>
  );
}
