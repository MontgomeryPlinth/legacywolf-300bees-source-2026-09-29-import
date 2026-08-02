import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router";
import { Home, Radio, FileText, User as UserIcon } from "lucide-react";
import { ShiftHome } from "./screens/ShiftHome";
import { ActiveDispatch } from "./screens/ActiveDispatch";
import { IncidentReport } from "./screens/IncidentReport";
import { ResponderAccount } from "./screens/ResponderAccount";

export function ResponderApp() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: "shift", label: "Shift", icon: Home, path: "/responder/shift" },
    { id: "dispatch", label: "Dispatch", icon: Radio, path: "/responder/dispatch" },
    { id: "report", label: "Report", icon: FileText, path: "/responder/report" },
    { id: "account", label: "Account", icon: UserIcon, path: "/responder/account" }
  ];

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
            ← Back
          </button>
          <h1 className="font-black uppercase text-lg tracking-wide">RESPONDER</h1>
          <div className="w-16" /> {/* Spacer */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/responder/shift" replace />} />
          <Route path="/shift" element={<ShiftHome />} />
          <Route path="/dispatch" element={<ActiveDispatch />} />
          <Route path="/report" element={<IncidentReport />} />
          <Route path="/account" element={<ResponderAccount />} />
        </Routes>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="grid grid-cols-4 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center justify-center py-3 px-2 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5 mb-1" strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[10px] uppercase font-medium tracking-wide">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
