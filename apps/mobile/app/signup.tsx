import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import {
  Button,
  Card,
  Input,
  Label,
  OtpInput,
  Progress,
} from "@legacy-wolf/ui";
import { colors, radii, spacing, typography } from "@legacy-wolf/tokens";
import { Activity, Bell, Check, DoorOpen, Eye, MapPin, MessageSquare, PawPrint, Shield, Dog } from "lucide-react-native";
import type { CountryCode } from "libphonenumber-js";
import { detectedCountry, InternationalPhoneInput, toE164, validPhone } from "../src/auth/phone-input";
import type { Account } from "@legacy-wolf/core";
import { AuthShell, Choice, authStyles } from "../src/auth/auth-shell";
import { useSession } from "../src/auth/session";
import * as SecureStore from "../src/storage/secure";

type Step =
  | "pet-question"
  | "pet-details"
  | "core-details"
  | "sms-verify"
  | "terms"
  | "response-selection"
  | "contact-details"
  | "contact-notify"
  | "monitoring-method"
  | "threshold"
  | "alert-summary"
  | "attend-explainer"
  | "access-instructions"
  | "emergency-contacts"
  | "attend-summary";
type ResponseChoice = "notify-only" | "attend";
interface FormState {
  hasPet: boolean | null;
  pets: PetIntake[];
  firstName: string;
  lastName: string;
  mobile: string;
  code: string;
  terms: boolean;
  billing: "annual" | "monthly";
  responseChoice: ResponseChoice | null;
  contactName: string;
  contactMobile: string;
  contactCountry: CountryCode;
  contactEmail: string;
  contactRelationship: string;
  notifyPreference: "inform-now" | "only-on-alert" | null;
  monitoringMethod: "motion-inactivity" | "check-in-prompts" | null;
  thresholdHours: number;
  authority: "knock-only" | "enter-if-needed";
  entryMethod: "key-safe" | "spare-key" | "unlocked" | "other" | null;
  keySafeCode: string;
  keySafeLocation: string;
  entryNotes: string;
  emergencyName: string;
  emergencyMobile: string;
  emergencyRelationship: string;
}
interface PetIntake {
  id: string;
  name: string;
  species: string;
  otherSpecies: string;
  breed: string;
  routine: string;
  hasMedication: boolean | null;
}
const emptyPet = (id = "pet-1"): PetIntake => ({ id, name: "", species: "", otherSpecies: "", breed: "", routine: "", hasMedication: null });
const onboardingDraftKey = "legacy-wolf-onboarding-draft";

const initial: FormState = {
  hasPet: null,
  pets: [emptyPet()],
  firstName: "",
  lastName: "",
  mobile: "",
  code: "",
  terms: false,
  billing: "annual",
  responseChoice: null,
  contactName: "",
  contactMobile: "",
  contactCountry: detectedCountry(),
  contactEmail: "",
  contactRelationship: "",
  notifyPreference: null,
  monitoringMethod: null,
  thresholdHours: 24,
  authority: "knock-only",
  entryMethod: null,
  keySafeCode: "",
  keySafeLocation: "",
  entryNotes: "",
  emergencyName: "",
  emergencyMobile: "",
  emergencyRelationship: "",
};
const notifySteps: Step[] = [
  "contact-details",
  "contact-notify",
  "threshold",
  "monitoring-method",
  "alert-summary",
];
const attendSteps: Step[] = [
  "contact-details",
  "contact-notify",
  "attend-explainer",
  "access-instructions",
  "emergency-contacts",
  "attend-summary",
];

export default function SignUpScreen() {
  const { account: sessionAccount, client, requestOtp, verifyOtp, completeAuthentication, developmentOtpCode } =
    useSession();
  const [step, setStep] = useState<Step>("core-details");
  const [form, setForm] = useState<FormState>(initial);
  const [verifiedAccount, setVerifiedAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileCountry, setMobileCountry] = useState<CountryCode>(detectedCountry);
  const [thresholdText, setThresholdText] = useState(String(initial.thresholdHours));
  const [openSpeciesId, setOpenSpeciesId] = useState<string | null>(null);
  const [onboardingStarted, setOnboardingStarted] = useState(false);
  useEffect(() => {
    void SecureStore.getItemAsync(onboardingDraftKey).then((stored) => {
      if (!stored) return;
      try {
        const draft = JSON.parse(stored) as { step?: Step; form?: FormState; mobileCountry?: CountryCode };
        if (draft.form) setForm(draft.form);
        if (draft.step) setStep(draft.step);
        if (draft.mobileCountry) setMobileCountry(draft.mobileCountry);
        setOnboardingStarted(true);
      } catch {
        void SecureStore.deleteItemAsync(onboardingDraftKey);
      }
    });
  }, []);
  useEffect(() => {
    if (!onboardingStarted) return;
    void SecureStore.setItemAsync(onboardingDraftKey, JSON.stringify({ step, form, mobileCountry }));
  }, [form, mobileCountry, onboardingStarted, step]);
  const path = useMemo(
    () => [
      "core-details" as Step,
      "pet-question" as Step,
      ...(form.hasPet ? (["pet-details"] as Step[]) : []),
      "sms-verify" as Step,
      "terms" as Step,
      "response-selection" as Step,
      ...(form.responseChoice === "attend"
        ? attendSteps
        : form.responseChoice === "notify-only"
          ? notifySteps
          : []),
    ],
    [form.responseChoice],
  );
  const stepIndex = path.indexOf(step);
  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  function updatePet(id: string, patch: Partial<PetIntake>) {
    setForm((current) => ({ ...current, pets: current.pets.map((pet) => pet.id === id ? { ...pet, ...patch } : pet) }));
  }
  function addPet() {
    setForm((current) => ({ ...current, pets: [...current.pets, emptyPet(`pet-${Date.now()}`)] }));
  }
  function removePet(id: string) {
    setForm((current) => ({ ...current, pets: current.pets.filter((pet) => pet.id !== id) }));
  }
  function setThreshold(value: number) {
    const wholeHours = Math.min(72, Math.max(4, Math.round(value)));
    update("thresholdHours", wholeHours);
    setThresholdText(String(wholeHours));
  }
  function commitThreshold() {
    const parsed = Number(thresholdText);
    setThreshold(Number.isFinite(parsed) ? parsed : form.thresholdHours);
  }
  function goBack() {
    if (stepIndex <= 0) {
      if (router.canGoBack()) router.back();
      else router.replace("/");
    }
    else setStep(path[stepIndex - 1] ?? "core-details");
    setError(null);
  }
  function next(target?: Step) {
    if (target) setStep(target);
    else {
      const value = path[stepIndex + 1];
      if (value) setStep(value);
    }
    setError(null);
  }
  async function requestSignupCode(destination: "pet-question" | "sms-verify" = "sms-verify") {
    const normalized = toE164(form.mobile, mobileCountry);
    if (!validPhone(form.mobile, mobileCountry)) {
      setError("Enter a valid mobile number.");
      return;
    }
    if (destination === "sms-verify") next("sms-verify");
    setLoading(true);
    try {
      await requestOtp(normalized, "sms", true);
      if (destination === "pet-question") next("pet-question");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "We could not send a verification code.",
      );
    } finally {
      setLoading(false);
    }
  }
  async function verifyCode() {
    setLoading(true);
    try {
      const account = await verifyOtp(form.code);
      setVerifiedAccount(account);
      completeAuthentication(account);
      setOnboardingStarted(true);
      await SecureStore.setItemAsync(onboardingDraftKey, JSON.stringify({ step: "terms", form, mobileCountry }));
      next("terms");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "We could not verify that code.",
      );
    } finally {
      setLoading(false);
    }
  }
  async function complete() {
    const authenticatedAccount = verifiedAccount ?? sessionAccount;
    if (!authenticatedAccount) {
      setError("Verify your mobile number before continuing.");
      return;
    }
    setLoading(true);
    try {
      const account = await client.accountApi.update({
        preferredName: form.firstName,
        legalName: `${form.firstName} ${form.lastName}`.trim(),
      });
      await client.plans.update({
        tier:
          form.responseChoice === "attend" ? "attend_check" : "friend_alert",
        status: "setup",
      });
      await client.timerApi.update({
        interval_hours: form.thresholdHours,
        grace_minutes: 5,
      });
      if (form.contactName) {
        const contact = await client.peopleApi.create({
          plan_id: "",
          linked_account: null,
          name: form.contactName,
          relationship: form.contactRelationship || "Nominated contact",
          phone_e164: form.contactMobile ? toE164(form.contactMobile, form.contactCountry) : null,
          email: form.contactEmail || null,
          roles: ["nominated_contact"],
          escalation_order: 1,
          instructions: form.notifyPreference === "inform-now" ? "Contact may be informed during setup." : "Contact only when the plan activates.",
          verification: "pending",
          invited_at: form.notifyPreference === "inform-now" ? new Date().toISOString() : null,
          verified_at: null,
        });
        await client.responseQueue.create({ plan_id: "", position: 1, channel: "sms", target_person: contact.id, wait_minutes: 5, message_template: null });
        await client.responseQueue.create({ plan_id: "", position: 2, channel: "call", target_person: contact.id, wait_minutes: 5, message_template: null });
      }
      if (form.responseChoice === "attend") {
        await client.propertyApi.save({ address: { line1: "Address confirmation required", line2: null, suburb: "Not provided", region: "Not provided", postal_code: "0000", country_code: "AU" }, property_type: null, unit_details: null });
        const access = [
          ["responder_authority", form.authority],
          ["entry_method", form.entryMethod ?? ""],
          ["keysafe_code", form.keySafeCode],
          ["keysafe_location", form.keySafeLocation],
          ["entry_notes", form.entryNotes],
        ] as const;
        await Promise.all(access.filter(([, value]) => value).map(([field, value]) => client.propertyApi.saveAccessDetail(field, value)));
        if (form.emergencyName) await client.peopleApi.create({ plan_id: "", linked_account: null, name: form.emergencyName, relationship: form.emergencyRelationship || "Emergency contact", phone_e164: form.emergencyMobile || null, email: null, roles: [], escalation_order: null, instructions: "Responder may notify this person after arrival.", verification: "pending", invited_at: null, verified_at: null });
        const queue = await client.responseQueue.list();
        await client.responseQueue.create({ plan_id: "", position: queue.length + 1, channel: "dispatch", target_person: null, wait_minutes: 0, message_template: null });
      }
      if (form.hasPet) for (const pet of form.pets) await client.petsApi.create({ plan_id: "", name: pet.name.trim(), species: (pet.species === "Other" ? pet.otherSpecies : pet.species).trim() || null, breed: pet.breed.trim() || null, age_years: null, sex: null, weight_kg: null, microchip_id: null, photo_key: null, vet_contact: null, medical: pet.hasMedication ? { medication_required: true, details_pending: true } : null, routine: pet.routine.trim() ? { instructions: pet.routine.trim() } : null, preferences: null, guardian_primary: null, guardian_backup: null, emergency_fund_cents: null });
      await client.plans.update({ status: "protected" });
      completeAuthentication(account);
      await SecureStore.deleteItemAsync(onboardingDraftKey);
      router.replace("/biometric-opt-in");
    } catch (reason) {
      const detail = reason instanceof Error ? reason.message : "Unknown local API error";
      setError(`We could not save your setup. ${detail}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      onBack={goBack}
      scrollResetKey={step}
      headerAccessory={
        <View style={styles.progress}>
          <Progress value={progressForStep(step, form.responseChoice)} />
        </View>
      }
    >
      {step === "pet-question" && (
        <StepBlock
          eyebrow="Step 2 of 5"
          title="Do you have a pet living with you?"
          body="If you have a pet, we can arrange for them to be cared for and handed to their guardian if we need to attend."
        >
          <View style={styles.petChoiceRow}>
          <PetChoiceCard
            body="We’ll set up pet care."
            icon="dog"
            onPress={() => {
              update("hasPet", true);
              next("pet-details");
            }}
            selected={form.hasPet === true}
            title="Yes"
          />
          <PetChoiceCard
            body="You can add pets later."
            icon="shield"
            onPress={() => {
              update("hasPet", false);
              next("sms-verify");
            }}
            selected={form.hasPet === false}
            title="No"
          />
          </View>
        </StepBlock>
      )}

      {step === "pet-details" && (
        <StepBlock
          eyebrow="Pet Guardian"
          title="Tell us about your pet"
          body="This creates the pet profile in your account so responders and your nominated guardian have the care information they need."
        >
          {form.pets.map((pet, index) => (
            <Card key={pet.id}>
              <View style={styles.petFormHeader}><Text style={styles.cardTitle}>PET {index + 1}</Text>{form.pets.length > 1 ? <Pressable onPress={() => removePet(pet.id)}><Text style={styles.removeText}>REMOVE</Text></Pressable> : null}</View>
              <View style={authStyles.stack}>
                <Field label="Pet name" onChange={(name) => updatePet(pet.id, { name })} placeholder="Pet name" value={pet.name} />
                <View><Label>Species</Label><Pressable onPress={() => setOpenSpeciesId(openSpeciesId === pet.id ? null : pet.id)} style={styles.select}><Text style={[styles.selectText, !pet.species && styles.selectPlaceholder]}>{pet.species || "Select species"}</Text><Text style={styles.selectChevron}>⌄</Text></Pressable>
                  {openSpeciesId === pet.id ? <View style={styles.selectMenu}>{["Dog", "Cat", "Bird", "Snake", "Horse", "Fish", "Other"].map((species) => <Pressable key={species} onPress={() => { updatePet(pet.id, { species, otherSpecies: species === "Other" ? pet.otherSpecies : "" }); setOpenSpeciesId(null); }} style={styles.selectOption}><Text style={styles.selectOptionText}>{species}</Text>{pet.species === species ? <Check color={colors.guardianGreen} size={16} /> : null}</Pressable>)}</View> : null}</View>
                {pet.species === "Other" ? <Field label="Other species" onChange={(otherSpecies) => updatePet(pet.id, { otherSpecies })} placeholder="Enter species" value={pet.otherSpecies} /> : null}
                <Field label="Breed — optional" onChange={(breed) => updatePet(pet.id, { breed })} placeholder="Breed" value={pet.breed} />
                <Field label="Daily routine — optional" onChange={(routine) => updatePet(pet.id, { routine })} placeholder="Feeding, walks and care routine…" value={pet.routine} />
                <View><Label>Does this pet take medication?</Label><View style={styles.twoChoices}><SmallChoice label="Yes" onPress={() => updatePet(pet.id, { hasMedication: true })} selected={pet.hasMedication === true} /><SmallChoice label="No" onPress={() => updatePet(pet.id, { hasMedication: false })} selected={pet.hasMedication === false} /></View></View>
                {pet.hasMedication ? <Text style={authStyles.small}>We’ll ask for medication names, dosage and timing from Pet Guardian after signup.</Text> : null}
              </View>
            </Card>
          ))}
          <Pressable onPress={addPet} style={styles.addPetButton}><Text style={styles.addPetPlus}>+</Text><Text style={styles.addPetText}>ADD ANOTHER PET</Text></Pressable>
          <Card><Text style={authStyles.small}>You can add guardians, photos, microchip details, vet contacts, and additional pets from Pet Guardian in your account.</Text></Card>
          <Button disabled={!form.pets.every((pet) => pet.name.trim() && pet.species && (pet.species !== "Other" || pet.otherSpecies.trim()) && pet.hasMedication !== null)} onPress={() => next("sms-verify")}>Save pets and continue</Button>
        </StepBlock>
      )}

      {step === "core-details" && (
        <StepBlock
          eyebrow="Step 1 of 5"
          title="Your details"
          body="We’ll use your mobile to verify your identity and send check-in prompts."
        >
          <Field
            label="First name"
            onChange={(v) => update("firstName", v)}
            placeholder="First name"
            value={form.firstName}
          />
          <Field
            label="Last name"
            onChange={(v) => update("lastName", v)}
            placeholder="Last name"
            value={form.lastName}
          />
          <InternationalPhoneInput country={mobileCountry} onChange={(v) => update("mobile", v)} onCountryChange={setMobileCountry} value={form.mobile} />
          <Text style={authStyles.small}>Detected from your device region. Tap the flag or code to change it.</Text>
          {error && <ErrorText>{error}</ErrorText>}
          <Button
            disabled={
              !form.firstName.trim() ||
              !form.lastName.trim() ||
              !validPhone(form.mobile, mobileCountry)
            }
            loading={loading}
            onPress={() => void requestSignupCode("pet-question")}
          >
            Continue
          </Button>
        </StepBlock>
      )}

      {step === "sms-verify" && (
        <StepBlock
          eyebrow="Step 3 of 5"
          title="Verify your number"
          body={`We sent a six-digit code to ${toE164(form.mobile, mobileCountry)}.`}
        >
          <Label>Verification code</Label>
          <OtpInput onChange={(v) => update("code", v)} value={form.code} />
          {developmentOtpCode ? <Card><Text style={styles.devCodeLabel}>LOCAL DEVELOPMENT CODE</Text><Text style={styles.devCode}>{developmentOtpCode}</Text></Card> : null}
          {error && <ErrorText>{error}</ErrorText>}
          <Button onPress={() => void requestSignupCode()} variant="ghost">
            Didn’t receive it? Resend code
          </Button>
          <Button
            disabled={form.code.length !== 6}
            loading={loading}
            onPress={verifyCode}
          >
            Verify number  →
          </Button>
        </StepBlock>
      )}

      {step === "terms" && (
        <StepBlock
          eyebrow="Step 4 of 5"
          title="Terms & Privacy"
          body="Review these terms before authorizing your plan."
        >
          {terms.map((item) => (
            <Card key={item.title}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={authStyles.small}>{item.body}</Text>
            </Card>
          ))}
          <Choice
            body="I have read and accept the Terms of Service and Privacy Policy."
            onPress={() => update("terms", !form.terms)}
            selected={form.terms}
            title="I accept"
          />
          <Button
            disabled={!form.terms}
            onPress={() => next("response-selection")}
          >
            Accept and continue
          </Button>
        </StepBlock>
      )}

      {step === "response-selection" && (
        <StepBlock
          eyebrow="Step 5 of 5"
          title="Choose the response you want if we are alerted"
          body="Both options are available during your 4-week free trial. You can change this at any time."
        >
          <View style={styles.billingToggle}>
            <Pressable onPress={() => update("billing", "annual")} style={[styles.billingOption, form.billing === "annual" && styles.billingOptionSelected]}>
              <Text style={[styles.billingText, form.billing === "annual" && styles.billingTextSelected]}>ANNUAL</Text>
              {form.billing === "annual" ? <Text style={styles.savingsPill}>SAVE 30%</Text> : null}
            </Pressable>
            <Pressable onPress={() => update("billing", "monthly")} style={[styles.billingOption, form.billing === "monthly" && styles.billingOptionSelected]}>
              <Text style={[styles.billingText, form.billing === "monthly" && styles.billingTextSelected]}>MONTHLY</Text>
            </Pressable>
          </View>
          <PlanChoiceCard billing={form.billing} id="notify-only" onPress={() => update("responseChoice", "notify-only")} selected={form.responseChoice === "notify-only"} />
          <PlanChoiceCard billing={form.billing} id="attend" onPress={() => update("responseChoice", "attend")} selected={form.responseChoice === "attend"} />
          <Button
            disabled={!form.responseChoice}
            onPress={() => next("contact-details")}
          >
            Activate my trial  →
          </Button>
        </StepBlock>
      )}

      {step === "contact-details" && (
        <StepBlock
          eyebrow="Nominated contact"
          title="Who should we alert?"
          body="This person will receive an alert if you become unresponsive. They don’t need the app."
        >
          <Field
            label="Full name"
            onChange={(v) => update("contactName", v)}
            placeholder="Full name"
            value={form.contactName}
          />
          <InternationalPhoneInput country={form.contactCountry} label="Mobile number" onChange={(v) => update("contactMobile", v)} onCountryChange={(v) => update("contactCountry", v)} value={form.contactMobile} />
          <Field
            keyboard="email-address"
            label="Email — optional"
            onChange={(v) => update("contactEmail", v)}
            placeholder="contact@example.com"
            value={form.contactEmail}
          />
          <Label>Relationship</Label>
          <View style={styles.chipRow}>
            {["Partner", "Parent", "Sibling", "Friend", "Neighbour", "Other"].map((relationship) => (
              <SmallChoice key={relationship} label={relationship} onPress={() => update("contactRelationship", relationship)} selected={form.contactRelationship === relationship} />
            ))}
          </View>
          <Button
            disabled={!form.contactName.trim() || !validPhone(form.contactMobile, form.contactCountry) || !form.contactRelationship}
            onPress={() => next()}
          >
            Continue
          </Button>
        </StepBlock>
      )}

      {step === "contact-notify" && (
        <StepBlock
          eyebrow="Nominated contact"
          title="Should we let them know?"
          body="We can send your contact a message now so they’re not caught off guard in an emergency."
        >
          <NotifyChoiceCard
            body="Recommended — we send a welcome message explaining their role, so they know what to expect before an alert ever fires."
            icon="message"
            onPress={() => update("notifyPreference", "inform-now")}
            selected={form.notifyPreference === "inform-now"}
            tag="Recommended"
            title="Inform them now"
          />
          <NotifyChoiceCard
            body="Private — they won’t know they’re nominated and will only hear from us if your timer triggers."
            icon="bell"
            onPress={() => update("notifyPreference", "only-on-alert")}
            selected={form.notifyPreference === "only-on-alert"}
            tag="Private"
            title="Only contact on alert"
          />
          <Button
            disabled={!form.notifyPreference}
            onPress={() => next(form.responseChoice === "attend" ? "attend-explainer" : "threshold")}
          >
            Continue
          </Button>
        </StepBlock>
      )}

      {step === "monitoring-method" && (
        <StepBlock
          eyebrow="Check-in method"
          title="How would you like to check in?"
          body="Choose the signal Legacy Wolf should use to know you’re active. You can change this at any time."
        >
          <Choice
            body="Your phone’s sensors detect whether you’re moving. Set and forget—just live normally."
            onPress={() => update("monitoringMethod", "motion-inactivity")}
            selected={form.monitoringMethod === "motion-inactivity"}
            title="Motion inactivity"
          />
          <Choice
            body="We send a push notification at your chosen interval. Tap once to confirm you’re okay."
            onPress={() => update("monitoringMethod", "check-in-prompts")}
            selected={form.monitoringMethod === "check-in-prompts"}
            title="Check-in prompts"
          />
          <Button disabled={!form.monitoringMethod} onPress={() => next()}>
            Continue
          </Button>
        </StepBlock>
      )}

      {step === "threshold" && (
        <StepBlock
          eyebrow="Monitoring"
          title="When should we alert?"
          body="Choose how long Legacy Wolf should wait without an activity signal before alerting your contact."
        >
          <View style={styles.threshold}>
            <TimerAdjustButton
              disabled={form.thresholdHours <= 4}
              label="−"
              onPress={() => setThreshold(form.thresholdHours - 1)}
            />
            <View style={styles.hoursEditor}>
              <TextInput
                accessibilityLabel="Timer hours"
                keyboardType="number-pad"
                maxLength={2}
                onBlur={commitThreshold}
                onChangeText={(value) => /^\d{0,2}$/.test(value) && setThresholdText(value)}
                onSubmitEditing={commitThreshold}
                selectTextOnFocus
                style={styles.hoursInput}
                value={thresholdText}
              />
              <Text style={styles.hoursLabel}>HOURS</Text>
            </View>
            <TimerAdjustButton
              disabled={form.thresholdHours >= 72}
              label="+"
              onPress={() => setThreshold(form.thresholdHours + 1)}
            />
          </View>
          <View style={styles.chipRow}>
            {[8, 12, 16, 24, 48].map((hours) => <SmallChoice key={hours} label={`${hours}h${hours === 16 ? " ★" : ""}`} onPress={() => setThreshold(hours)} selected={form.thresholdHours === hours} />)}
          </View>
          <Text style={authStyles.small}>
            We recommend 16 hours—long enough to avoid common false alarms,
            short enough to matter.
          </Text>
          <Button onPress={() => { commitThreshold(); next("monitoring-method"); }}>Set threshold</Button>
        </StepBlock>
      )}

      {step === "alert-summary" && (
        <StepBlock
          eyebrow="Almost done"
          title="Review your alert setup"
          body="Here’s what happens if you don’t check in within your threshold."
        >
          <Timeline title="What happens on an alert" items={[
            `After ${form.thresholdHours}h of ${form.monitoringMethod === "motion-inactivity" ? "no motion detected" : "no check-in response"}, we trigger an alert.`,
            `${form.contactName || "Your contact"} receives an SMS and call${form.contactMobile ? ` at ${toE164(form.contactMobile, form.contactCountry)}` : ""}.`,
            form.notifyPreference === "inform-now" ? "They’ve already been briefed on their role and what to do." : "They’ll receive instructions in the alert message.",
            "No physical responder is dispatched—this plan uses contact-only alerts.",
          ]} />
          <EditableSummary label="Contact" onEdit={() => next("contact-details")} value={form.contactName} />
          <EditableSummary label="Mobile" onEdit={() => next("contact-details")} value={form.contactMobile ? toE164(form.contactMobile, form.contactCountry) : ""} />
          <EditableSummary label="Relationship" onEdit={() => next("contact-details")} value={form.contactRelationship} />
          <EditableSummary
            label="Contact notified"
            onEdit={() => next("contact-notify")}
            value={
              form.notifyPreference === "inform-now"
                ? "Inform now"
                : "Only on an alert"
            }
          />
          <EditableSummary
            label="Monitoring"
            onEdit={() => next("monitoring-method")}
            value={
              form.monitoringMethod === "motion-inactivity"
                ? "Motion inactivity"
                : "Check-in prompts"
            }
          />
          <EditableSummary label="Threshold" onEdit={() => next("threshold")} value={`${form.thresholdHours}h inactivity`} />
          {error && <ErrorText>{error}</ErrorText>}
          <Button loading={loading} onPress={complete}>
            Activate my trial
          </Button>
        </StepBlock>
      )}

      {step === "attend-explainer" && (
        <StepBlock
          eyebrow="Attendance"
          title="What a Legacy Wolf visit looks like"
          body="Before we set up your access instructions, here’s exactly what happens when a responder attends your address."
        >
          {attendancePoints.map((point) => <InfoCard key={point.title} {...point} />)}
          <Button onPress={() => next()}>Set up my access instructions</Button>
        </StepBlock>
      )}

      {step === "access-instructions" && (
        <StepBlock
          eyebrow="Property access"
          title="What may the responder do?"
          body="These instructions apply only during an active incident."
        >
          <Choice
            onPress={() => update("authority", "knock-only")}
            selected={form.authority === "knock-only"}
            title="Knock only — no entry"
          />
          <Choice
            onPress={() => update("authority", "enter-if-needed")}
            selected={form.authority === "enter-if-needed"}
            title="Enter if needed"
          />
          {form.authority === "enter-if-needed" && (
            <>
              <Label>Entry method</Label>
              {(["key-safe", "spare-key", "unlocked", "other"] as const).map(
                (method) => (
                  <Choice
                    key={method}
                    onPress={() => update("entryMethod", method)}
                    selected={form.entryMethod === method}
                    title={entryLabels[method]}
                  />
                ),
              )}
              {form.entryMethod === "key-safe" && (
                <>
                  <Field
                    label="Key safe code"
                    onChange={(v) => update("keySafeCode", v)}
                    placeholder="Code"
                    secure
                    value={form.keySafeCode}
                  />
                  <Field
                    label="Key safe location"
                    onChange={(v) => update("keySafeLocation", v)}
                    placeholder="Location"
                    value={form.keySafeLocation}
                  />
                </>
              )}
              <Field
                label="Additional entry notes — optional"
                onChange={(v) => update("entryNotes", v)}
                placeholder="Entry instructions"
                value={form.entryNotes}
              />
            </>
          )}
          <Button
            disabled={form.authority === "enter-if-needed" && !form.entryMethod}
            onPress={() => next()}
          >
            Continue
          </Button>
        </StepBlock>
      )}

      {step === "emergency-contacts" && (
        <StepBlock
          eyebrow="Emergency contacts"
          title="Who else should the responder know about?"
          body="These people are notified by the responder on arrival—not automatically by the system."
        >
          <Field
            label="Full name — optional"
            onChange={(v) => update("emergencyName", v)}
            placeholder="Full name"
            value={form.emergencyName}
          />
          <Field
            keyboard="phone-pad"
            label="Mobile number — optional"
            onChange={(v) => update("emergencyMobile", v)}
            placeholder="Mobile number"
            value={form.emergencyMobile}
          />
          <Field
            label="Relationship — optional"
            onChange={(v) => update("emergencyRelationship", v)}
            placeholder="Relationship"
            value={form.emergencyRelationship}
          />
          <Button onPress={() => next()}>
            {form.emergencyName ? "Continue" : "Skip for now"}
          </Button>
        </StepBlock>
      )}

      {step === "attend-summary" && (
        <StepBlock
          eyebrow="Almost done"
          title="Review your attendance setup"
          body="Here’s what a Legacy Wolf responder will have when they attend your address."
        >
          <Timeline title="What happens on an alert" items={[
            "Your Motion Timer expires and the grace period passes without a check-in.",
            "Legacy Wolf dispatches an accredited responder to your registered address.",
            form.authority === "enter-if-needed" ? `The responder knocks and calls out. If there is no response, they use your ${form.entryMethod ? entryLabels[form.entryMethod].toLowerCase() : "authorised access method"} to enter.` : "The responder knocks, calls out, and assesses from outside. No entry is made.",
            form.emergencyName ? `${form.emergencyName} is notified on the responder’s arrival.` : "If there’s cause for concern, emergency services are contacted on your behalf.",
            "A full incident report is filed and accessible in your account.",
          ]} />
          <EditableSummary label="Nominated contact" onEdit={() => next("contact-details")} value={`${form.contactName} · ${form.contactRelationship}`} />
          <EditableSummary label="Contact timing" onEdit={() => next("contact-notify")} value={form.notifyPreference === "inform-now" ? "Inform them now" : "Only on alert"} />
          <Summary
            label="Responder authority"
            value={
              form.authority === "knock-only"
                ? "Knock only — no entry"
                : "Enter if needed"
            }
          />
          <Summary
            label="Entry method"
            value={
              form.entryMethod ? entryLabels[form.entryMethod] : "Not required"
            }
          />
          <Summary
            label="Access detail"
            value={form.keySafeCode ? "••••" : "None saved"}
          />
          {form.hasPet ? <Summary label="Pet profiles" value={form.pets.map((pet) => `${pet.name} · ${pet.species === "Other" ? pet.otherSpecies : pet.species}`).join(", ")} /> : null}
          <Summary
            label="Emergency contact"
            value={form.emergencyName || "None added"}
          />
          <Card>
            <Text style={authStyles.small}>
              Your access instructions are encrypted at rest and only released
              during a verified incident.
            </Text>
          </Card>
          {error && <ErrorText>{error}</ErrorText>}
          <Button loading={loading} onPress={complete}>
            Activate my trial
          </Button>
        </StepBlock>
      )}
    </AuthShell>
  );
}

function progressForStep(step: Step, responseChoice: ResponseChoice | null) {
  const onboarding: Partial<Record<Step, number>> = { "core-details": 20, "pet-question": 40, "pet-details": 40, "sms-verify": 60, terms: 80, "response-selection": 100 };
  if (onboarding[step]) return onboarding[step] ?? 0;
  if (responseChoice === "attend") {
    const attend: Partial<Record<Step, number>> = { "contact-details": 20, "contact-notify": 40, "attend-explainer": 55, "access-instructions": 70, "emergency-contacts": 85, "attend-summary": 100 };
    return attend[step] ?? 0;
  }
  const notify: Partial<Record<Step, number>> = { "contact-details": 20, "contact-notify": 40, threshold: 60, "monitoring-method": 80, "alert-summary": 100 };
  return notify[step] ?? 0;
}

function PetChoiceCard({ selected, title, body, icon, onPress }: { selected: boolean; title: string; body: string; icon: "dog" | "shield"; onPress(): void }) {
  const Icon = icon === "dog" ? Dog : Shield;
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={onPress} style={[styles.petChoice, selected && styles.petChoiceSelected]}>
      <View style={styles.petIconCircle}><Icon color={colors.white} size={28} strokeWidth={2} /></View>
      <Text style={styles.petChoiceTitle}>{title.toUpperCase()}</Text>
      <Text style={styles.petChoiceBody}>{body}</Text>
      {selected ? <View style={styles.petCheck}><Check color={colors.obsidian} size={13} strokeWidth={3} /></View> : null}
    </Pressable>
  );
}

function TimerAdjustButton({ label, disabled, onPress }: { label: string; disabled: boolean; onPress(): void }) {
  return (
    <Pressable
      accessibilityLabel={`${label === "+" ? "Increase" : "Decrease"} timer by one hour`}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.timerAdjust, disabled && styles.timerAdjustDisabled, pressed && !disabled && styles.timerAdjustPressed]}
    >
      <Text style={styles.timerAdjustText}>{label}</Text>
    </Pressable>
  );
}

function NotifyChoiceCard({ title, body, tag, icon, selected, onPress }: { title: string; body: string; tag: string; icon: "message" | "bell"; selected: boolean; onPress(): void }) {
  const Icon = icon === "message" ? MessageSquare : Bell;
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={onPress} style={[styles.notifyCard, selected && styles.notifyCardSelected]}>
      <View style={styles.notifyIcon}><Icon color={colors.white} size={21} strokeWidth={2} /></View>
      <View style={styles.notifyContent}>
        <View style={styles.notifyTitleRow}><Text style={styles.notifyTitle}>{title.toUpperCase()}</Text><Text style={styles.notifyTag}>{tag.toUpperCase()}</Text></View>
        <Text style={styles.notifyBody}>{body.replace(/^Recommended — |^Private — /, "")}</Text>
      </View>
      {selected ? <View style={styles.notifyCheck}><Check color={colors.obsidian} size={12} strokeWidth={3} /></View> : null}
    </Pressable>
  );
}

const signupPlans = {
  "notify-only": {
    title: "Notify your nominated contact",
    description: "When your Motion Timer expires, we send an alert to your nominated contact. No physical response.",
    features: ["SMS alert to your contact", "No physical attendance"],
    monthlyPrice: 7,
    annualMonthlyPrice: 5,
    annualTotal: 60,
  },
  attend: {
    title: "Legacy Wolf to attend and check on you",
    description: "An accredited Legacy Wolf responder physically attends your address and performs a welfare check.",
    features: ["Physical welfare check at your address", "Emergency services coordination", "Pet care if needed"],
    monthlyPrice: 10,
    annualMonthlyPrice: 7,
    annualTotal: 84,
  },
} as const;

function PlanChoiceCard({ id, billing, selected, onPress }: { id: ResponseChoice; billing: "annual" | "monthly"; selected: boolean; onPress(): void }) {
  const plan = signupPlans[id];
  const Icon = id === "attend" ? Shield : Bell;
  const price = billing === "annual" ? plan.annualMonthlyPrice : plan.monthlyPrice;
  const saving = Math.round(((plan.monthlyPrice - plan.annualMonthlyPrice) / plan.monthlyPrice) * 100);
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={onPress} style={[styles.planCard, selected && styles.planCardSelected]}>
      <View style={styles.planHeader}>
        <View style={[styles.planIcon, selected && styles.planIconSelected]}><Icon color={colors.white} size={22} /></View>
        <View style={styles.planHeading}>
          <Text style={styles.planTitle}>{plan.title.toUpperCase()}</Text>
          {id === "attend" ? <Text style={styles.recommended}>RECOMMENDED</Text> : null}
        </View>
        <View style={styles.priceBlock}>
          <Text style={styles.price}>${price}<Text style={styles.pricePeriod}>/mo</Text></Text>
          <Text style={styles.priceNote}>{billing === "annual" ? `${saving}% off · $${plan.annualTotal}/yr` : "billed monthly"}</Text>
        </View>
      </View>
      <Text style={authStyles.small}>{plan.description}</Text>
      {id === "attend" ? <View style={styles.visitFee}><Text style={styles.visitFeeText}>Pre-approved per-visit fee</Text><Text style={styles.visitFeePrice}>$750</Text></View> : null}
      {[...plan.features, "4-week free trial included"].map((feature) => (
        <View key={feature} style={styles.featureRow}><Check color={selected ? colors.guardianGreen : colors.mist} size={14} /><Text style={styles.featureText}>{feature}</Text></View>
      ))}
    </Pressable>
  );
}

function StepBlock({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <View style={authStyles.stack}>
      <View>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={authStyles.title}>{title.toUpperCase()}</Text>
        <Text style={authStyles.body}>{body}</Text>
      </View>
      {children}
    </View>
  );
}
function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboard,
  secure = false,
}: {
  label: string;
  value: string;
  onChange(value: string): void;
  placeholder: string;
  keyboard?: "phone-pad" | "email-address";
  secure?: boolean;
}) {
  return (
    <View>
      <Label>{label}</Label>
      <Input
        autoCapitalize="none"
        keyboardType={keyboard}
        onChangeText={onChange}
        placeholder={placeholder}
        secureTextEntry={secure}
        value={value}
      />
    </View>
  );
}
function Summary({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </Card>
  );
}
function EditableSummary({ label, value, onEdit }: { label: string; value: string; onEdit(): void }) {
  return (
    <Card>
      <View style={styles.summaryRow}>
        <View style={styles.summaryContent}><Text style={styles.summaryLabel}>{label}</Text><Text style={styles.summaryValue}>{value || "—"}</Text></View>
        <Pressable accessibilityRole="button" onPress={onEdit}><Text style={styles.editText}>EDIT</Text></Pressable>
      </View>
    </Card>
  );
}
function SmallChoice({ label, selected, onPress }: { label: string; selected: boolean; onPress(): void }) {
  return <Pressable onPress={onPress} style={[styles.smallChoice, selected && styles.smallChoiceSelected]}><Text style={[styles.smallChoiceText, selected && styles.smallChoiceTextSelected]}>{label}</Text></Pressable>;
}
function Timeline({ title, items }: { title: string; items: string[] }) {
  return (
    <Card><Text style={styles.timelineTitle}>{title.toUpperCase()}</Text>{items.map((item, index) => <View key={item} style={styles.timelineRow}><View style={styles.timelineNumber}><Text style={styles.timelineNumberText}>{index + 1}</Text></View><Text style={styles.timelineText}>{item}</Text></View>)}</Card>
  );
}
function InfoCard({ title, body, icon: Icon }: { title: string; body: string; icon: typeof Shield }) {
  return <Card><View style={styles.infoRow}><View style={styles.infoIcon}><Icon color={colors.white} size={20} /></View><View style={styles.infoContent}><Text style={styles.cardTitle}>{title.toUpperCase()}</Text><Text style={authStyles.small}>{body}</Text></View></View></Card>;
}
function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <Text accessibilityRole="alert" style={authStyles.error}>
      {children}
    </Text>
  );
}

const entryLabels = {
  "key-safe": "Key safe",
  "spare-key": "Spare key with contact",
  unlocked: "Door left unlocked",
  other: "Other arrangement",
} as const;
const attendancePoints = [
  { icon: MapPin, title: "We come to you", body: "An accredited Legacy Wolf responder travels to your registered address to perform a welfare check in person." },
  { icon: Eye, title: "Knock-only by default", body: "Unless you grant entry access, the responder knocks, calls out, and assesses from the door. No entry without your permission." },
  { icon: DoorOpen, title: "Enter if needed", body: "You can authorise entry—via key safe or spare key—so the responder can reach you if you’re incapacitated inside." },
  { icon: Shield, title: "Emergency services coordination", body: "If the responder finds cause for concern, they contact emergency services on your behalf and stay until help arrives." },
  { icon: PawPrint, title: "Pet-aware", body: "Tell us about animals at the door so the responder is prepared. We note this on every dispatch." },
];
const terms = [
  {
    title: "What Legacy Wolf does",
    body: "We monitor your motion timer and, if you become unresponsive, execute the response plan you configure. We do not provide emergency services.",
  },
  {
    title: "Your data",
    body: "Your personal details, address, and access information are encrypted at rest. Access details are only decrypted when a verified incident triggers your plan.",
  },
  {
    title: "Response limitations",
    body: "Legacy Wolf responders are not emergency services. If life is at risk, call 000.",
  },
  {
    title: "Billing",
    body: "Your four-week free trial begins when you activate your plan. You may cancel before conversion.",
  },
  {
    title: "Privacy",
    body: "We do not sell your data. We share only what is necessary to execute the response you authorized.",
  },
];
const styles = StyleSheet.create({
  progress: { alignSelf: "center", backgroundColor: colors.obsidian, maxWidth: 480, paddingHorizontal: spacing[4], width: "100%" },
  eyebrow: {
    ...typography.label,
    color: colors.mist,
    marginBottom: spacing[2],
    textTransform: "uppercase",
  },
  cardTitle: {
    ...typography.heading,
    color: colors.white,
    marginBottom: spacing[2],
  },
  threshold: {
    alignItems: "center",
    backgroundColor: colors.graphite,
    borderRadius: radii.card,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 84,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    width: "100%",
  },
  hours: { ...typography.displayM, color: colors.white, textAlign: "center" },
  hoursEditor: { alignItems: "center", flex: 1, justifyContent: "center", marginHorizontal: spacing[3], maxWidth: 160, minWidth: 72 },
  hoursInput: { ...typography.displayM, borderWidth: 0, color: colors.white, height: 44, outlineWidth: 0, padding: 0, textAlign: "center", width: "100%" },
  hoursLabel: { ...typography.label, color: colors.mist, textAlign: "center" },
  timerAdjust: { alignItems: "center", borderColor: colors.white, borderRadius: 26, borderWidth: 1, flexShrink: 0, height: 52, justifyContent: "center", width: 52 },
  timerAdjustDisabled: { opacity: 0.35 },
  timerAdjustPressed: { backgroundColor: colors.coal, transform: [{ scale: 0.96 }] },
  timerAdjustText: { ...typography.heading, color: colors.white, lineHeight: 24, textAlign: "center" },
  summaryLabel: {
    ...typography.label,
    color: colors.mist,
    textTransform: "uppercase",
  },
  summaryValue: {
    ...typography.heading,
    color: colors.white,
    marginTop: spacing[1],
  },
  summaryRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  summaryContent: { flex: 1, paddingRight: spacing[3] },
  editText: { ...typography.label, color: colors.guardianGreen },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing[2] },
  smallChoice: { borderColor: colors.coal, borderRadius: radii.pill, borderWidth: 2, paddingHorizontal: spacing[3], paddingVertical: spacing[2] },
  smallChoiceSelected: { backgroundColor: "rgba(189,210,27,0.12)", borderColor: colors.guardianGreen },
  smallChoiceText: { ...typography.bodySmall, color: colors.mist, fontWeight: "700" },
  smallChoiceTextSelected: { color: colors.white },
  timelineTitle: { ...typography.label, borderBottomColor: colors.coal, borderBottomWidth: 1, color: colors.mist, marginBottom: spacing[4], paddingBottom: spacing[3] },
  timelineRow: { alignItems: "flex-start", flexDirection: "row", gap: spacing[3], marginBottom: spacing[3] },
  timelineNumber: { alignItems: "center", backgroundColor: colors.guardianGreen, borderRadius: radii.pill, height: 24, justifyContent: "center", width: 24 },
  timelineNumberText: { ...typography.label, color: colors.obsidian },
  timelineText: { ...typography.bodySmall, color: colors.white, flex: 1 },
  infoRow: { alignItems: "flex-start", flexDirection: "row", gap: spacing[3] },
  infoIcon: { alignItems: "center", backgroundColor: colors.guardianGreen, borderRadius: radii.pill, height: 42, justifyContent: "center", width: 42 },
  infoContent: { flex: 1 },
  petFormHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: spacing[4] },
  removeText: { ...typography.label, color: colors.ember },
  select: { alignItems: "center", backgroundColor: colors.onyx, borderColor: colors.coal, borderRadius: radii.input, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 52, paddingHorizontal: spacing[4] },
  selectText: { ...typography.body, color: colors.white },
  selectPlaceholder: { color: colors.slate },
  selectChevron: { color: colors.mist, fontSize: 22 },
  selectMenu: { backgroundColor: colors.onyx, borderColor: colors.coal, borderRadius: radii.input, borderWidth: 1, marginTop: spacing[1], overflow: "hidden" },
  selectOption: { alignItems: "center", borderBottomColor: colors.coal, borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 44, paddingHorizontal: spacing[4] },
  selectOptionText: { ...typography.body, color: colors.white },
  twoChoices: { flexDirection: "row", gap: spacing[2], marginTop: spacing[2] },
  addPetButton: { alignItems: "center", borderColor: colors.guardianGreen, borderRadius: radii.card, borderStyle: "dashed", borderWidth: 2, flexDirection: "row", gap: spacing[2], justifyContent: "center", minHeight: 56 },
  addPetPlus: { color: colors.guardianGreen, fontSize: 26, lineHeight: 28 },
  addPetText: { ...typography.label, color: colors.guardianGreen },
  notifyCard: { alignItems: "flex-start", backgroundColor: colors.graphite, borderColor: colors.coal, borderRadius: radii.card, borderWidth: 2, flexDirection: "row", gap: spacing[3], padding: spacing[4] },
  notifyCardSelected: { borderColor: colors.guardianGreen },
  notifyIcon: { alignItems: "center", backgroundColor: colors.guardianGreen, borderRadius: radii.pill, flexShrink: 0, height: 44, justifyContent: "center", width: 44 },
  notifyContent: { flex: 1 },
  notifyTitleRow: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: spacing[2], marginBottom: spacing[1] },
  notifyTitle: { ...typography.label, color: colors.white, fontWeight: "900" },
  notifyTag: { ...typography.label, backgroundColor: colors.guardianGreen, borderRadius: radii.pill, color: colors.obsidian, fontSize: 9, overflow: "hidden", paddingHorizontal: spacing[2], paddingVertical: 3 },
  notifyBody: { ...typography.bodySmall, color: colors.mist },
  notifyCheck: { alignItems: "center", backgroundColor: colors.guardianGreen, borderRadius: radii.pill, flexShrink: 0, height: 20, justifyContent: "center", width: 20 },
  petChoiceRow: { flexDirection: "row", gap: spacing[3] },
  petChoice: { alignItems: "center", backgroundColor: colors.graphite, borderColor: colors.coal, borderRadius: radii.input, borderWidth: 1, flex: 1, minHeight: 162, padding: spacing[4] },
  petChoiceSelected: { backgroundColor: colors.onyx, borderColor: colors.guardianGreen, borderWidth: 2 },
  petIconCircle: { alignItems: "center", backgroundColor: colors.guardianGreen, borderRadius: radii.pill, height: 54, justifyContent: "center", marginBottom: spacing[3], width: 54 },
  petChoiceTitle: { ...typography.heading, color: colors.white, fontWeight: "900", textAlign: "center" },
  petChoiceBody: { ...typography.bodySmall, color: colors.mist, marginTop: spacing[1], textAlign: "center" },
  petCheck: { alignItems: "center", backgroundColor: colors.guardianGreen, borderRadius: radii.pill, height: 20, justifyContent: "center", marginTop: spacing[2], width: 20 },
  devCodeLabel: { ...typography.label, color: colors.mist, textAlign: "center" },
  devCode: { ...typography.displayM, color: colors.guardianGreen, marginTop: spacing[2], textAlign: "center" },
  billingToggle: { backgroundColor: colors.graphite, borderColor: colors.coal, borderRadius: radii.pill, borderWidth: 1, flexDirection: "row", padding: spacing[1] },
  billingOption: { alignItems: "center", borderRadius: radii.pill, flex: 1, flexDirection: "row", gap: spacing[2], justifyContent: "center", minHeight: 44, paddingHorizontal: spacing[2] },
  billingOptionSelected: { backgroundColor: colors.guardianGreen },
  billingText: { ...typography.label, color: colors.mist },
  billingTextSelected: { color: colors.obsidian },
  savingsPill: { ...typography.label, backgroundColor: "rgba(0,0,0,0.18)", borderRadius: radii.pill, color: colors.obsidian, fontSize: 9, paddingHorizontal: spacing[2], paddingVertical: spacing[1] },
  planCard: { backgroundColor: colors.graphite, borderColor: colors.coal, borderRadius: radii.card, borderWidth: 2, gap: spacing[3], padding: spacing[4] },
  planCardSelected: { backgroundColor: colors.onyx, borderColor: colors.guardianGreen },
  planHeader: { alignItems: "flex-start", flexDirection: "row", gap: spacing[3] },
  planIcon: { alignItems: "center", backgroundColor: colors.coal, borderRadius: radii.pill, height: 44, justifyContent: "center", width: 44 },
  planIconSelected: { backgroundColor: colors.guardianGreen },
  planHeading: { flex: 1 },
  planTitle: { ...typography.heading, color: colors.white, fontSize: 14 },
  recommended: { ...typography.label, alignSelf: "flex-start", backgroundColor: "rgba(189,210,27,0.15)", borderRadius: radii.pill, color: colors.white, fontSize: 9, marginTop: spacing[1], paddingHorizontal: spacing[2], paddingVertical: spacing[1] },
  priceBlock: { alignItems: "flex-end" },
  price: { ...typography.displayM, color: colors.white, fontSize: 26 },
  pricePeriod: { ...typography.bodySmall, color: colors.mist },
  priceNote: { ...typography.label, color: colors.guardianGreen, fontSize: 9 },
  visitFee: { alignItems: "center", backgroundColor: colors.guardianGreen, borderRadius: radii.input, flexDirection: "row", justifyContent: "space-between", padding: spacing[3] },
  visitFeeText: { ...typography.bodySmall, color: colors.white, fontWeight: "700" },
  visitFeePrice: { ...typography.heading, color: colors.white },
  featureRow: { alignItems: "center", flexDirection: "row", gap: spacing[2] },
  featureText: { ...typography.bodySmall, color: colors.mist },
});
