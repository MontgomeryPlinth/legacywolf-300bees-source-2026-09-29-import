import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard,
  Users,
  Shield,
  Activity,
  Settings as SettingsIcon,
  FileCheck,
  DollarSign
} from "lucide-react";
import { AdminDashboard } from "./screens/AdminDashboard";
import { UsersManagement } from "./screens/UsersManagement";
import { RespondersManagement } from "./screens/RespondersManagement";
import { IncidentsManagement } from "./screens/IncidentsManagement";

export function AdminApp() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { id: "users", label: "Users", icon: Users, path: "/admin/users" },
    { id: "responders", label: "Responders", icon: Shield, path: "/admin/responders" },
    { id: "incidents", label: "Incidents", icon: Activity, path: "/admin/incidents" },
    { id: "compliance", label: "Compliance", icon: FileCheck, path: "/admin/compliance" },
    { id: "billing", label: "Billing", icon: DollarSign, path: "/admin/billing" },
    { id: "settings", label: "Settings", icon: SettingsIcon, path: "/admin/settings" }
  ];

  // Mobile navigation - show only main 4 items
  const mobileNavItems = navItems.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border md:hidden">
        <div className="px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
            ← Back
          </button>
          <h1 className="font-black uppercase text-lg tracking-wide">ADMIN</h1>
          <div className="w-16" /> {/* Spacer */}
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border flex-col">
        <div className="p-6 border-b border-border">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground mb-4 block text-sm">
            ← Back to Roles
          </button>
          <h1 className="font-black uppercase text-xl tracking-wide">ADMIN</h1>
          <p className="text-xs text-muted-foreground mt-1">Operations Dashboard</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="uppercase font-medium text-sm tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Logged in as:</p>
            <p>James Wilson</p>
            <p className="text-[10px] mt-1">Operations Manager</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/users" element={<UsersManagement />} />
          <Route path="/responders" element={<RespondersManagement />} />
          <Route path="/incidents" element={<IncidentsManagement />} />
          <Route path="/compliance" element={<div className="p-4 md:p-8"><h2 className="text-2xl font-black uppercase">Compliance</h2><p className="text-muted-foreground mt-2">Coming soon</p></div>} />
          <Route path="/billing" element={<div className="p-4 md:p-8"><h2 className="text-2xl font-black uppercase">Billing</h2><p className="text-muted-foreground mt-2">Coming soon</p></div>} />
          <Route path="/settings" element={<div className="p-4 md:p-8"><h2 className="text-2xl font-black uppercase">Settings</h2><p className="text-muted-foreground mt-2">Coming soon</p></div>} />
        </Routes>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden">
        <div className="grid grid-cols-4 gap-1">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center py-3 px-2 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5 mb-1" strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[10px] uppercase font-medium tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
