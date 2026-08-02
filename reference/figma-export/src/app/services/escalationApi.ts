// Twilio escalation stubs — replace TODO comments with real fetch() calls when backend is wired.

// POST /api/escalation/sms
// Body: { to, userId, stepId, message }
// Twilio SMS API sends the message; returns { sid, status: "queued" | "sent" }
export async function sendEscalationSms(to: string, message: string): Promise<void> {
  console.info("[LegacyWolf] SMS stub →", to, message);
  // TODO: replace with:
  // await fetch('/api/escalation/sms', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ to, message }),
  // });
}

// POST /api/escalation/call
// Body: { to, userId, stepId, twiml }
// Twilio Voice API initiates call; returns { sid }
export async function initiateEscalationCall(to: string): Promise<void> {
  console.info("[LegacyWolf] Call stub →", to);
  // TODO: replace with:
  // await fetch('/api/escalation/call', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ to }),
  // });
}

// POST /api/escalation/attend
// Body: { userId, address, authorityLevel: "knock-only" | "enter" }
export async function dispatchAttendance(address: string, authorityLevel: string): Promise<void> {
  console.info("[LegacyWolf] Attend stub →", address, authorityLevel);
  // TODO: replace with:
  // await fetch('/api/escalation/attend', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ address, authorityLevel }),
  // });
}

// ─── Twilio Webhook Registration ────────────────────────────────────────────
//
// WEBHOOK: POST /api/twilio/sms-response
//   Twilio sends: { From, Body, MessageSid }
//   Handler: if Body contains "OKAY" or "1" → cancel active queue
//   Register at: Twilio Console → Phone Number → Messaging → Webhook URL
//
// WEBHOOK: POST /api/twilio/call-response
//   Twilio sends: { CallSid, Digits, CallStatus }
//   Handler: if Digits === "1" → cancel active queue; "2" → escalate immediately
//   Register at: Twilio Console → Phone Number → Voice → A call comes in → Webhook URL
//
// Both webhooks should verify the Twilio signature header (X-Twilio-Signature)
// using the AUTH_TOKEN from environment to prevent spoofed requests.
