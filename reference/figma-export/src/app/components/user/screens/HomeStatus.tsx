import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  Timer,
  AlertTriangle,
  Play,
  User,
  Dog,
  CheckCircle,
  Circle,
  Shield,
  Plane,
  Clock,
  Pause as PauseIcon,
  ChevronRight,
  Edit,
  Check,
  Lock,
  BatteryLow,
  ListOrdered,
} from "lucide-react";
import { useApp } from "../../../contexts/AppContext";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { EmergencyModal } from "../EmergencyModal";
import { TripModeModal } from "../TripModeModal";
import { SickModeModal } from "../SickModeModal";
import { NominatedContactsSheet } from "../NominatedContactsSheet";
import { PersonDetailSheet } from "../PersonDetailSheet";
import { PrimaryContactSheet } from "../PrimaryContactSheet";
import { EditInstructionsSheet } from "../EditInstructionsSheet";
import { EditTimerSheet } from "../sheets/EditTimerSheet";
import { BatteryBehaviourSheet } from "../sheets/BatteryBehaviourSheet";
import { ResponseQueueSheet } from "../sheets/ResponseQueueSheet";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../ui/sheet";
import { PetGuardianSheet } from "../sheets/PetGuardianSheet";

export function HomeStatus() {
  const { plan, motionTimer, pets, people, primaryContactId, checkIn, pauseMonitoring, resumeMonitoring, setTripMode, setSickMode, triggerEmergency, updateActiveServices, updatePet, reEnableBatteryRule, responseQueue } = useApp();
  const [timeRemaining, setTimeRemaining] = useState("");
  const [tripModeCountdown, setTripModeCountdown] = useState("");
  const [sickModeCountdown, setSickModeCountdown] = useState("");
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showTripModeModal, setShowTripModeModal] = useState(false);
  const [showSickModeModal, setShowSickModeModal] = useState(false);
  const [showContactsSheet, setShowContactsSheet] = useState(false);
  const [showPersonDetail, setShowPersonDetail] = useState(false);
  const [showPrimaryContactSheet, setShowPrimaryContactSheet] = useState(false);
  const [showEditInstructionsSheet, setShowEditInstructionsSheet] = useState(false);
  const [showEditTimerSheet, setShowEditTimerSheet] = useState(false);
  const [quickSheet, setQuickSheet] = useState<null | "attend-check" | "pet-guardian" | "reputation-guard" | "friend-alert">(null);
  const [showBatterySheet, setShowBatterySheet] = useState(false);
  const [showQueueSheet, setShowQueueSheet] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [urgencyLevel, setUrgencyLevel] = useState<"safe" | "warning" | "critical">("safe");
  const [isPaused, setIsPaused] = useState(false);
  const [isInTripMode, setIsInTripMode] = useState(false);
  const [isInSickMode, setIsInSickMode] = useState(false);

  // Calculate time remaining with live countdown
  useEffect(() => {
    const updateTimer = () => {
      // Check if trip mode has expired
      if (isInTripMode && motionTimer.tripModeEndDate) {
        const now = new Date();
        if (now >= motionTimer.tripModeEndDate) {
          // Auto-resume from trip mode
          resumeMonitoring();
          setIsInTripMode(false);
          toast.success("Wolf Watch reactivated", {
            description: "Trip mode ended. Your protection is now active."
          });
          return;
        }

        // Calculate trip mode countdown
        const diff = motionTimer.tripModeEndDate.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        if (hours === 0 && minutes === 0) {
          setTripModeCountdown(`${seconds}s`);
        } else if (hours === 0) {
          setTripModeCountdown(`${minutes}m ${seconds}s`);
        } else if (hours < 24) {
          setTripModeCountdown(`${hours}h ${minutes}m`);
        } else {
          const days = Math.floor(hours / 24);
          const remainingHours = hours % 24;
          setTripModeCountdown(`${days}d ${remainingHours}h`);
        }
      }

      // Check if sick mode has expired
      if (isInSickMode && motionTimer.sickModeEndDate) {
        const now = new Date();
        if (now >= motionTimer.sickModeEndDate) {
          // Auto-resume from sick mode
          resumeMonitoring();
          setIsInSickMode(false);
          toast.success("Wolf Watch reactivated", {
            description: "Sick mode ended. Your protection is now active."
          });
          return;
        }

        // Calculate sick mode countdown
        const diff = motionTimer.sickModeEndDate.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        if (hours === 0 && minutes === 0) {
          setSickModeCountdown(`${seconds}s`);
        } else if (hours === 0) {
          setSickModeCountdown(`${minutes}m ${seconds}s`);
        } else if (hours < 24) {
          setSickModeCountdown(`${hours}h ${minutes}m`);
        } else {
          const days = Math.floor(hours / 24);
          const remainingHours = hours % 24;
          setSickModeCountdown(`${days}d ${remainingHours}h`);
        }
      }

      // If paused or in trip mode, don't update motion timer
      if (isPaused || isInTripMode || isInSickMode) {
        setTimeRemaining("Paused");
        return;
      }

      const now = new Date();
      const diff = motionTimer.nextCheckIn.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("0h 0m");
        setUrgencyLevel("critical");
        // Auto-trigger emergency modal when timer expires
        if (!showEmergencyModal && motionTimer.status === "active") {
          setShowEmergencyModal(true);
        }
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      // Show seconds when under 1 minute
      if (hours === 0 && minutes === 0) {
        setTimeRemaining(`${seconds}s`);
      } else if (hours === 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${hours}h ${minutes}m`);
      }

      // Set urgency levels
      const totalMinutes = hours * 60 + minutes;
      if (totalMinutes <= 30) {
        setUrgencyLevel("critical");
      } else if (totalMinutes <= 120) {
        setUrgencyLevel("warning");
      } else {
        setUrgencyLevel("safe");
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000); // Update every second for live countdown

    return () => clearInterval(interval);
  }, [motionTimer.nextCheckIn, showEmergencyModal, motionTimer.status, isPaused, isInTripMode, isInSickMode, motionTimer.tripModeEndDate, motionTimer.sickModeEndDate, resumeMonitoring]);

  const handleCheckIn = () => {
    checkIn();
    toast.success("Check-in successful", {
      description: `Timer reset. Next check-in by ${motionTimer.nextCheckIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    });
  };

  const primaryPet = pets[0];
  const primaryContact = people.find(p => p.id === primaryContactId);

  return (
    <div className="container max-w-2xl mx-auto px-3 py-2 space-y-2 min-h-full bg-background">
      {/* Status Badge - Only show when Protected (not paused or trip mode) */}
      {!isPaused && !isInTripMode && !isInSickMode && (
        <div className="flex justify-center">
          <Badge className="bg-primary text-primary-foreground px-4 py-1 text-xs uppercase font-bold tracking-wide rounded-full">
            <Shield className="w-4 h-4 mr-2 inline" />
            Protected
          </Badge>
        </div>
      )}

      {/* Main Timer Card */}
      <Card
        onClick={() => !isInTripMode && !isPaused && !isInSickMode && setShowEditTimerSheet(true)}
        className={`p-4 text-center space-y-1.5 border-2 transition-all duration-300 ${
          urgencyLevel === "critical"
            ? "border-destructive bg-destructive/5 animate-pulse"
            : urgencyLevel === "warning"
            ? "border-yellow-500 bg-yellow-500/5"
            : "border-border"
        } ${!isInTripMode && !isPaused && !isInSickMode ? "cursor-pointer hover:border-primary/60 active:scale-[0.99]" : ""}`}
      >
        <div className="space-y-1">
          {isInTripMode ? (
            <>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">STATUS</p>
              <div className="text-3xl font-black tracking-tight text-primary">PAUSED</div>
              <p className="text-xs text-muted-foreground">Trip Mode active</p>
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">RESUMES IN</p>
                <div className="text-2xl font-bold tracking-tight text-foreground pt-1">{tripModeCountdown}</div>
                <p className="text-xs text-muted-foreground">
                  {motionTimer.tripModeEndDate?.toLocaleDateString()} at {motionTimer.tripModeEndDate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </>
          ) : isPaused ? (
            <>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">STATUS</p>
              <div className="text-3xl font-black tracking-tight text-primary">PAUSED</div>
              <p className="text-xs text-muted-foreground">Monitoring temporarily paused</p>
            </>
          ) : isInSickMode ? (
            <>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">STATUS</p>
              <div className="text-3xl font-black tracking-tight text-primary">PAUSED</div>
              <p className="text-xs text-muted-foreground">Sick Mode active</p>
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">RESUMES IN</p>
                <div className="text-2xl font-bold tracking-tight text-foreground pt-1">{sickModeCountdown}</div>
                <p className="text-xs text-muted-foreground">
                  {motionTimer.sickModeEndDate?.toLocaleDateString()} at {motionTimer.sickModeEndDate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">MOTION TIMER</p>
                <Edit className="w-3 h-3 text-muted-foreground/50" />
              </div>
              <div className={`text-5xl font-black tracking-tight transition-colors duration-300 ${
                urgencyLevel === "critical"
                  ? "text-destructive"
                  : urgencyLevel === "warning"
                  ? "text-yellow-500"
                  : "text-primary"
              }`}>
                {timeRemaining}
              </div>
              <p className="text-xs text-muted-foreground">
                Next check-in by {motionTimer.nextCheckIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {motionTimer.nextCheckIn.toDateString() !== new Date().toDateString() ? 'tomorrow' : 'today'}
              </p>
              {urgencyLevel === "critical" && (
                <p className="text-xs font-bold text-destructive uppercase tracking-wide">⚠️ Timer Expired</p>
              )}
              {urgencyLevel === "warning" && (
                <p className="text-xs font-medium text-yellow-500">Check-in recommended soon</p>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Lost-phone amber banner */}
      {plan.lostPhoneMode && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-sm font-medium text-amber-200 leading-tight">Battery monitoring paused — lost phone reported.</p>
          </div>
          <button
            onClick={reEnableBatteryRule}
            className="text-xs font-bold text-primary whitespace-nowrap hover:underline"
          >
            Re-enable
          </button>
        </div>
      )}

      {/* Active Instruction */}
      <Card className="p-3 space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-wider font-bold">ACTIVE INSTRUCTION</h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{plan.tier.toUpperCase().replace("-", " ")}</Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary hover:bg-primary/10"
              onClick={() => setShowEditInstructionsSheet(true)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-1">
          {/* Response Queue — always shown as first row */}
          <button
            className="flex items-center gap-2 w-full text-left hover:bg-accent/50 -mx-1 px-1 py-1 rounded-lg transition-colors"
            onClick={() => setShowQueueSheet(true)}
          >
            <ListOrdered className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm">Response Queue</p>
              <p className="text-xs text-muted-foreground">
                {responseQueue.committed.length} steps — tap to view or edit
              </p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          </button>

          {plan.activeServices.includes("attend-check") && (
            <button
              className="flex items-center gap-2 w-full text-left hover:bg-accent/50 -mx-1 px-1 py-1 rounded-lg transition-colors"
              onClick={() => setQuickSheet("attend-check")}
            >
              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-sm">Attend & Check</p>
                <p className="text-xs text-muted-foreground">If motion timer expires a SMS will be sent to your primary contact</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            </button>
          )}
          {plan.activeServices.includes("pet-guardian") && primaryPet && (
            <button
              className="flex items-center gap-2 w-full text-left hover:bg-accent/50 -mx-1 px-1 py-1 rounded-lg transition-colors"
              onClick={() => setQuickSheet("pet-guardian")}
            >
              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-sm">Pet Guardian</p>
                <p className="text-xs text-muted-foreground">
                  {pets.length > 1
                    ? "Change your guardian for your pets"
                    : (() => {
                        const guardian = people.find(p => p.id === primaryPet.guardianId);
                        return guardian
                          ? `${primaryPet.name} will be cared for and handed to ${guardian.name}`
                          : `${primaryPet.name} will be cared for by their guardian`;
                      })()
                  }
                </p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            </button>
          )}
          {plan.activeServices.includes("reputation-guard") && (
            <button
              className="flex items-center gap-2 w-full text-left hover:bg-accent/50 -mx-1 px-1 py-1 rounded-lg transition-colors"
              onClick={() => setQuickSheet("reputation-guard")}
            >
              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-sm">Reputation Guard</p>
                <p className="text-xs text-muted-foreground">Pants On Service active — 3 items secured</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            </button>
          )}
          {plan.activeServices.includes("friend-alert") && (
            <button
              className="flex items-center gap-2 w-full text-left hover:bg-accent/50 -mx-1 px-1 py-1 rounded-lg transition-colors"
              onClick={() => setQuickSheet("friend-alert")}
            >
              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-sm">Primary Contact</p>
                <p className="text-sm text-muted-foreground">
                  <span className="text-xs text-muted-foreground">{primaryContact ? `${primaryContact.name} will be notified` : "Your nominated contact will be notified"}</span>
                </p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            </button>
          )}
          {plan.activeServices.includes("battery-rule") && plan.batteryRuleEnabled && (
            <button
              className="flex items-center gap-2 w-full text-left hover:bg-accent/50 -mx-1 px-1 py-1 rounded-lg transition-colors"
              onClick={() => setShowBatterySheet(true)}
            >
              <BatteryLow className={`w-4 h-4 flex-shrink-0 ${plan.lostPhoneMode ? "text-amber-500" : "text-primary"}`} />
              <div className="flex-1">
                <p className="font-medium text-sm">Battery Rule</p>
                <p className="text-xs text-muted-foreground">
                  {plan.lostPhoneMode
                    ? "Paused — lost phone reported"
                    : motionTimer.batteryBehaviour === "respond"
                    ? `If battery dies, we respond after timer + ${motionTimer.gracePeriodHours}h grace period`
                    : motionTimer.batteryBehaviour === "suppress"
                    ? "If battery dies, timer is paused — no response triggered"
                    : "If battery dies, your primary contact is notified"}
                </p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            </button>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-2">
        {/* Main Action Button - Check In or Activate */}
        {isPaused || isInTripMode || isInSickMode ? (
          <div className="space-y-2">
            <Button
              className="w-full rounded-full py-4 uppercase font-bold tracking-wide text-sm"
              size="lg"
              onClick={() => {
                if (isPaused) {
                  resumeMonitoring();
                  setIsPaused(false);
                  toast.success("Wolf Watch activated", {
                    description: "Your protection is now active"
                  });
                } else if (isInTripMode) {
                  resumeMonitoring();
                  setIsInTripMode(false);
                  toast.success("Wolf Watch activated", {
                    description: "Trip mode ended. Your protection is now active"
                  });
                } else if (isInSickMode) {
                  resumeMonitoring();
                  setIsInSickMode(false);
                  toast.success("Wolf Watch activated", {
                    description: "Sick mode ended. Your protection is now active"
                  });
                }
              }}
            >
              <Play className="w-5 h-5 mr-2" />
              Activate Wolf Watch
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Your monitoring is {isPaused ? "paused by you" : isInTripMode ? "in trip mode" : "in sick mode"}. Activate again to resume protection.
            </p>
          </div>
        ) : (
          <Button
            className="w-full rounded-full py-6 uppercase font-bold tracking-wide text-base"
            size="lg"
            onClick={handleCheckIn}
          >
            <Timer className="w-5 h-5 mr-2" />
            Check In Now
          </Button>
        )}
        
        {/* DEV: Test Emergency Button */}
        <Button
          variant="destructive"
          className="w-full rounded-full py-4 uppercase font-medium tracking-wide"
          size="sm"
          onClick={() => setShowEmergencyModal(true)}
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Test Emergency (Demo)
        </Button>
        
        {/* Pause, Trip Mode, and Sick Mode Buttons - All three on same row */}
        {!isPaused && !isInTripMode && !isInSickMode && (
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="rounded-full py-4 uppercase font-medium tracking-wide text-xs"
              size="sm"
              onClick={() => {
                pauseMonitoring();
                setIsPaused(true);
                toast.info("Monitoring paused", { 
                  description: "Your protection is temporarily paused" 
                });
              }}
            >
              Pause
            </Button>
            
            <Button
              variant="outline"
              className="rounded-full py-4 uppercase font-medium tracking-wide text-xs"
              size="sm"
              onClick={() => setShowTripModeModal(true)}
            >
              <Plane className="w-3 h-3 mr-1" />
              Trip
            </Button>
            
            <Button
              variant="outline"
              className="rounded-full py-4 uppercase font-medium tracking-wide text-xs"
              size="sm"
              onClick={() => setShowSickModeModal(true)}
            >
              <Clock className="w-3 h-3 mr-1" />
              Sick
            </Button>
          </div>
        )}
      </div>

      {/* Last Check */}
      <p className="text-center text-xs text-muted-foreground">
        Last checked in: {motionTimer.lastCheckIn.toLocaleDateString()} at {motionTimer.lastCheckIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>

      {/* Emergency Modal */}
      <EmergencyModal
        open={showEmergencyModal}
        onOpenChange={setShowEmergencyModal}
      />

      {/* Trip Mode Modal */}
      <TripModeModal
        open={showTripModeModal}
        onOpenChange={setShowTripModeModal}
        onConfirm={(endDate) => {
          setTripMode(endDate);
          setIsInTripMode(true);
        }}
      />

      {/* Sick Mode Modal */}
      <SickModeModal
        open={showSickModeModal}
        onOpenChange={setShowSickModeModal}
        onConfirm={(endDate, checkInHours) => {
          setSickMode(endDate, checkInHours);
          setIsInSickMode(true);
        }}
      />

      {/* Nominated Contacts Sheet */}
      <NominatedContactsSheet
        open={showContactsSheet}
        onOpenChange={setShowContactsSheet}
        onAddNew={() => {
          // Navigate to People tab and trigger add
          window.dispatchEvent(new CustomEvent('navigate-people-add'));
        }}
        onViewPerson={(personId) => {
          setSelectedPersonId(personId);
          setShowPersonDetail(true);
        }}
      />

      {/* Person Detail Sheet */}
      <PersonDetailSheet
        open={showPersonDetail}
        onOpenChange={setShowPersonDetail}
        personId={selectedPersonId}
        onEdit={(personId) => {
          // Navigate to People tab and trigger edit
          window.dispatchEvent(new CustomEvent('navigate-people-edit', { detail: { personId } }));
        }}
      />

      {/* Primary Contact Sheet */}
      <PrimaryContactSheet
        open={showPrimaryContactSheet}
        onOpenChange={setShowPrimaryContactSheet}
      />

      {/* Edit Instructions Sheet */}
      <EditInstructionsSheet
        open={showEditInstructionsSheet}
        onOpenChange={setShowEditInstructionsSheet}
      />

      {/* Edit Timer Sheet */}
      <EditTimerSheet
        open={showEditTimerSheet}
        onClose={() => setShowEditTimerSheet(false)}
      />

      {/* Battery Behaviour Sheet */}
      <BatteryBehaviourSheet
        open={showBatterySheet}
        onOpenChange={setShowBatterySheet}
      />

      {/* Response Queue Sheet */}
      <ResponseQueueSheet
        open={showQueueSheet}
        onOpenChange={setShowQueueSheet}
      />

      {/* Quick-action: Attend & Check toggle */}
      <Sheet open={quickSheet === "attend-check"} onOpenChange={(v) => !v && setQuickSheet(null)}>
        <SheetContent side="bottom" className="inset-x-2 bottom-2 rounded-2xl pb-safe" aria-describedby={undefined}>
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2 uppercase tracking-wide font-black">
              <Shield className="w-5 h-5 text-primary" />
              Attend & Check
            </SheetTitle>
          </SheetHeader>
          <p className="text-sm text-muted-foreground mb-6">
            When your motion timer expires, a responder will attend your property and perform a welfare check.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-full"
              onClick={() => {
                updateActiveServices(plan.activeServices.filter(s => s !== "attend-check"));
                toast.success("Attend & Check disabled");
                setQuickSheet(null);
              }}
            >
              Disable
            </Button>
            <Button className="flex-1 rounded-full font-bold" onClick={() => setQuickSheet(null)}>
              Keep Active
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Quick-action: Reputation Guard toggle */}
      <Sheet open={quickSheet === "reputation-guard"} onOpenChange={(v) => !v && setQuickSheet(null)}>
        <SheetContent side="bottom" className="inset-x-2 bottom-2 rounded-2xl pb-safe" aria-describedby={undefined}>
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2 uppercase tracking-wide font-black">
              <Lock className="w-5 h-5 text-primary" />
              Reputation Guard
            </SheetTitle>
          </SheetHeader>
          <p className="text-sm text-muted-foreground mb-6">
            Pants On Service is active with 3 items secured. Your digital reputation will be managed if you're incapacitated.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-full"
              onClick={() => {
                updateActiveServices(plan.activeServices.filter(s => s !== "reputation-guard"));
                toast.success("Reputation Guard disabled");
                setQuickSheet(null);
              }}
            >
              Disable
            </Button>
            <Button className="flex-1 rounded-full font-bold" onClick={() => setQuickSheet(null)}>
              Keep Active
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Quick-action: Pet Guardian picker — per pet */}
      <PetGuardianSheet
        open={quickSheet === "pet-guardian"}
        onClose={() => setQuickSheet(null)}
        pets={pets}
        people={people}
        updatePet={updatePet}
      />

      {/* Quick-action: Friend Alert — nominated contact picker */}
      <Sheet open={quickSheet === "friend-alert"} onOpenChange={(v) => !v && setQuickSheet(null)}>
        <SheetContent side="bottom" className="inset-x-2 bottom-2 rounded-2xl pb-safe" aria-describedby={undefined}>
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2 uppercase tracking-wide font-black">
              <User className="w-5 h-5 text-primary" />
              Primary Contact
            </SheetTitle>
          </SheetHeader>
          <p className="text-sm text-muted-foreground mb-4">
            Choose who gets notified when your motion timer expires.
          </p>
          <div className="space-y-2 mb-4">
            {people
              .filter(p => p.roles.includes("Nominated Contact") || p.roles.includes("Friend"))
              .map(person => {
                const isSelected = primaryContactId === person.id;
                return (
                  <button
                    key={person.id}
                    onClick={() => {
                      toast.success(`Friend Alert contact set to ${person.name}`);
                      setQuickSheet(null);
                    }}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold text-sm ${isSelected ? "text-primary" : ""}`}>{person.name}</p>
                      <p className="text-xs text-muted-foreground">{person.roles.join(", ")}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                  </button>
                );
              })}
            {people.filter(p => p.roles.includes("Nominated Contact") || p.roles.includes("Friend")).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                No contacts set up. Add people in the People tab.
              </p>
            )}
          </div>
          <Button variant="outline" className="w-full rounded-full" onClick={() => {
            setQuickSheet(null);
            setShowContactsSheet(true);
          }}>
            Manage All Contacts
          </Button>
        </SheetContent>
      </Sheet>
    </div>
  );
}