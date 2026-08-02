import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useApp } from "../../contexts/AppContext";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Dog,
  Shield,
  Bell,
  ChevronRight,
  User,
  Mail,
  Phone,
  Clock,
  Activity,
  MessageSquare,
  AlertCircle,
  Edit2,
  Key,
  DoorOpen,
  PawPrint,
  MapPin,
  Eye,
  EyeOff,
  UserPlus,
  Trash2,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Step =
  | "entry"
  | "pet-question"
  | "core-details"
  | "sms-verify"
  | "terms"
  | "response-selection"
  // C2: notify-only path
  | "contact-details"
  | "contact-notify"
  | "monitoring-method"
  | "threshold"
  | "alert-summary"
  // C4: attend path
  | "attend-explainer"
  | "access-instructions"
  | "emergency-contacts"
  | "attend-summary";

type AuthorityLevel = "knock-only" | "enter-if-needed";
type EntryMethod = "key-safe" | "spare-key" | "unlocked" | "other" | "";

interface AccessInstructions {
  authorityLevel: AuthorityLevel;
  entryMethod: EntryMethod;
  keySafeCode: string;
  keySafeLocation: string;
  entryNotes: string;
  petsAtDoor: boolean;
  petNotes: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  mobile: string;
  relationship: string;
}

type MonitoringMethod = "motion-inactivity" | "check-in-prompts" | null;
type NotifyPreference = "inform-now" | "only-on-alert" | null;
type Relationship = "partner" | "parent" | "sibling" | "friend" | "neighbour" | "other" | "";

interface ContactState {
  name: string;
  mobile: string;
  email: string;
  relationship: Relationship;
}

interface SignUpState {
  hasPet: boolean | null;
  firstName: string;
  lastName: string;
  mobile: string;
  verificationCode: string;
  termsAccepted: boolean;
  responseChoice: "notify-only" | "attend" | null;
  // C2
  contact: ContactState;
  notifyPreference: NotifyPreference;
  monitoringMethod: MonitoringMethod;
  thresholdHours: number;
  // C4
  access: AccessInstructions;
  emergencyContacts: EmergencyContact[];
}

// ── Progress bar ──────────────────────────────────────────────────────────────

const STEPS: Step[] = [
  "entry", "pet-question", "core-details", "sms-verify", "terms", "response-selection",
  "contact-details", "contact-notify", "monitoring-method", "threshold", "alert-summary",
  "attend-explainer", "access-instructions", "emergency-contacts", "attend-summary",
];

function ProgressBar({ current }: { current: Step }) {
  const idx = STEPS.indexOf(current);
  const total = STEPS.length - 1; // entry doesn't count as a step
  const progress = idx === 0 ? 0 : (idx / total) * 100;
  return (
    <div className="w-full h-0.5 bg-border rounded-full overflow-hidden">
      <div
        className="h-full bg-primary rounded-full transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// ── Shared layout ─────────────────────────────────────────────────────────────

function Screen({
  onBack,
  children,
  hideBack,
}: {
  onBack?: () => void;
  children: React.ReactNode;
  hideBack?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center px-4 pt-6 pb-4 gap-4">
        {!hideBack && onBack ? (
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-9" />
        )}
        <div className="flex-1">
          <span className="text-sm font-black uppercase tracking-widest text-primary">Legacy Wolf</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-5 pb-10 max-w-md mx-auto w-full">
        {children}
      </div>
    </div>
  );
}

// ── Step 1: Entry ─────────────────────────────────────────────────────────────

function StepEntry({ onSignUp, onLogin }: { onSignUp: () => void; onLogin: () => void }) {
  return (
    <Screen hideBack>
      <div className="flex-1 flex flex-col justify-between pt-12 pb-4">
        <div className="space-y-8">
          {/* Wordmark */}
          <div className="space-y-1">
            <h1 className="text-5xl font-black uppercase tracking-tight leading-none">
              Legacy<br />Wolf
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed pt-3">
              Protection for people who live alone. We act when you can't.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {[
              "Motion Timer — we check in on you daily",
              "Attend & Check — a responder at your door",
              "Pet Guardian — your pet is cared for too",
            ].map((feat) => (
              <div key={feat} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground leading-snug">{feat}</p>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            4-week free trial. No charge today.
          </p>
        </div>

        {/* CTAs */}
        <div className="space-y-3 pt-8">
          <Button
            onClick={onSignUp}
            className="w-full h-14 rounded-full uppercase font-black tracking-widest text-sm"
          >
            Sign up
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <button
            onClick={onLogin}
            className="w-full h-12 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            Already a member? Sign in
          </button>
        </div>
      </div>
    </Screen>
  );
}

// ── Step 2: Pet question ───────────────────────────────────────────────────────

function StepPetQuestion({
  value,
  onSelect,
  onBack,
}: {
  value: boolean | null;
  onSelect: (v: boolean) => void;
  onBack: () => void;
}) {
  return (
    <Screen onBack={onBack}>
      <div className="pt-8 space-y-8">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Step 1 of 5</p>
          <h2 className="text-3xl font-black uppercase tracking-tight leading-tight">
            Do you have a pet living with you?
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            If you have a pet, we can arrange for them to be cared for and handed to their guardian if we need to attend.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Yes", value: true, icon: Dog, note: "We'll set up pet care" },
            { label: "No", value: false, icon: Shield, note: "You can add pets later" },
          ].map((opt) => {
            const Icon = opt.icon;
            const selected = value === opt.value;
            return (
              <button
                key={String(opt.value)}
                onClick={() => onSelect(opt.value)}
                className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                  selected
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${selected ? "bg-primary" : "bg-accent"}`}>
                  <Icon className="text-white w-7 h-7" style={{ strokeWidth: 2 }} />
                </div>
                <div className="text-center">
                  <p className="font-black text-lg uppercase tracking-wide">{opt.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.note}</p>
                </div>
                {selected && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </Screen>
  );
}

// ── Step 3: Core details ───────────────────────────────────────────────────────

function StepCoreDetails({
  state,
  onChange,
  onNext,
  onBack,
}: {
  state: Pick<SignUpState, "firstName" | "lastName" | "mobile">;
  onChange: (k: keyof SignUpState, v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const valid = state.firstName.trim() && state.lastName.trim() && state.mobile.trim().length >= 10;

  return (
    <Screen onBack={onBack}>
      <div className="pt-8 space-y-8">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Step 2 of 5</p>
          <h2 className="text-3xl font-black uppercase tracking-tight leading-tight">Your details</h2>
          <p className="text-muted-foreground text-sm">We'll use your mobile to verify your identity and send check-in prompts.</p>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="uppercase text-xs font-bold tracking-wide">First name</Label>
              <Input
                value={state.firstName}
                onChange={(e) => onChange("firstName", e.target.value)}
                placeholder="Alex"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="uppercase text-xs font-bold tracking-wide">Last name</Label>
              <Input
                value={state.lastName}
                onChange={(e) => onChange("lastName", e.target.value)}
                placeholder="Morgan"
                className="h-12 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="uppercase text-xs font-bold tracking-wide">Mobile number</Label>
            <Input
              type="tel"
              value={state.mobile}
              onChange={(e) => onChange("mobile", e.target.value)}
              placeholder="04XX XXX XXX"
              className="h-12 rounded-xl"
            />
            <p className="text-xs text-muted-foreground">Australian mobile numbers only. We'll send a verification code.</p>
          </div>
        </div>

        <Button
          onClick={onNext}
          disabled={!valid}
          className="w-full h-14 rounded-full uppercase font-black tracking-widest text-sm disabled:opacity-40"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </Screen>
  );
}

// ── Step 4: SMS verification ───────────────────────────────────────────────────

function StepSmsVerify({
  mobile,
  code,
  onChange,
  onNext,
  onBack,
  onResend,
}: {
  mobile: string;
  code: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
  onResend: () => void;
}) {
  const valid = code.length === 6 && /^\d+$/.test(code);

  return (
    <Screen onBack={onBack}>
      <div className="pt-8 space-y-8">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Step 3 of 5</p>
          <h2 className="text-3xl font-black uppercase tracking-tight leading-tight">Verify your number</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We sent a 6-digit code to <strong className="text-foreground">{mobile || "your mobile"}</strong>. Enter it below.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="uppercase text-xs font-bold tracking-wide">Verification code</Label>
            <Input
              type="tel"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="h-16 rounded-xl text-center text-3xl font-black tracking-[0.5em]"
            />
          </div>

          {/* Demo hint */}
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Demo:</strong> enter any 6 digits to continue
            </p>
          </div>

          <button
            onClick={onResend}
            className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Didn't receive it? Resend code
          </button>
        </div>

        <Button
          onClick={onNext}
          disabled={!valid}
          className="w-full h-14 rounded-full uppercase font-black tracking-widest text-sm disabled:opacity-40"
        >
          Verify number
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </Screen>
  );
}

// ── Step 5: Terms & Privacy ────────────────────────────────────────────────────

const TERMS_SECTIONS = [
  {
    title: "What Legacy Wolf does",
    body: "We monitor your motion timer and, if you become unresponsive, execute the response plan you configure. We do not provide emergency services.",
  },
  {
    title: "Your data",
    body: "Your personal details, address, and access information are encrypted at rest. Access details are only decrypted when a verified incident triggers your plan. Every access is logged.",
  },
  {
    title: "Response limitations",
    body: "Legacy Wolf responders are not emergency services. If life is at risk, call 000. Our responders will contact emergency services on your behalf when pre-authorised to do so.",
  },
  {
    title: "Billing",
    body: "Your 4-week free trial begins today. Your nominated payment method is charged automatically at conversion. You may cancel at any time before the trial ends.",
  },
  {
    title: "Privacy",
    body: "We do not sell your data. We share only what is necessary for response delivery. Full Privacy Policy at legacywolf.com.au/privacy.",
  },
];

function StepTerms({
  accepted,
  onToggle,
  onNext,
  onBack,
}: {
  accepted: boolean;
  onToggle: () => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    if (atBottom) setHasScrolledToEnd(true);
  };

  const canAccept = hasScrolledToEnd;

  return (
    <Screen onBack={onBack}>
      <div className="pt-8 space-y-5">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Step 4 of 5</p>
          <h2 className="text-3xl font-black uppercase tracking-tight leading-tight">Terms & Privacy</h2>
          <p className="text-muted-foreground text-sm">Scroll to the end, then accept before continuing.</p>
        </div>

        {/* Scroll container with fade-out hint at bottom */}
        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="space-y-3 max-h-[42vh] overflow-y-auto pr-1"
          >
            {TERMS_SECTIONS.map((s) => (
              <div key={s.title} className="bg-card border border-border rounded-xl p-4 space-y-1">
                <p className="text-xs uppercase tracking-wide font-bold text-muted-foreground">{s.title}</p>
                <p className="text-sm text-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
            {/* Sentinel spacer so there's clearly more to scroll */}
            <div className="h-4" />
          </div>

          {/* Fade gradient — hides when scrolled to end */}
          {!hasScrolledToEnd && (
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent rounded-b-xl" />
          )}
        </div>

        {/* Scroll nudge */}
        {!hasScrolledToEnd && (
          <p className="text-center text-xs text-muted-foreground animate-pulse">
            Scroll down to read all terms
          </p>
        )}

        {/* Accept toggle — locked until scrolled */}
        <button
          onClick={canAccept ? onToggle : undefined}
          disabled={!canAccept}
          className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
            !canAccept
              ? "border-border bg-card opacity-40 cursor-not-allowed"
              : accepted
              ? "border-primary bg-primary/10"
              : "border-border bg-card hover:border-primary/40"
          }`}
        >
          <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
            accepted ? "border-primary bg-primary" : "border-border"
          }`}>
            {accepted && <Check className="w-3.5 h-3.5 text-black" />}
          </div>
          <p className="text-sm font-semibold leading-snug">
            I have read and accept the Terms of Service and Privacy Policy
          </p>
        </button>

        <Button
          onClick={onNext}
          disabled={!accepted}
          className="w-full h-14 rounded-full uppercase font-black tracking-widest text-sm disabled:opacity-40"
        >
          Accept and continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </Screen>
  );
}

// ── Step 6: Response selection ─────────────────────────────────────────────────

function StepResponseSelection({
  value,
  onSelect,
  onNext,
  onBack,
}: {
  value: "notify-only" | "attend" | null;
  onSelect: (v: "notify-only" | "attend") => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [billing, setBilling] = useState<"annual" | "monthly">("annual");
  const isAnnual = billing === "annual";

  const plans = [
    {
      id: "notify-only" as const,
      title: "Notify your nominated contact",
      icon: Bell,
      description: "When your Motion Timer expires, we send an alert to your nominated contact. No physical response.",
      features: ["SMS alert to your contact", "No physical attendance"],
      monthlyPrice: 7,
      annualMonthlyPrice: 5,
      annualTotal: 60,
      annualSaving: 24,
      visitFee: null,
    },
    {
      id: "attend" as const,
      title: "Legacy Wolf to attend and check on you",
      icon: Shield,
      description: "An accredited Legacy Wolf responder physically attends your address and performs a welfare check.",
      features: ["Physical welfare check at your address", "Emergency services coordination", "Pet care if needed"],
      monthlyPrice: 10,
      annualMonthlyPrice: 7,
      annualTotal: 84,
      annualSaving: 36,
      visitFee: 750,
      recommended: true,
    },
  ];

  return (
    <Screen onBack={onBack}>
      <div className="pt-8 space-y-5 pb-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Step 5 of 5</p>
          <h2 className="text-2xl font-black uppercase tracking-tight leading-tight">
            Choose the response you want if we are alerted
          </h2>
          <p className="text-muted-foreground text-sm">
            Both options are available during your 4-week free trial. You can change this at any time.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center gap-1 bg-card border border-border rounded-full p-1">
          <button
            onClick={() => setBilling("annual")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-bold uppercase tracking-wide transition-all ${
              isAnnual ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Annual
            {isAnnual && (
              <span className="text-[10px] font-black bg-black/20 rounded-full px-2 py-0.5 whitespace-nowrap">Save 30%</span>
            )}
          </button>
          <button
            onClick={() => setBilling("monthly")}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold uppercase tracking-wide transition-all ${
              !isAnnual ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
        </div>

        {/* Plan cards */}
        <div className="space-y-3">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const selected = value === plan.id;
            const displayPrice = isAnnual ? plan.annualMonthlyPrice : plan.monthlyPrice;
            const saving = Math.round(((plan.monthlyPrice - plan.annualMonthlyPrice) / plan.monthlyPrice) * 100);

            return (
              <button
                key={plan.id}
                onClick={() => onSelect(plan.id)}
                className={`w-full text-left border-2 rounded-2xl p-5 transition-all ${
                  selected ? "border-primary bg-primary/8" : "border-border bg-card hover:border-primary/40"
                }`}
              >
                {/* Header row */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${selected ? "bg-primary" : "bg-accent"}`}>
                    <Icon className="text-white w-5 h-5" style={{ strokeWidth: 2 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-black text-sm uppercase tracking-wide leading-tight">{plan.title}</p>
                        {"recommended" in plan && plan.recommended && (
                          <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wide bg-primary/15 text-white px-2 py-0.5 rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                      {/* Pricing */}
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-baseline gap-0.5 justify-end">
                          <span className="text-2xl font-black text-foreground">${displayPrice}</span>
                          <span className="text-xs text-muted-foreground">/mo</span>
                        </div>
                        {isAnnual ? (
                          <p className="text-[10px] text-primary font-bold">{saving}% off · ${plan.annualTotal}/yr</p>
                        ) : (
                          <p className="text-[10px] text-muted-foreground">billed monthly</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{plan.description}</p>

                {/* Visit fee callout */}
                {plan.visitFee && (
                  <div className="bg-primary/80 rounded-xl px-3 py-2 mb-3 flex items-center justify-between">
                    <p className="text-xs text-white font-medium">Pre-approved per-visit fee</p>
                    <p className="text-sm font-black text-white">${plan.visitFee}</p>
                  </div>
                )}

                {/* Features */}
                <div className="space-y-1.5">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <Check className={`w-3 h-3 flex-shrink-0 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                      <p className="text-xs text-muted-foreground">{f}</p>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Check className={`w-3 h-3 flex-shrink-0 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="text-xs text-muted-foreground">4-week free trial included</p>
                  </div>
                </div>

                {selected && (
                  <div className="mt-3 flex justify-end">
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <Button
          onClick={onNext}
          disabled={!value}
          className="w-full h-14 rounded-full uppercase font-black tracking-widest text-sm disabled:opacity-40"
        >
          Activate my trial
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </Screen>
  );
}

// ── C2 Step 1: Contact details ─────────────────────────────────────────────────

const RELATIONSHIPS: { value: Relationship; label: string }[] = [
  { value: "partner", label: "Partner" },
  { value: "parent", label: "Parent" },
  { value: "sibling", label: "Sibling" },
  { value: "friend", label: "Friend" },
  { value: "neighbour", label: "Neighbour" },
  { value: "other", label: "Other" },
];

function StepContactDetails({
  contact,
  onChange,
  onNext,
  onBack,
}: {
  contact: ContactState;
  onChange: (k: keyof ContactState, v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const valid = contact.name.trim().length > 1 && contact.mobile.trim().length >= 10 && contact.relationship !== "";

  return (
    <Screen onBack={onBack}>
      <div className="pt-8 space-y-6 pb-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Nominated Contact</p>
          <h2 className="text-2xl font-black uppercase tracking-tight leading-tight">
            Who should we alert?
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            This person will receive an alert if you become unresponsive. They don't need the app.
          </p>
        </div>

        <div className="space-y-4">
          {/* Full name */}
          <div className="space-y-2">
            <Label className="uppercase text-xs font-bold tracking-wide flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-primary" /> Full name
            </Label>
            <Input
              value={contact.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="Sarah Chen"
              className="h-13 rounded-xl"
            />
          </div>

          {/* Mobile */}
          <div className="space-y-2">
            <Label className="uppercase text-xs font-bold tracking-wide flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-primary" /> Mobile number
            </Label>
            <Input
              type="tel"
              value={contact.mobile}
              onChange={(e) => onChange("mobile", e.target.value)}
              placeholder="04XX XXX XXX"
              className="h-13 rounded-xl"
            />
          </div>

          {/* Email — optional */}
          <div className="space-y-2">
            <Label className="uppercase text-xs font-bold tracking-wide flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-primary" /> Email
              <span className="normal-case font-normal text-muted-foreground tracking-normal">— optional</span>
            </Label>
            <Input
              type="email"
              value={contact.email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="sarah@example.com"
              className="h-13 rounded-xl"
            />
          </div>

          {/* Relationship */}
          <div className="space-y-2">
            <Label className="uppercase text-xs font-bold tracking-wide">Relationship</Label>
            <div className="grid grid-cols-3 gap-2">
              {RELATIONSHIPS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => onChange("relationship", r.value)}
                  className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                    contact.relationship === r.value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={onNext}
          disabled={!valid}
          className="w-full h-14 rounded-full uppercase font-black tracking-widest text-sm disabled:opacity-40"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </Screen>
  );
}

// ── C2 Step 2: Notify preference ───────────────────────────────────────────────

function StepContactNotify({
  value,
  onSelect,
  onNext,
  onBack,
}: {
  value: NotifyPreference;
  onSelect: (v: NotifyPreference) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const options: { id: NonNullable<NotifyPreference>; title: string; subtitle: string; description: string; icon: React.ElementType }[] = [
    {
      id: "inform-now",
      title: "Inform them now",
      subtitle: "Recommended",
      description: "We send your contact a welcome message explaining their role. They'll know what to expect before an alert ever fires.",
      icon: MessageSquare,
    },
    {
      id: "only-on-alert",
      title: "Only contact on alert",
      subtitle: "Private",
      description: "Your contact won't know they're nominated. They'll only hear from us if your timer actually triggers.",
      icon: Bell,
    },
  ];

  return (
    <Screen onBack={onBack}>
      <div className="pt-8 space-y-6 pb-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Nominated Contact</p>
          <h2 className="text-2xl font-black uppercase tracking-tight leading-tight">
            Should we let them know?
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We can send your contact a message now so they're not caught off guard in an emergency.
          </p>
        </div>

        <div className="space-y-3">
          {options.map((opt) => {
            const Icon = opt.icon;
            const selected = value === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onSelect(opt.id)}
                className={`w-full text-left border-2 rounded-2xl p-5 transition-all ${
                  selected ? "border-primary bg-primary/8" : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${selected ? "bg-primary" : "bg-accent"}`}>
                    <Icon className="w-5 h-5 text-white" style={{ strokeWidth: 2 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-black text-sm uppercase tracking-wide">{opt.title}</p>
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                        opt.id === "inform-now" ? "bg-primary/15 text-white" : "bg-accent text-white"
                      }`}>{opt.subtitle}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{opt.description}</p>
                  </div>
                  {selected && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <Button
          onClick={onNext}
          disabled={!value}
          className="w-full h-14 rounded-full uppercase font-black tracking-widest text-sm disabled:opacity-40"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </Screen>
  );
}

// ── C2 Step 3: Monitoring method ───────────────────────────────────────────────

function StepMonitoringMethod({
  value,
  onSelect,
  onNext,
  onBack,
}: {
  value: MonitoringMethod;
  onSelect: (v: MonitoringMethod) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const options: { id: NonNullable<MonitoringMethod>; title: string; description: string; detail: string; icon: React.ElementType }[] = [
    {
      id: "motion-inactivity",
      title: "Motion inactivity",
      description: "Your phone's sensors detect whether you're moving. If no movement is detected within your threshold window, we alert your contact.",
      detail: "Set and forget. No interaction needed — just live normally.",
      icon: Activity,
    },
    {
      id: "check-in-prompts",
      title: "Check-in prompts",
      description: "We send you a push notification at your chosen interval. Tap once to confirm you're okay. Missing it triggers the alert.",
      detail: "More deliberate. You'll be aware of each check-in.",
      icon: MessageSquare,
    },
  ];

  return (
    <Screen onBack={onBack}>
      <div className="pt-8 space-y-6 pb-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Monitoring</p>
          <h2 className="text-2xl font-black uppercase tracking-tight leading-tight">
            How should we monitor you?
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Choose how Legacy Wolf tracks that you're active. You can change this at any time.
          </p>
        </div>

        <div className="space-y-3">
          {options.map((opt) => {
            const Icon = opt.icon;
            const selected = value === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onSelect(opt.id)}
                className={`w-full text-left border-2 rounded-2xl p-5 transition-all ${
                  selected ? "border-primary bg-primary/8" : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${selected ? "bg-primary" : "bg-accent"}`}>
                    <Icon className="w-5 h-5 text-white" style={{ strokeWidth: 2 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm uppercase tracking-wide mb-1">{opt.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">{opt.description}</p>
                    <div className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      selected ? "bg-primary text-black" : "bg-accent text-muted-foreground"
                    }`}>
                      <Check className="w-3 h-3" />
                      {opt.detail}
                    </div>
                  </div>
                  {selected && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <Button
          onClick={onNext}
          disabled={!value}
          className="w-full h-14 rounded-full uppercase font-black tracking-widest text-sm disabled:opacity-40"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </Screen>
  );
}

// ── C2 Step 4: Threshold ───────────────────────────────────────────────────────

const THRESHOLD_PRESETS = [8, 12, 16, 24, 48];

function StepThreshold({
  value,
  onChange,
  onNext,
  onBack,
  monitoringMethod,
}: {
  value: number;
  onChange: (h: number) => void;
  onNext: () => void;
  onBack: () => void;
  monitoringMethod: MonitoringMethod;
}) {
  return (
    <Screen onBack={onBack}>
      <div className="pt-8 space-y-6 pb-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Monitoring</p>
          <h2 className="text-2xl font-black uppercase tracking-tight leading-tight">
            {monitoringMethod === "check-in-prompts" ? "How often should we prompt you?" : "When should we alert?"}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {monitoringMethod === "check-in-prompts"
              ? "We'll send you a check-in prompt at this interval. Missing it sends an alert to your contact."
              : "If no motion is detected for this long, we alert your contact."}
          </p>
        </div>

        {/* Big time display */}
        <div className="flex flex-col items-center py-6 gap-1">
          <div className="flex items-end gap-2">
            <span className="text-7xl font-black tabular-nums leading-none">{value}</span>
            <span className="text-2xl font-bold text-muted-foreground pb-2">hours</span>
          </div>
          {value === 16 && (
            <span className="text-xs font-bold text-white uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full mt-1">
              Recommended
            </span>
          )}
          {value === 24 && (
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-accent px-3 py-1 rounded-full mt-1">
              Default
            </span>
          )}
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-3 justify-center">
          <button
            onClick={() => onChange(Math.max(4, value - 1))}
            className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center text-lg font-black hover:border-primary transition-colors"
          >
            −
          </button>
          <div className="flex-1 h-1 bg-border rounded-full relative">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${((value - 4) / (48 - 4)) * 100}%` }}
            />
          </div>
          <button
            onClick={() => onChange(Math.min(48, value + 1))}
            className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center text-lg font-black hover:border-primary transition-colors"
          >
            +
          </button>
        </div>

        {/* Preset chips */}
        <div className="flex gap-2 justify-center flex-wrap">
          {THRESHOLD_PRESETS.map((h) => (
            <button
              key={h}
              onClick={() => onChange(h)}
              className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${
                value === h ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {h}h
              {h === 16 && <span className="ml-1 text-primary">★</span>}
            </button>
          ))}
        </div>

        {/* Contextual note */}
        <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
          <Clock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            We recommend <strong className="text-foreground">16 hours</strong> — long enough to avoid false alarms from sleep or a long day out, short enough to matter in an emergency. The default of 24h is more lenient.
          </p>
        </div>

        <Button
          onClick={onNext}
          className="w-full h-14 rounded-full uppercase font-black tracking-widest text-sm"
        >
          Set threshold
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </Screen>
  );
}

// ── C2 Step 5: Alert summary ───────────────────────────────────────────────────

function StepAlertSummary({
  form,
  onEdit,
  onComplete,
  onBack,
}: {
  form: SignUpState;
  onEdit: (step: Step) => void;
  onComplete: () => void;
  onBack: () => void;
}) {
  const methodLabel = form.monitoringMethod === "motion-inactivity" ? "Motion inactivity" : "Check-in prompts";
  const notifyLabel = form.notifyPreference === "inform-now" ? "Inform them now" : "Only on alert";

  const rows: { label: string; value: string; step: Step }[] = [
    { label: "Contact", value: form.contact.name || "—", step: "contact-details" },
    { label: "Mobile", value: form.contact.mobile || "—", step: "contact-details" },
    { label: "Relationship", value: form.contact.relationship || "—", step: "contact-details" },
    { label: "Contact notified", value: notifyLabel, step: "contact-notify" },
    { label: "Monitoring", value: methodLabel, step: "monitoring-method" },
    { label: "Threshold", value: `${form.thresholdHours}h inactivity`, step: "threshold" },
  ];

  return (
    <Screen onBack={onBack}>
      <div className="pt-8 space-y-6 pb-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Almost done</p>
          <h2 className="text-2xl font-black uppercase tracking-tight leading-tight">
            Review your alert setup
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Here's what happens if you don't check in within your threshold.
          </p>
        </div>

        {/* What happens timeline */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">What happens on an alert</p>
          </div>
          <div className="p-4 space-y-4">
            {[
              { n: 1, text: `After ${form.thresholdHours}h of ${form.monitoringMethod === "motion-inactivity" ? "no motion detected" : "no check-in response"}, we trigger an alert.` },
              { n: 2, text: `${form.contact.name || "Your contact"} receives an SMS and call on their number${form.contact.mobile ? ` (${form.contact.mobile})` : ""}.` },
              { n: 3, text: form.notifyPreference === "inform-now" ? "They've already been briefed on their role and what to do." : "They'll receive instructions in the alert message." },
              { n: 4, text: "No physical responder is dispatched — this plan uses contact-only alerts." },
            ].map((item) => (
              <div key={item.n} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-black text-black">{item.n}</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary rows with edit links */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">{row.label}</p>
                <p className="text-sm font-semibold capitalize">{row.value}</p>
              </div>
              <button
                onClick={() => onEdit(row.step)}
                className="flex items-center gap-1 text-xs text-primary font-bold hover:opacity-70 transition-opacity"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            </div>
          ))}
        </div>

        <Button
          onClick={onComplete}
          className="w-full h-14 rounded-full uppercase font-black tracking-widest text-sm"
        >
          Activate my trial
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </Screen>
  );
}

// ── C4 Step 1: Attend explainer ────────────────────────────────────────────────

function StepAttendExplainer({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const points = [
    {
      icon: MapPin,
      title: "We come to you",
      body: "An accredited Legacy Wolf responder travels to your registered address to perform a welfare check in person.",
    },
    {
      icon: Eye,
      title: "Knock-only by default",
      body: "Unless you grant entry access, the responder knocks, calls out, and assesses from the door. No entry without your permission.",
    },
    {
      icon: DoorOpen,
      title: "Enter if needed",
      body: "You can authorise entry — via key safe or spare key — so the responder can reach you if you're incapacitated inside.",
    },
    {
      icon: Shield,
      title: "Emergency services coordination",
      body: "If the responder finds cause for concern, they contact 000 on your behalf and stay until help arrives.",
    },
    {
      icon: PawPrint,
      title: "Pet-aware",
      body: "Tell us about animals at the door so the responder is prepared. We note this on every dispatch.",
    },
  ];

  return (
    <Screen onBack={onBack}>
      <div className="pt-8 space-y-6 pb-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Attendance</p>
          <h2 className="text-2xl font-black uppercase tracking-tight leading-tight">
            What a Legacy Wolf visit looks like
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Before we set up your access instructions, here's exactly what happens when a responder attends your address.
          </p>
        </div>

        <div className="space-y-3">
          {points.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="flex items-start gap-4 bg-card border border-border rounded-2xl p-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4.5 h-4.5 text-white" style={{ strokeWidth: 2 }} />
                </div>
                <div>
                  <p className="font-black text-sm uppercase tracking-wide mb-0.5">{p.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        <Button
          onClick={onNext}
          className="w-full h-14 rounded-full uppercase font-black tracking-widest text-sm"
        >
          Set up my access instructions
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </Screen>
  );
}

// ── C4 Step 2: Access instructions ────────────────────────────────────────────

const ENTRY_METHODS: { value: EntryMethod; label: string; description: string }[] = [
  { value: "key-safe", label: "Key safe", description: "Padlock box at the property with a code" },
  { value: "spare-key", label: "Spare key with contact", description: "A trusted person holds a key" },
  { value: "unlocked", label: "Door left unlocked", description: "Property can be accessed without a key" },
  { value: "other", label: "Other arrangement", description: "Describe in the notes field below" },
];

function StepAccessInstructions({
  access,
  onChange,
  onNext,
  onBack,
}: {
  access: AccessInstructions;
  onChange: (k: keyof AccessInstructions, v: string | boolean) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [showCode, setShowCode] = useState(false);
  const valid = access.authorityLevel !== undefined &&
    (access.authorityLevel === "knock-only" || access.entryMethod !== "");

  return (
    <Screen onBack={onBack}>
      <div className="pt-8 space-y-6 pb-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Access Instructions</p>
          <h2 className="text-2xl font-black uppercase tracking-tight leading-tight">
            How can the responder reach you?
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            This is stored encrypted and only decrypted when a verified incident triggers your plan.
          </p>
        </div>

        {/* Authority level */}
        <div className="space-y-2">
          <Label className="uppercase text-xs font-bold tracking-wide">Responder authority</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "knock-only" as AuthorityLevel, label: "Knock only", sub: "No entry — assess from door" },
              { value: "enter-if-needed" as AuthorityLevel, label: "Enter if needed", sub: "Access granted inside" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => onChange("authorityLevel", opt.value)}
                className={`text-left p-4 rounded-2xl border-2 transition-all ${
                  access.authorityLevel === opt.value
                    ? "border-primary bg-primary/8"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <p className="font-black text-sm uppercase tracking-wide leading-tight">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">{opt.sub}</p>
                {access.authorityLevel === opt.value && (
                  <div className="mt-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Entry method — shown only when enter-if-needed */}
        {access.authorityLevel === "enter-if-needed" && (
          <div className="space-y-2">
            <Label className="uppercase text-xs font-bold tracking-wide">Entry method</Label>
            <div className="space-y-2">
              {ENTRY_METHODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => onChange("entryMethod", m.value)}
                  className={`w-full text-left flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                    access.entryMethod === m.value
                      ? "border-primary bg-primary/8"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                    access.entryMethod === m.value ? "border-primary bg-primary" : "border-border"
                  }`}>
                    {access.entryMethod === m.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{m.label}</p>
                    <p className="text-xs text-muted-foreground">{m.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Key safe fields */}
            {access.entryMethod === "key-safe" && (
              <div className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <Label className="uppercase text-xs font-bold tracking-wide flex items-center gap-2">
                    <Key className="w-3.5 h-3.5 text-primary" /> Key safe code
                  </Label>
                  <div className="relative">
                    <Input
                      type={showCode ? "text" : "password"}
                      value={access.keySafeCode}
                      onChange={(e) => onChange("keySafeCode", e.target.value)}
                      placeholder="e.g. 4821"
                      className="h-12 rounded-xl pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCode((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="uppercase text-xs font-bold tracking-wide flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> Key safe location
                  </Label>
                  <Input
                    value={access.keySafeLocation}
                    onChange={(e) => onChange("keySafeLocation", e.target.value)}
                    placeholder="e.g. Left of front door, waist height"
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* Entry notes */}
            <div className="space-y-1.5">
              <Label className="uppercase text-xs font-bold tracking-wide">
                Additional entry notes
                <span className="normal-case font-normal text-muted-foreground tracking-normal ml-1">— optional</span>
              </Label>
              <textarea
                value={access.entryNotes}
                onChange={(e) => onChange("entryNotes", e.target.value)}
                placeholder="e.g. Gate code is 1234, side entrance around the left"
                rows={3}
                className="w-full rounded-xl border border-border bg-card px-3 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {/* Pets at door */}
        <div className="space-y-2">
          <Label className="uppercase text-xs font-bold tracking-wide flex items-center gap-2">
            <PawPrint className="w-3.5 h-3.5 text-primary" /> Pets at the door?
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {[{ v: false, label: "No pets" }, { v: true, label: "Yes, pets present" }].map((opt) => (
              <button
                key={String(opt.v)}
                onClick={() => onChange("petsAtDoor", opt.v)}
                className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                  access.petsAtDoor === opt.v
                    ? "border-primary bg-primary/8 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {access.petsAtDoor && (
            <Input
              value={access.petNotes}
              onChange={(e) => onChange("petNotes", e.target.value)}
              placeholder="e.g. Labrador — friendly but large"
              className="h-12 rounded-xl mt-1"
            />
          )}
        </div>

        <Button
          onClick={onNext}
          disabled={!valid}
          className="w-full h-14 rounded-full uppercase font-black tracking-widest text-sm disabled:opacity-40"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </Screen>
  );
}

// ── C4 Step 3: Emergency contacts ─────────────────────────────────────────────

function StepEmergencyContacts({
  contacts,
  onAdd,
  onRemove,
  onChange,
  onNext,
  onBack,
}: {
  contacts: EmergencyContact[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, k: keyof EmergencyContact, v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <Screen onBack={onBack}>
      <div className="pt-8 space-y-5 pb-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Emergency Contacts</p>
          <h2 className="text-2xl font-black uppercase tracking-tight leading-tight">
            Who else should the responder know about?
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            These people are notified by the responder on arrival — not by the system. Add anyone who should know we're attending.
          </p>
        </div>

        {/* Contact cards */}
        <div className="space-y-3">
          {contacts.map((c, i) => (
            <div key={c.id} className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide font-bold text-muted-foreground">Contact {i + 1}</p>
                <button
                  onClick={() => onRemove(c.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2.5">
                <Input
                  value={c.name}
                  onChange={(e) => onChange(c.id, "name", e.target.value)}
                  placeholder="Full name"
                  className="h-11 rounded-xl"
                />
                <Input
                  type="tel"
                  value={c.mobile}
                  onChange={(e) => onChange(c.id, "mobile", e.target.value)}
                  placeholder="Mobile number"
                  className="h-11 rounded-xl"
                />
                <Input
                  value={c.relationship}
                  onChange={(e) => onChange(c.id, "relationship", e.target.value)}
                  placeholder="Relationship (e.g. Sister, Neighbour)"
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Add contact button */}
        {contacts.length < 3 && (
          <button
            onClick={onAdd}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-all font-bold text-sm uppercase tracking-wide"
          >
            <UserPlus className="w-4 h-4" />
            Add {contacts.length === 0 ? "a contact" : "another contact"}
          </button>
        )}

        {/* Skip note */}
        <p className="text-center text-xs text-muted-foreground">
          You can skip this — emergency contacts can be added later in Account Settings.
        </p>

        <Button
          onClick={onNext}
          className="w-full h-14 rounded-full uppercase font-black tracking-widest text-sm"
        >
          {contacts.length === 0 ? "Skip for now" : "Continue"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </Screen>
  );
}

// ── C4 Step 4: Attend summary ──────────────────────────────────────────────────

function StepAttendSummary({
  form,
  onEdit,
  onComplete,
  onBack,
}: {
  form: SignUpState;
  onEdit: (step: Step) => void;
  onComplete: () => void;
  onBack: () => void;
}) {
  const { access, emergencyContacts } = form;
  const authorityLabel = access.authorityLevel === "knock-only" ? "Knock only — no entry" : "Enter if needed";
  const entryLabel = access.entryMethod === "key-safe"
    ? `Key safe${access.keySafeCode ? ` (code: ${access.keySafeCode.replace(/./g, "•")})` : ""}`
    : access.entryMethod === "spare-key" ? "Spare key with contact"
    : access.entryMethod === "unlocked" ? "Door left unlocked"
    : access.entryMethod === "other" ? "Other arrangement"
    : "—";

  const summaryRows: { label: string; value: string; step: Step }[] = [
    { label: "Responder authority", value: authorityLabel, step: "access-instructions" },
    ...(access.authorityLevel === "enter-if-needed" ? [
      { label: "Entry method", value: entryLabel, step: "access-instructions" as Step },
      ...(access.keySafeLocation ? [{ label: "Key safe location", value: access.keySafeLocation, step: "access-instructions" as Step }] : []),
    ] : []),
    { label: "Pets at door", value: access.petsAtDoor ? `Yes${access.petNotes ? ` — ${access.petNotes}` : ""}` : "None", step: "access-instructions" },
    { label: "Emergency contacts", value: emergencyContacts.length > 0 ? `${emergencyContacts.length} added` : "None added", step: "emergency-contacts" },
  ];

  return (
    <Screen onBack={onBack}>
      <div className="pt-8 space-y-6 pb-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Almost done</p>
          <h2 className="text-2xl font-black uppercase tracking-tight leading-tight">
            Review your attendance setup
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Here's what a Legacy Wolf responder will have when they attend your address.
          </p>
        </div>

        {/* What happens timeline */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">What happens on an alert</p>
          </div>
          <div className="p-4 space-y-4">
            {[
              { n: 1, text: "Your motion timer expires and the grace period passes without a check-in." },
              { n: 2, text: "Legacy Wolf dispatches an accredited responder to your registered address." },
              { n: 3, text: access.authorityLevel === "enter-if-needed"
                  ? `The responder knocks and calls out. If no response, they use your ${entryLabel.toLowerCase()} to enter.`
                  : "The responder knocks, calls out, and assesses from outside. No entry is made." },
              { n: 4, text: emergencyContacts.length > 0
                  ? `${emergencyContacts.map((c) => c.name || "Your contact").join(" and ")} ${emergencyContacts.length === 1 ? "is" : "are"} notified on the responder's arrival.`
                  : "If there's cause for concern, emergency services are contacted on your behalf." },
              { n: 5, text: "A full incident report is filed and accessible in your account." },
            ].map((item) => (
              <div key={item.n} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-black text-black">{item.n}</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary rows */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
          {summaryRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between px-4 py-3">
              <div className="flex-1 min-w-0 pr-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">{row.label}</p>
                <p className="text-sm font-semibold truncate">{row.value}</p>
              </div>
              <button
                onClick={() => onEdit(row.step)}
                className="flex items-center gap-1 text-xs text-primary font-bold hover:opacity-70 transition-opacity flex-shrink-0"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            </div>
          ))}
        </div>

        {/* Security note */}
        <div className="flex items-start gap-3 bg-card border border-border rounded-xl p-4">
          <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your access instructions are encrypted at rest. They are only decrypted by the assigned responder when a verified incident is active.
          </p>
        </div>

        <Button
          onClick={onComplete}
          className="w-full h-14 rounded-full uppercase font-black tracking-widest text-sm"
        >
          Activate my trial
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </Screen>
  );
}

// ── Root wizard ────────────────────────────────────────────────────────────────

export function SignUpWizard() {
  const navigate = useNavigate();
  const { login, updatePlan } = useApp();

  const [step, setStep] = useState<Step>("entry");
  const [form, setForm] = useState<SignUpState>({
    hasPet: null,
    firstName: "",
    lastName: "",
    mobile: "",
    verificationCode: "",
    termsAccepted: false,
    responseChoice: null,
    contact: { name: "", mobile: "", email: "", relationship: "" },
    notifyPreference: null,
    monitoringMethod: null,
    thresholdHours: 24,
    access: {
      authorityLevel: "knock-only",
      entryMethod: "",
      keySafeCode: "",
      keySafeLocation: "",
      entryNotes: "",
      petsAtDoor: false,
      petNotes: "",
    },
    emergencyContacts: [],
  });

  const set = (k: keyof SignUpState, v: SignUpState[keyof SignUpState]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleComplete = () => {
    // Set plan based on response choice
    if (form.responseChoice === "attend") {
      updatePlan("attend-check");
    } else {
      updatePlan("friend-alert");
    }
    login("user", "LW-US-8472");
    navigate("/user");
  };

  return (
    <div className="relative">
      {/* Progress bar — shown on all steps except entry */}
      {step !== "entry" && (
        <div className="fixed top-0 left-0 right-0 z-50 px-5 pt-3">
          <ProgressBar current={step} />
        </div>
      )}

      {step === "entry" && (
        <StepEntry
          onSignUp={() => setStep("pet-question")}
          onLogin={() => navigate("/login/user")}
        />
      )}

      {step === "pet-question" && (
        <StepPetQuestion
          value={form.hasPet}
          onSelect={(v) => {
            set("hasPet", v);
            setStep("core-details");
          }}
          onBack={() => setStep("entry")}
        />
      )}

      {step === "core-details" && (
        <StepCoreDetails
          state={form}
          onChange={(k, v) => set(k, v)}
          onNext={() => setStep("sms-verify")}
          onBack={() => setStep("pet-question")}
        />
      )}

      {step === "sms-verify" && (
        <StepSmsVerify
          mobile={form.mobile}
          code={form.verificationCode}
          onChange={(v) => set("verificationCode", v)}
          onNext={() => setStep("terms")}
          onBack={() => setStep("core-details")}
          onResend={() => {}}
        />
      )}

      {step === "terms" && (
        <StepTerms
          accepted={form.termsAccepted}
          onToggle={() => set("termsAccepted", !form.termsAccepted)}
          onNext={() => setStep("response-selection")}
          onBack={() => setStep("sms-verify")}
        />
      )}

      {step === "response-selection" && (
        <StepResponseSelection
          value={form.responseChoice}
          onSelect={(v) => set("responseChoice", v)}
          onNext={() => {
            if (form.responseChoice === "notify-only") {
              setStep("contact-details");
            } else {
              setStep("attend-explainer");
            }
          }}
          onBack={() => setStep("terms")}
        />
      )}

      {/* ── C2: notify-only path ── */}

      {step === "contact-details" && (
        <StepContactDetails
          contact={form.contact}
          onChange={(k, v) => setForm((f) => ({ ...f, contact: { ...f.contact, [k]: v } }))}
          onNext={() => setStep("contact-notify")}
          onBack={() => setStep("response-selection")}
        />
      )}

      {step === "contact-notify" && (
        <StepContactNotify
          value={form.notifyPreference}
          onSelect={(v) => set("notifyPreference", v)}
          onNext={() => setStep("monitoring-method")}
          onBack={() => setStep("contact-details")}
        />
      )}

      {step === "monitoring-method" && (
        <StepMonitoringMethod
          value={form.monitoringMethod}
          onSelect={(v) => set("monitoringMethod", v)}
          onNext={() => setStep("threshold")}
          onBack={() => setStep("contact-notify")}
        />
      )}

      {step === "threshold" && (
        <StepThreshold
          value={form.thresholdHours}
          onChange={(h) => set("thresholdHours", h)}
          onNext={() => setStep("alert-summary")}
          onBack={() => setStep("monitoring-method")}
          monitoringMethod={form.monitoringMethod}
        />
      )}

      {step === "alert-summary" && (
        <StepAlertSummary
          form={form}
          onEdit={(s) => setStep(s)}
          onComplete={handleComplete}
          onBack={() => setStep("threshold")}
        />
      )}

      {/* ── C4: attend path ── */}

      {step === "attend-explainer" && (
        <StepAttendExplainer
          onNext={() => setStep("access-instructions")}
          onBack={() => setStep("response-selection")}
        />
      )}

      {step === "access-instructions" && (
        <StepAccessInstructions
          access={form.access}
          onChange={(k, v) => setForm((f) => ({ ...f, access: { ...f.access, [k]: v } }))}
          onNext={() => setStep("emergency-contacts")}
          onBack={() => setStep("attend-explainer")}
        />
      )}

      {step === "emergency-contacts" && (
        <StepEmergencyContacts
          contacts={form.emergencyContacts}
          onAdd={() => setForm((f) => ({
            ...f,
            emergencyContacts: [...f.emergencyContacts, { id: Date.now().toString(), name: "", mobile: "", relationship: "" }],
          }))}
          onRemove={(id) => setForm((f) => ({ ...f, emergencyContacts: f.emergencyContacts.filter((c) => c.id !== id) }))}
          onChange={(id, k, v) => setForm((f) => ({
            ...f,
            emergencyContacts: f.emergencyContacts.map((c) => c.id === id ? { ...c, [k]: v } : c),
          }))}
          onNext={() => setStep("attend-summary")}
          onBack={() => setStep("access-instructions")}
        />
      )}

      {step === "attend-summary" && (
        <StepAttendSummary
          form={form}
          onEdit={(s) => setStep(s)}
          onComplete={handleComplete}
          onBack={() => setStep("emergency-contacts")}
        />
      )}
    </div>
  );
}
