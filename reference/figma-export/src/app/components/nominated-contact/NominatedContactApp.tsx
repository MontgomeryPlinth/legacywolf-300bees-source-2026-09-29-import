import { Routes, Route, Navigate, useNavigate } from "react-router";
import { InviteLanding } from "./screens/InviteLanding";
import { MyRole } from "./screens/MyRole";
import { ActiveAlert } from "./screens/ActiveAlert";
import { DrillNotice } from "./screens/DrillNotice";

export function NominatedContactApp() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
            ← Back
          </button>
          <h1 className="font-black uppercase text-base tracking-wide">NOMINATED CONTACT</h1>
          <div className="w-16" /> {/* Spacer */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/nominated-contact/invite" replace />} />
          <Route path="/invite" element={<InviteLanding />} />
          <Route path="/my-role" element={<MyRole />} />
          <Route path="/active-alert" element={<ActiveAlert />} />
          <Route path="/drill" element={<DrillNotice />} />
        </Routes>
      </main>
    </div>
  );
}
