interface BatteryOfflineEmailProps {
  userName?: string;
  onImOkay?: () => void;
  onLostPhone?: () => void;
}

export function BatteryOfflineEmail({
  userName = "Alex",
  onImOkay,
  onLostPhone,
}: BatteryOfflineEmailProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Email client frame */}
      <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-border">
        {/* Email chrome */}
        <div className="bg-card border-b border-border px-4 py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-destructive/40" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/40" />
            <span className="w-3 h-3 rounded-full bg-primary/40" />
          </div>
          <span className="text-xs text-muted-foreground ml-2 truncate">
            no-reply@legacywolf.com.au — Your Legacy Wolf device went offline
          </span>
        </div>

        {/* Email body */}
        <div style={{ backgroundColor: "#0A0A0A" }} className="px-8 py-10 space-y-8">
          {/* Wordmark */}
          <div className="text-center">
            <span className="text-2xl font-black tracking-widest uppercase" style={{ color: "#B5C42C" }}>
              LEGACY
            </span>
            <span className="text-2xl font-black tracking-widest uppercase text-white ml-2">
              WOLF
            </span>
          </div>

          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full border-2 flex items-center justify-center" style={{ borderColor: "#B5C42C22", backgroundColor: "#B5C42C10" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#B5C42C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="16" height="10" rx="2" />
                <line x1="22" y1="11" x2="22" y2="13" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-2">
            <h1 className="text-xl font-black text-white uppercase tracking-wide">
              We noticed your device went offline
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "#888888" }}>
              Hi {userName}, your phone disconnected from Legacy Wolf. If your battery died or you switched devices, let us know you're safe.
            </p>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <button
              onClick={onImOkay}
              className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#B5C42C", color: "#0A0A0A" }}
            >
              I'm Okay
            </button>
            <button
              onClick={onLostPhone}
              className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest border transition-all hover:border-white/40"
              style={{ backgroundColor: "transparent", color: "#888888", borderColor: "#333333" }}
            >
              I Lost My Phone
            </button>
          </div>

          {/* Escalation warning */}
          <div className="rounded-xl p-4 space-y-1" style={{ backgroundColor: "#161616", border: "1px solid #222222" }}>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "#B5C42C" }}>
              Important
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "#666666" }}>
              If we don't hear from you within <strong style={{ color: "#999999" }}>36 hours</strong>, we'll automatically activate your protection plan and contact your nominated responders.
            </p>
          </div>

          {/* Footer */}
          <div className="text-center space-y-1 pt-2 border-t" style={{ borderColor: "#1a1a1a" }}>
            <p className="text-xs" style={{ color: "#444444" }}>
              — The Legacy Wolf Team
            </p>
            <p className="text-xs" style={{ color: "#333333" }}>
              legacywolf.com.au · support@legacywolf.com.au
            </p>
            <p className="text-xs" style={{ color: "#2a2a2a" }}>
              This message was sent because you're a Legacy Wolf member.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
