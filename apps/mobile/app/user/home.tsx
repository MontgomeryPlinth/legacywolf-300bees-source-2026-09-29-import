import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Accelerometer } from "expo-sensors";
import {
  Badge,
  Button,
  Card,
  Input,
  Label,
  Modal,
  Progress,
  Skeleton,
} from "@legacy-wolf/ui";
import { colors, radii, spacing, typography } from "@legacy-wolf/tokens";
import type { MotionTimer, Person, Plan, ResponseQueueStep } from "@legacy-wolf/core";
import { useSession } from "../../src/auth/session";
import {
  enqueueHeartbeat,
  subscribeToHeartbeats,
} from "../../src/motion/heartbeat";
import { AlertTriangle, BatteryFull, BatteryLow, BatteryWarning, Calendar, Check, Clock, Plane, Zap } from "lucide-react-native";

type Dialog = "timer" | "queue" | "emergency" | "trip" | "sick" | "battery" | "drill" | null;
const timerPresets = [4, 6, 8, 12, 16, 24, 48, 72];
const tripTimes = Array.from({ length: 24 }, (_, hour) => ({
  value: `${String(hour).padStart(2, "0")}:00`,
  label: hour === 0 ? "12 AM" : hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12} PM` : `${hour} AM`,
  longLabel: hour === 0 ? "12:00 AM (Midnight)" : hour === 12 ? "12:00 PM (Noon)" : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`,
}));

function tomorrowDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// H1 + T-series + M1/M4 entry states.
export default function HomeStatusScreen() {
  const { account, client } = useSession();
  const [timer, setTimer] = useState<MotionTimer | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [timerHours, setTimerHours] = useState(24);
  const [timerHoursText, setTimerHoursText] = useState("24");
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [graceMinutes, setGraceMinutes] = useState(5);
  const [graceValueText, setGraceValueText] = useState("5");
  const [graceUnit, setGraceUnit] = useState<"minutes" | "hours">("minutes");
  const [tripDate, setTripDate] = useState(tomorrowDate);
  const [tripTime, setTripTime] = useState("12:00");
  const [tripTimeOpen, setTripTimeOpen] = useState(false);
  const [tripError, setTripError] = useState<string | null>(null);
  const [sickDays, setSickDays] = useState("3");
  const [sickInterval, setSickInterval] = useState("4");
  const [severity, setSeverity] = useState(5);
  const [notice, setNotice] = useState<string | null>(null);
  const [queueDraft, setQueueDraft] = useState<ResponseQueueStep[]>([]);
  const [queuePeople, setQueuePeople] = useState<Person[]>([]);
  const [queueSaving, setQueueSaving] = useState(false);
  const [batteryEnabled, setBatteryEnabled] = useState(true);
  const [batteryBehaviour, setBatteryBehaviour] = useState<"suppress" | "respond" | "alert_contact">("suppress");
  const [offlineHoursText, setOfflineHoursText] = useState("48");
  const [sensorAvailable, setSensorAvailable] = useState<boolean | null>(null);
  const [lastMotionSignalAt, setLastMotionSignalAt] = useState<string | null>(null);
  const [testingMotion, setTestingMotion] = useState(false);

  async function load() {
    const [nextTimer, nextPlan] = await Promise.all([
      client.timerApi.get(),
      client.plans.get(),
    ]);
    setTimer(nextTimer);
    setPlan(nextPlan);
    setTimerHours(nextTimer.interval_hours);
    setTimerHoursText(String(nextTimer.interval_hours));
    setTimerEnabled(nextTimer.mode === "active");
    setGraceMinutes(nextTimer.grace_minutes);
    setGraceUnit(nextTimer.grace_minutes % 60 === 0 && nextTimer.grace_minutes >= 60 ? "hours" : "minutes");
    setGraceValueText(String(nextTimer.grace_minutes % 60 === 0 && nextTimer.grace_minutes >= 60 ? nextTimer.grace_minutes / 60 : nextTimer.grace_minutes));
    setBatteryEnabled(nextTimer.battery_rule_enabled); setBatteryBehaviour(nextTimer.battery_behaviour); setOfflineHoursText(String(nextTimer.offline_escalation_hours));
  }
  useEffect(() => {
    if (!account) {
      router.replace("/login");
      return;
    }
    void load();
  }, [account]);
  useEffect(() => {
    let active = true;
    void Accelerometer.isAvailableAsync()
      .then((available) => active && setSensorAvailable(available))
      .catch(() => active && setSensorAvailable(false));
    const unsubscribe = subscribeToHeartbeats((event) => {
      if (event.signalType !== "motion") return;
      setLastMotionSignalAt(event.recordedAt);
      if (event.delivered) void client.timerApi.get().then(setTimer);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [client]);
  useEffect(() => {
    if (!timer) return;
    const update = () =>
      setRemainingMs(
        Math.max(0, new Date(timer.next_expiry_at).getTime() - Date.now()),
      );
    update();
    const handle = setInterval(update, 1_000);
    return () => clearInterval(handle);
  }, [timer]);
  const remaining = useMemo(() => formatDuration(remainingMs), [remainingMs]);
  const modeUntil = timer?.mode_until
    ? formatDuration(
        Math.max(0, new Date(timer.mode_until).getTime() - Date.now()),
      )
    : null;
  const isActive = timer?.mode === "active";
  const graceActive = Boolean(timer && isActive && remainingMs <= 0);

  async function checkIn() {
    setTimer(await client.timerApi.checkIn());
    setNotice("Check-in recorded. Your Motion Timer has been reset.");
    setDialog(null);
  }
  async function testMotionReset() {
    setTestingMotion(true);
    try {
      const delivered = await enqueueHeartbeat("motion");
      const nextTimer = await client.timerApi.get();
      setTimer(nextTimer);
      setLastMotionSignalAt(nextTimer.last_signal_at);
      setNotice(
        delivered
          ? "Test movement accepted. The server reset your Motion Timer."
          : "Test movement was queued and will be delivered when the API is reachable.",
      );
    } catch (reason) {
      setNotice(
        reason instanceof Error
          ? `Motion test failed: ${reason.message}`
          : "Motion test failed.",
      );
    } finally {
      setTestingMotion(false);
    }
  }
  async function openQueue() {
    const [steps, people] = await Promise.all([client.responseQueue.list(), client.peopleApi.list()]);
    setQueueDraft(steps); setQueuePeople(people); setDialog("queue");
  }
  function addQueueStep() {
    setQueueDraft((current) => [...current, { id: `draft-${Date.now()}`, plan_id: plan?.id ?? "", position: current.length + 1, channel: "sms", target_person: null, wait_minutes: 5, message_template: null }]);
  }
  function patchQueueStep(id: string, patch: Partial<ResponseQueueStep>) { setQueueDraft((current) => current.map((step) => step.id === id ? { ...step, ...patch } : step)); }
  function removeQueueStep(id: string) { setQueueDraft((current) => current.filter((step) => step.id !== id).map((step, index) => ({ ...step, position: index + 1 }))); }
  function moveQueueStep(index: number, direction: -1 | 1) { setQueueDraft((current) => { const next = [...current]; const target = index + direction; const selected = next[index]; const adjacent = next[target]; if (!selected || !adjacent) return current; next[index] = adjacent; next[target] = selected; return next.map((step, position) => ({ ...step, position: position + 1 })); }); }
  async function saveQueue() {
    if (!queueDraft.length) return;
    setQueueSaving(true);
    try {
      const saved = await client.responseQueue.replace(queueDraft.map(({ id: _id, ...step }) => step));
      setQueueDraft(saved); setDialog(null); setNotice("Response Queue saved. Your authorized escalation order is active.");
    } finally { setQueueSaving(false); }
  }
  async function saveBatteryRule() {
    const hours = Math.min(168, Math.max(4, Math.round(Number(offlineHoursText) || 48)));
    const saved = await client.timerApi.updateBatteryRule({ enabled: batteryEnabled, behaviour: batteryBehaviour, offlineEscalationHours: hours });
    setTimer(saved); setOfflineHoursText(String(hours)); setDialog(null); setNotice("Battery Rule updated.");
  }
  async function saveTimer() {
    const nextHours = Math.min(72, Math.max(4, Math.round(Number(timerHoursText) || timerHours)));
    const rawGrace = Math.round(Number(graceValueText) || (graceUnit === "hours" ? graceMinutes / 60 : graceMinutes));
    const nextGrace = Math.min(240, Math.max(1, graceUnit === "hours" ? rawGrace * 60 : rawGrace));
    setTimerHours(nextHours);
    setTimerHoursText(String(nextHours));
    setGraceMinutes(nextGrace);
    let saved = await client.timerApi.update({
      interval_hours: nextHours,
      grace_minutes: nextGrace,
    });
    const shouldChangeMode = timerEnabled !== (saved.mode === "active");
    if (shouldChangeMode) {
      saved = await client.timerApi.setMode(timerEnabled ? "active" : "paused", {
        interval_hours: nextHours,
        reason: timerEnabled
          ? "Motion Timer activated from timer settings"
          : "Motion Timer deactivated from timer settings",
      });
      setPlan(await client.plans.get());
    }
    setTimer(saved);
    setDialog(null);
    setNotice(
      `Motion Timer ${timerEnabled ? "activated" : "paused"} at ${nextHours} hours with a ${nextGrace >= 60 ? `${nextGrace / 60}-hour` : `${nextGrace}-minute`} grace window.`,
    );
  }
  async function setMode(
    mode: MotionTimer["mode"],
    until?: Date,
    interval?: number,
    reason?: string,
  ) {
    const saved = await client.timerApi.setMode(mode, {
      until: until?.toISOString(),
      interval_hours: interval,
      reason,
    });
    setTimer(saved);
    setTimerEnabled(saved.mode === "active");
    setPlan(await client.plans.get());
    setDialog(null);
  }
  async function startTrip() {
    const until = new Date(`${tripDate}T${tripTime}:00`);
    if (Number.isNaN(until.getTime()) || until.getTime() <= Date.now()) {
      setTripError("Please select a future date and time.");
      return;
    }
    setTripError(null);
    await setMode(
      "trip",
      until,
      undefined,
      "Trip Mode authorized by user",
    );
  }
  async function startSick() {
    const days = Number(sickDays);
    const interval = Number(sickInterval);
    if (severity >= 9) {
      setDialog("emergency");
      return;
    }
    if (!Number.isFinite(days) || !Number.isFinite(interval)) return;
    await setMode(
      "sick",
      new Date(Date.now() + days * 86_400_000),
      interval,
      `Sick Mode severity ${severity}`,
    );
  }
  async function resume() {
    await setMode("active");
    setTimer(await client.timerApi.checkIn());
    setPlan(await client.plans.get());
  }

  if (!timer || !plan)
    return (
      <View style={styles.loading}>
        <Skeleton height={24} width="35%" />
        <Skeleton height={230} />
        <Skeleton height={140} />
      </View>
    );
  if (graceActive)
    return (
      <GraceWindow
        minutes={timer.grace_minutes}
        onHelp={() => setDialog("emergency")}
        onSafe={checkIn}
      />
    );

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.wordmark}>LEGACY WOLF</Text>
        <Badge critical={plan.status === "alert_active"}>
          {isActive ? "Protected" : timer.mode}
        </Badge>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {notice ? (
          <Pressable onPress={() => setNotice(null)}>
            <Card style={styles.notice}>
              <Text style={styles.noticeText}>{notice}</Text>
            </Card>
          </Pressable>
        ) : null}
        <Pressable onPress={() => { setTimerEnabled(timer?.mode === "active"); setDialog("timer"); }}>
          <Card style={styles.timerCard}>
            <Text style={styles.eyebrow}>
              {isActive ? "MOTION TIMER" : "STATUS"}
            </Text>
            <Text style={[styles.timer, !isActive && styles.paused]}>
              {isActive ? remaining : "PAUSED"}
            </Text>
            <Text style={styles.caption}>
              {isActive
                ? `Next expiry: ${new Date(timer.next_expiry_at).toLocaleString()}`
                : `${timer.mode.toUpperCase()} MODE${modeUntil ? ` · resumes in ${modeUntil}` : ""}`}
            </Text>
            {isActive ? (
              <Text style={styles.editHint}>Tap to edit timer</Text>
            ) : null}
          </Card>
        </Pressable>
        <Card>
          <View style={styles.row}>
            <Text style={styles.cardTitle}>MOTION SENSOR</Text>
            <Badge>
              {sensorAvailable === null
                ? "Checking"
                : sensorAvailable
                  ? "Listening"
                  : "Unavailable"}
            </Badge>
          </View>
          <Text style={styles.body}>
            {sensorAvailable
              ? "Accelerometer monitoring is active while iOS is delivering motion samples."
              : "The iOS Simulator has no accelerometer. Use the development test below for the signed heartbeat path, and a physical iPhone for the hardware sensor."}
          </Text>
          <Text style={styles.sensorTimestamp}>
            Last server signal: {new Date(timer.last_signal_at).toLocaleString()}
          </Text>
          {lastMotionSignalAt ? (
            <Text style={styles.sensorTimestamp}>
              Last motion event in this session: {new Date(lastMotionSignalAt).toLocaleString()}
            </Text>
          ) : null}
          {__DEV__ ? (
            <Button loading={testingMotion} onPress={testMotionReset} variant="secondary">
              Test movement reset
            </Button>
          ) : null}
        </Card>
        {!isActive ? (
          <Button onPress={resume}>Resume protection</Button>
        ) : timer.monitoring_strategy === "check_in" ? (
          <Button onPress={checkIn}>I’m OK — check in</Button>
        ) : null}
        <Card>
          <View style={styles.row}>
            <View>
              <Text style={styles.cardTitle}>ACTIVE INSTRUCTION</Text>
              <Text style={styles.body}>{tierLabel(plan.tier)}</Text>
            </View>
            <Badge>{plan.status}</Badge>
          </View>
          <View style={styles.divider} />
          <Action
            title="Response Queue"
            body="You instruct us to execute each authorized step in order."
            onPress={() => void openQueue()}
          />
          <Action
            title="Battery behaviour"
            body="Choose how a quiet device changes the response."
            onPress={() => setDialog("battery")}
          />
          <Action title="Nominated people" body="Contacts authorized in your response." onPress={() => router.push("/user/people")} />
          <Action title="Pet Guardian" body="Pet profiles, guardians, medical care, and routines." onPress={() => router.push("/user/pets")} />
          <Action title="Property access" body="Address and encrypted responder entry instructions." onPress={() => router.push("/user/property")} />
          <Action title="Wishes" body="Private handoff letters, voice notes, and recipients." onPress={() => router.push("/user/wishes")} />
        </Card>
        <View>
          <Text style={styles.section}>QUICK ACTIONS</Text>
          <View style={styles.grid}>
            <Quick title="TRIP MODE" onPress={() => setDialog("trip")} />
            <Quick title="SICK MODE" onPress={() => setDialog("sick")} />
            <Quick
              title="PAUSE"
              onPress={() =>
                void setMode("paused", undefined, undefined, "Paused by user")
              }
            />
            <Quick
              critical
              title="I NEED HELP"
              onPress={() => setDialog("emergency")}
            />
            <Quick title="TEST MY PLAN" onPress={() => setDialog("drill")} />
          </View>
        </View>
        <Card>
          <Text style={styles.cardTitle}>PLAN READINESS</Text>
          <Progress value={plan.health_score} />
          <Text style={styles.body}>
            {plan.health_score}% complete. People with a Response Queue,
            property access, pets, and wishes each contribute 25%.
          </Text>
        </Card>
      </ScrollView>

      <Modal
        onClose={() => setDialog(null)}
        open={dialog === "queue"}
        title="Response Queue"
      >
        <View style={styles.modalStack}>
          <Text style={styles.body}>Steps run in order. If one gets a response, escalation stops.</Text>
          {queueDraft.map((step, index) => <Card key={step.id}>
            <View style={styles.queueHeader}><View style={styles.position}><Text style={styles.positionText}>{index + 1}</Text></View><Text style={styles.queueTitle}>{queueStepLabel(step, queuePeople)}</Text><Pressable onPress={() => removeQueueStep(step.id)}><Text style={styles.removeQueue}>REMOVE</Text></Pressable></View>
            <Label>Action</Label><View style={styles.wrap}>{(["sms", "call", "notify_contact", "dispatch"] as const).map((channel) => <Chip key={channel} label={queueChannelLabel(channel)} selected={step.channel === channel} onPress={() => patchQueueStep(step.id, { channel, target_person: channel === "notify_contact" ? step.target_person : null })} />)}</View>
            {step.channel === "notify_contact" ? <><Label>Contact</Label><View style={styles.wrap}>{queuePeople.map((person) => <Chip key={person.id} label={person.name} selected={step.target_person === person.id} onPress={() => patchQueueStep(step.id, { target_person: person.id })} />)}</View></> : null}
            {step.channel !== "dispatch" ? <><Label>If no response, wait minutes</Label><Input keyboardType="number-pad" onChangeText={(value) => patchQueueStep(step.id, { wait_minutes: Math.max(0, Math.min(240, Number(value) || 0)) })} value={String(step.wait_minutes)} /></> : <Text style={styles.body}>A responder is offered the incident under your attendance instructions.</Text>}
            <View style={styles.queueControls}><Button disabled={index === 0} onPress={() => moveQueueStep(index, -1)} variant="ghost">↑</Button><Button disabled={index === queueDraft.length - 1} onPress={() => moveQueueStep(index, 1)} variant="ghost">↓</Button></View>
          </Card>)}
          <Button disabled={queueDraft.length >= 10} onPress={addQueueStep} variant="secondary">＋ Add a step</Button>
          <Button disabled={!queueDraft.length || queueDraft.some((step) => step.channel === "notify_contact" && !step.target_person)} loading={queueSaving} onPress={saveQueue}>Save queue</Button>
        </View>
      </Modal>
      <Modal
        onClose={() => setDialog(null)}
        open={dialog === "timer"}
        title="Edit Motion Timer"
      >
        <View style={styles.modalStack}>
          <Text style={styles.body}>
            Set how long Legacy Wolf waits without a signal before beginning
            your authorized response.
          </Text>
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: timerEnabled }}
            onPress={() => setTimerEnabled((value) => !value)}
            style={[styles.timerStatusCard, timerEnabled && styles.timerStatusCardActive]}
          >
            <View style={styles.timerStatusCopy}>
              <Text style={styles.actionTitle}>Motion Timer {timerEnabled ? "Active" : "Inactive"}</Text>
              <Text style={styles.actionBody}>{timerEnabled ? "Protection is monitoring for activity." : "The timer is paused and will not expire."}</Text>
            </View>
            <View style={[styles.switchTrack, timerEnabled && styles.switchTrackOn]}><View style={[styles.switchThumb, timerEnabled && styles.switchThumbOn]} /></View>
          </Pressable>
          <View style={styles.timerEditor}>
            <CircleAdjust label="−" onPress={() => { const value = Math.max(4, timerHours - 1); setTimerHours(value); setTimerHoursText(String(value)); }} />
            <View style={styles.largeValue}><Input keyboardType="number-pad" onChangeText={(value) => { if (/^\d{0,2}$/.test(value)) { setTimerHoursText(value); const parsed = Number(value); if (parsed >= 4 && parsed <= 72) setTimerHours(parsed); } }} value={timerHoursText} /><Text style={styles.valueUnit}>HOURS</Text></View>
            <CircleAdjust label="+" onPress={() => { const value = Math.min(72, timerHours + 1); setTimerHours(value); setTimerHoursText(String(value)); }} />
          </View>
          <View style={styles.wrap}>
            {timerPresets.map((hours) => (
              <Chip
                key={hours}
                label={`${hours}h`}
                selected={timerHours === hours}
                onPress={() => { setTimerHours(hours); setTimerHoursText(String(hours)); }}
              />
            ))}
          </View>
          <Label>Grace window</Label>
          <View style={styles.unitToggle}><Chip label="Minutes" selected={graceUnit === "minutes"} onPress={() => { setGraceUnit("minutes"); setGraceValueText(String(graceMinutes)); }} /><Chip label="Hours" selected={graceUnit === "hours"} onPress={() => { setGraceUnit("hours"); setGraceValueText(String(Math.max(1, Math.round(graceMinutes / 60)))); }} /></View>
          <View style={styles.graceInput}><Input keyboardType="number-pad" onChangeText={(value) => /^\d{0,3}$/.test(value) && setGraceValueText(value)} value={graceValueText} /><Text style={styles.graceHint}>{graceUnit === "hours" ? "Maximum 4 hours" : "Maximum 240 minutes"}</Text></View>
          <View style={styles.wrap}>
            {(graceUnit === "hours" ? [1, 2, 3, 4] : [1, 5, 10, 15, 30, 60]).map((value) => (
              <Chip
                key={value}
                label={`${value}${graceUnit === "hours" ? "h" : "m"}`}
                selected={graceValueText === String(value)}
                onPress={() => { setGraceValueText(String(value)); setGraceMinutes(graceUnit === "hours" ? value * 60 : value); }}
              />
            ))}
          </View>
          <Button onPress={saveTimer}>Save timer</Button>
        </View>
      </Modal>
      <Modal
        onClose={() => setDialog(null)}
        open={dialog === "emergency"}
        title="Are you OK?"
      >
        <View style={styles.modalStack}>
          <Text style={styles.body}>
            If you’re safe, check in now. If you need help, we’ll begin the
            response you authorized.
          </Text>
          <Button onPress={checkIn}>I’m OK — check in</Button>
          <Button
            onPress={() => {
              setDialog(null);
              setNotice("Help requested. Your authorized response has begun.");
            }}
            variant="critical"
          >
            I need help
          </Button>
        </View>
      </Modal>
      <Modal onClose={() => setDialog(null)} open={dialog === "drill"} title="Test My Plan">
        <View style={styles.modalStack}><Text style={styles.cardTitle}>A safe walkthrough of your response</Text><Text style={styles.body}>The drill shows the “Are you OK?” confirmation and your Response Queue in order. It does not dispatch a responder, call emergency services, or contact nominated people.</Text><Card><Text style={styles.section}>WHAT YOU WILL SEE</Text><Text style={styles.body}>1. A simulated timer alert{`\n`}2. Your confirmation choices{`\n`}3. A preview of each authorized escalation step{`\n`}4. A completion summary in History</Text></Card><Button onPress={async () => { await setMode("drill", new Date(Date.now() + 15 * 60_000), undefined, "User started a safe plan drill"); setNotice("Plan drill started. External calls, texts, dispatch, and emergency services remain disabled."); }}>Start safe demo</Button><Button onPress={() => setDialog(null)} variant="secondary">Cancel</Button></View>
      </Modal>
      <Modal
        onClose={() => setDialog(null)}
        open={dialog === "trip"}
        title=""
      >
        <View style={styles.tripModal}>
          <View style={styles.tripHero}><View style={styles.tripIcon}><Plane color={colors.guardianGreen} size={32} /></View><Text style={styles.tripTitle}>Enable Trip Mode</Text><Text style={styles.tripDescription}>Your motion timer will be paused until you return. Choose when you’d like Wolf Watch to resume monitoring.</Text></View>
          <View style={styles.tripField}><View style={styles.tripLabel}><Calendar color={colors.mist} size={16} /><Label>RETURN DATE</Label></View><Input autoCapitalize="none" onChangeText={setTripDate} placeholder="YYYY-MM-DD" value={tripDate} /></View>
          <View style={styles.tripField}><View style={styles.tripLabel}><Clock color={colors.mist} size={16} /><Label>RETURN TIME</Label></View><Pressable accessibilityRole="button" onPress={() => setTripTimeOpen((value) => !value)} style={styles.tripSelect}><Text style={styles.tripSelectText}>{tripTimes.find((option) => option.value === tripTime)?.longLabel}</Text><Text style={styles.tripChevron}>{tripTimeOpen ? "⌃" : "⌄"}</Text></Pressable>{tripTimeOpen ? <ScrollView nestedScrollEnabled style={styles.tripMenu}>{tripTimes.map((option) => <Pressable key={option.value} onPress={() => { setTripTime(option.value); setTripTimeOpen(false); }} style={[styles.tripOption, tripTime === option.value && styles.tripOptionSelected]}><Text style={[styles.tripOptionText, tripTime === option.value && styles.tripOptionTextSelected]}>{option.longLabel}</Text></Pressable>)}</ScrollView> : null}</View>
          {tripError ? <Text style={styles.criticalText}>{tripError}</Text> : null}
          <View style={styles.tripNotice}><Text style={styles.tripNoticeTitle}>Your protection pauses now</Text><Text style={styles.tripNoticeBody}>Wolf Watch will auto-resume at the time you select</Text></View>
          <View style={styles.modalActions}><View style={styles.tripAction}><Button onPress={() => setDialog(null)} variant="secondary">Cancel</Button></View><View style={styles.tripAction}><Button onPress={startTrip}>Activate</Button></View></View>
        </View>
      </Modal>
      <Modal
        onClose={() => setDialog(null)}
        open={dialog === "sick"}
        title="Sick Mode"
      >
        <View style={styles.modalStack}>
          <Text style={styles.body}>
            For when you’re unwell at home. We check in more often while your
            active instruction stays the same.
          </Text>
          <Label>How unwell? {severity}/10</Label>
          <View style={styles.wrap}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
              <Chip
                critical={value >= 9}
                key={value}
                label={String(value)}
                selected={severity === value}
                onPress={() => setSeverity(value)}
              />
            ))}
          </View>
          {severity >= 9 ? (
            <Text style={styles.criticalText}>
              Severity 9–10 begins the urgent three-minute confirmation path.
            </Text>
          ) : (
            <>
              <Label>Days</Label>
              <Input
                keyboardType="number-pad"
                onChangeText={setSickDays}
                value={sickDays}
              />
              <Label>Check in every hours</Label>
              <Input
                keyboardType="number-pad"
                onChangeText={setSickInterval}
                value={sickInterval}
              />
            </>
          )}
          <Button
            onPress={startSick}
            variant={severity >= 9 ? "critical" : "primary"}
          >
            {severity >= 9 ? "Begin urgent confirmation" : "Start Sick Mode"}
          </Button>
        </View>
      </Modal>
      <Modal
        onClose={() => setDialog(null)}
        open={dialog === "battery"}
        title="Battery Rule"
      >
        <View style={styles.modalStack}>
          <View style={styles.batteryHeading}><BatteryLow color={colors.guardianGreen} size={24} /><Text style={styles.body}>Tell us what to do if your phone goes offline unexpectedly. This protects you from false responses caused by a dead battery.</Text></View>
          <Pressable onPress={() => setBatteryEnabled((value) => !value)} style={[styles.batteryToggleCard, batteryEnabled && styles.batteryToggleActive]}><View><Text style={styles.actionTitle}>Battery Rule Active</Text><Text style={styles.actionBody}>{batteryEnabled ? "On — battery events are monitored" : "Off — no battery behaviour is applied"}</Text></View><View style={[styles.switchTrack, batteryEnabled && styles.switchTrackOn]}><View style={[styles.switchThumb, batteryEnabled && styles.switchThumbOn]} /></View></Pressable>
          {!batteryEnabled ? <View style={styles.offlineWarning}><AlertTriangle color={colors.guardianGreen} size={18} /><Text style={styles.offlineWarningText}>If your device stays offline for <Text style={styles.strong}>{offlineHoursText || "48"} hours</Text> without reconnecting, we’ll automatically escalate and activate your protection plan—regardless of this setting.</Text></View> : null}
          <Label>Offline safety deadline — hours</Label>
          <View style={styles.offlineEditor}><CircleAdjust label="−" onPress={() => setOfflineHoursText(String(Math.max(4, (Number(offlineHoursText) || 48) - 1)))} /><View style={styles.offlineInput}><Input keyboardType="number-pad" onChangeText={(value) => /^\d{0,3}$/.test(value) && setOfflineHoursText(value)} value={offlineHoursText} /></View><CircleAdjust label="+" onPress={() => setOfflineHoursText(String(Math.min(168, (Number(offlineHoursText) || 48) + 1)))} /></View>
          <Text style={styles.actionBody}>Adjustable from 4 hours to 7 days. Default: 48 hours.</Text>
          {batteryEnabled ? <><Text style={styles.section}>WHEN MY DEVICE GOES OFFLINE…</Text><BatteryChoice body="Your timer pauses. When the device reconnects, it resumes. The offline safety deadline still applies." icon={BatteryFull} onPress={() => setBatteryBehaviour("suppress")} selected={batteryBehaviour === "suppress"} tag="Recommended" title="Pause Timer" /><BatteryChoice body="Treat the offline device like a missed activity signal and follow your authorized Response Queue." icon={Zap} onPress={() => setBatteryBehaviour("respond")} selected={batteryBehaviour === "respond"} title="Still Respond" /><BatteryChoice body="Notify your nominated contact first. No responder is dispatched until the offline safety deadline is reached." icon={BatteryWarning} onPress={() => setBatteryBehaviour("alert_contact")} selected={batteryBehaviour === "alert_contact"} title="Alert Contact Only" /></> : null}
          <View style={styles.modalActions}><Button onPress={() => setDialog(null)} variant="secondary">Cancel</Button><Button onPress={saveBatteryRule}>Save Rule</Button></View>
        </View>
      </Modal>
    </View>
  );
}

function GraceWindow({
  minutes,
  onSafe,
  onHelp,
}: {
  minutes: number;
  onSafe(): void;
  onHelp(): void;
}) {
  const [seconds, setSeconds] = useState(minutes * 60);
  useEffect(() => {
    const handle = setInterval(
      () => setSeconds((value) => Math.max(0, value - 1)),
      1_000,
    );
    return () => clearInterval(handle);
  }, []);
  return (
    <View style={styles.grace}>
      <Badge critical>Grace window</Badge>
      <Text style={styles.graceTitle}>ARE YOU OK?</Text>
      <Text style={styles.graceTimer}>{formatDuration(seconds * 1_000)}</Text>
      <Text style={styles.graceBody}>
        Your Motion Timer expired. Check in now or Legacy Wolf will begin the
        response you authorized.
      </Text>
      <Button onPress={onSafe}>I’m OK</Button>
      <Button onPress={onHelp} variant="critical">
        I need help
      </Button>
    </View>
  );
}
function Action({
  title,
  body,
  onPress,
}: {
  title: string;
  body: string;
  onPress(): void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.action}>
      <View style={styles.actionText}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionBody}>{body}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}
function Quick({
  title,
  onPress,
  critical = false,
}: {
  title: string;
  onPress(): void;
  critical?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.quick, critical && styles.quickCritical]}
    >
      <Text style={[styles.quickText, critical && styles.quickCriticalText]}>
        {title}
      </Text>
    </Pressable>
  );
}
function Chip({
  label,
  selected,
  onPress,
  critical = false,
}: {
  label: string;
  selected: boolean;
  onPress(): void;
  critical?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        selected && (critical ? styles.chipCritical : styles.chipSelected),
      ]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}
function CircleAdjust({ label, onPress }: { label: string; onPress(): void }) {
  return <Pressable accessibilityRole="button" hitSlop={8} onPress={onPress} style={styles.circleAdjust}><Text style={styles.circleAdjustText}>{label}</Text></Pressable>;
}
function BatteryChoice({ title, body, tag, icon: Icon, selected, onPress }: { title: string; body: string; tag?: string; icon: typeof BatteryFull; selected: boolean; onPress(): void }) {
  return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={onPress} style={[styles.batteryChoice, selected && styles.batteryChoiceSelected]}><View style={[styles.batteryIcon, selected && styles.batteryIconSelected]}><Icon color={selected ? colors.guardianGreen : colors.mist} size={24} /></View><View style={styles.actionText}><View style={styles.batteryTitleRow}><Text style={styles.actionTitle}>{title}</Text>{tag ? <Badge>{tag}</Badge> : null}{selected ? <Check color={colors.guardianGreen} size={18} /> : null}</View><Text style={styles.actionBody}>{body}</Text></View></Pressable>;
}
function ChoiceRow({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionBody}>{body}</Text>
    </Card>
  );
}
function formatDuration(ms: number) {
  const total = Math.floor(ms / 1_000);
  const hours = Math.floor(total / 3_600);
  const minutes = Math.floor((total % 3_600) / 60);
  const seconds = total % 60;
  return hours > 0
    ? `${hours}h ${minutes}m`
    : `${minutes}:${String(seconds).padStart(2, "0")}`;
}
function tierLabel(tier: Plan["tier"]) {
  return {
    friend_alert: "Friend Alert",
    attend_check: "Attend & Check",
    attend_check_pet: "Attend & Check + Pet Guardian",
    full: "Full response plan",
  }[tier];
}
function queueChannelLabel(channel: ResponseQueueStep["channel"]) {
  return { push: "App alert", sms: "Text me", call: "Call me", notify_contact: "Notify contact", dispatch: "Attend my address" }[channel];
}
function queueStepLabel(step: ResponseQueueStep, people: Person[]) {
  if (step.channel === "notify_contact") return `Text ${people.find((person) => person.id === step.target_person)?.name ?? "contact"}`;
  return queueChannelLabel(step.channel);
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.obsidian, flex: 1 },
  loading: {
    backgroundColor: colors.obsidian,
    flex: 1,
    gap: spacing[4],
    padding: spacing[6],
  },
  header: {
    alignItems: "center",
    borderBottomColor: colors.coal,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing[4],
  },
  wordmark: { ...typography.label, color: colors.white },
  content: {
    alignSelf: "center",
    gap: spacing[4],
    maxWidth: 640,
    padding: spacing[4],
    paddingBottom: spacing[16],
    width: "100%",
  },
  notice: { borderColor: colors.guardianGreen, padding: spacing[3] },
  noticeText: { ...typography.bodySmall, color: colors.white },
  sensorTimestamp: {
    ...typography.bodySmall,
    color: colors.white,
    marginVertical: spacing[2],
  },
  timerCard: { alignItems: "center", paddingVertical: spacing[8] },
  eyebrow: { ...typography.label, color: colors.mist },
  timer: {
    ...typography.displayL,
    color: colors.guardianGreen,
    fontVariant: ["tabular-nums"],
    marginVertical: spacing[2],
  },
  paused: { color: colors.mist },
  caption: { ...typography.bodySmall, color: colors.mist, textAlign: "center" },
  editHint: { ...typography.label, color: colors.slate, marginTop: spacing[3] },
  cardTitle: { ...typography.label, color: colors.white },
  body: { ...typography.bodySmall, color: colors.mist, marginTop: spacing[2] },
  timerEditor: { alignItems: "center", backgroundColor: colors.onyx, borderRadius: radii.card, flexDirection: "row", justifyContent: "space-between", padding: spacing[3] },
  timerStatusCard: { alignItems: "center", backgroundColor: colors.graphite, borderColor: colors.coal, borderRadius: radii.card, borderWidth: 2, flexDirection: "row", gap: spacing[3], justifyContent: "space-between", padding: spacing[4] },
  timerStatusCardActive: { borderColor: colors.guardianGreen },
  timerStatusCopy: { flex: 1 },
  largeValue: { alignItems: "center", flex: 1, marginHorizontal: spacing[3], maxWidth: 150 },
  valueUnit: { ...typography.label, color: colors.mist, marginTop: spacing[1] },
  circleAdjust: { alignItems: "center", borderColor: colors.white, borderRadius: radii.pill, borderWidth: 1, height: 48, justifyContent: "center", width: 48 },
  circleAdjustText: { ...typography.heading, color: colors.white, textAlign: "center" },
  unitToggle: { flexDirection: "row", gap: spacing[2] },
  graceInput: { gap: spacing[1] },
  graceHint: { ...typography.bodySmall, color: colors.slate },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  divider: {
    backgroundColor: colors.coal,
    height: 1,
    marginVertical: spacing[3],
  },
  action: {
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: spacing[3],
  },
  actionText: { flex: 1 },
  actionTitle: { ...typography.body, color: colors.white, fontWeight: "600" },
  actionBody: { ...typography.bodySmall, color: colors.mist },
  chevron: { color: colors.mist, fontSize: 28 },
  section: {
    ...typography.label,
    color: colors.mist,
    marginBottom: spacing[2],
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing[2] },
  quick: {
    alignItems: "center",
    backgroundColor: colors.graphite,
    borderColor: colors.coal,
    borderRadius: radii.input,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 64,
    padding: spacing[3],
    width: "48%",
  },
  quickCritical: { borderColor: colors.ember },
  quickText: { ...typography.label, color: colors.white },
  quickCriticalText: { color: colors.ember },
  modalStack: { gap: spacing[4] },
  tripModal: { gap: spacing[6], paddingTop: spacing[2] },
  tripHero: { alignItems: "center", gap: spacing[3] },
  tripIcon: { alignItems: "center", backgroundColor: "rgba(181,196,44,0.12)", borderRadius: radii.pill, height: 64, justifyContent: "center", width: 64 },
  tripTitle: { ...typography.displayM, color: colors.white, fontSize: 24, lineHeight: 30, textAlign: "center" },
  tripDescription: { ...typography.bodySmall, color: colors.mist, textAlign: "center" },
  tripField: { gap: spacing[2] },
  tripLabel: { alignItems: "center", flexDirection: "row", gap: spacing[2] },
  tripSelect: { alignItems: "center", backgroundColor: colors.graphite, borderColor: colors.coal, borderRadius: radii.input, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 48, paddingHorizontal: spacing[4] },
  tripSelectText: { ...typography.body, color: colors.white },
  tripChevron: { color: colors.mist, fontSize: 20 },
  tripMenu: { backgroundColor: colors.graphite, borderColor: colors.coal, borderRadius: radii.input, borderWidth: 1, maxHeight: 210 },
  tripOption: { borderBottomColor: colors.coal, borderBottomWidth: 1, paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
  tripOptionSelected: { backgroundColor: "rgba(181,196,44,0.12)" },
  tripOptionText: { ...typography.bodySmall, color: colors.mist },
  tripOptionTextSelected: { color: colors.guardianGreen, fontWeight: "700" },
  tripAction: { flex: 1 },
  tripNotice: { alignItems: "center", backgroundColor: "rgba(181,196,44,0.10)", borderColor: colors.guardianGreen, borderRadius: radii.input, borderWidth: 1, padding: spacing[4] },
  tripNoticeTitle: { ...typography.bodySmall, color: colors.white, fontWeight: "700", textAlign: "center" },
  tripNoticeBody: { ...typography.bodySmall, color: colors.mist, textAlign: "center" },
  queueHeader: { alignItems: "center", flexDirection: "row", gap: spacing[3], marginBottom: spacing[3] },
  queueTitle: { ...typography.heading, color: colors.white, flex: 1 },
  removeQueue: { ...typography.label, color: colors.mist, fontSize: 9 },
  queueControls: { flexDirection: "row", justifyContent: "flex-end", marginTop: spacing[2] },
  position: { alignItems: "center", backgroundColor: colors.guardianGreen, borderRadius: radii.pill, height: 26, justifyContent: "center", width: 26 },
  positionText: { ...typography.label, color: colors.obsidian },
  batteryHeading: { alignItems: "flex-start", flexDirection: "row", gap: spacing[3] },
  batteryToggleCard: { alignItems: "center", backgroundColor: colors.graphite, borderColor: colors.coal, borderRadius: radii.card, borderWidth: 2, flexDirection: "row", justifyContent: "space-between", padding: spacing[4] },
  batteryToggleActive: { borderColor: colors.guardianGreen },
  switchTrack: { backgroundColor: colors.coal, borderRadius: radii.pill, height: 26, padding: 4, width: 50 },
  switchTrackOn: { backgroundColor: colors.guardianGreen },
  switchThumb: { backgroundColor: colors.white, borderRadius: radii.pill, height: 18, width: 18 },
  switchThumbOn: { alignSelf: "flex-end" },
  offlineWarning: { alignItems: "flex-start", backgroundColor: colors.graphite, borderColor: colors.coal, borderRadius: radii.card, borderWidth: 1, flexDirection: "row", gap: spacing[3], padding: spacing[4] },
  offlineWarningText: { ...typography.bodySmall, color: colors.mist, flex: 1 },
  strong: { color: colors.white, fontWeight: "700" },
  offlineEditor: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  offlineInput: { flex: 1, marginHorizontal: spacing[3] },
  batteryChoice: { alignItems: "flex-start", backgroundColor: colors.graphite, borderColor: colors.coal, borderRadius: radii.card, borderWidth: 2, flexDirection: "row", gap: spacing[3], padding: spacing[4] },
  batteryChoiceSelected: { borderColor: colors.guardianGreen },
  batteryIcon: { alignItems: "center", backgroundColor: colors.onyx, borderRadius: radii.pill, height: 48, justifyContent: "center", width: 48 },
  batteryIconSelected: { backgroundColor: "rgba(181,196,44,0.12)" },
  batteryTitleRow: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: spacing[2], justifyContent: "space-between" },
  modalActions: { flexDirection: "row", gap: spacing[3] },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing[2] },
  chip: {
    borderColor: colors.coal,
    borderRadius: radii.pill,
    borderWidth: 1,
    minWidth: 48,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  chipSelected: {
    backgroundColor: colors.guardianGreen,
    borderColor: colors.guardianGreen,
  },
  chipCritical: { backgroundColor: colors.ember, borderColor: colors.ember },
  chipText: { ...typography.label, color: colors.mist, textAlign: "center" },
  chipTextSelected: { color: colors.obsidian },
  criticalText: { ...typography.bodySmall, color: colors.ember },
  grace: {
    alignItems: "center",
    backgroundColor: colors.obsidian,
    flex: 1,
    gap: spacing[4],
    justifyContent: "center",
    padding: spacing[6],
  },
  graceTitle: { ...typography.displayM, color: colors.white },
  graceTimer: {
    ...typography.displayL,
    color: colors.ember,
    fontVariant: ["tabular-nums"],
  },
  graceBody: {
    ...typography.body,
    color: colors.mist,
    maxWidth: 480,
    textAlign: "center",
  },
});
