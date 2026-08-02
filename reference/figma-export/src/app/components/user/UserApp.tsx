import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router";
import { Home, FileText, Users, Building2, Dog, Heart, Settings as SettingsIcon } from "lucide-react";
import { HomeStatus } from "./screens/HomeStatus";
import { PlanManagement } from "./screens/PlanManagement";
import { PeopleManagement } from "./screens/PeopleManagement";
import { PropertyAccess } from "./screens/PropertyAccess";
import { PetManagement } from "./screens/PetManagement";
import { LastWishes } from "./screens/LastWishes";
import { AccountSettings } from "./screens/AccountSettings";

export function UserApp() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: "home", label: "Nest", icon: Home, path: "/user/home" },
    { id: "plan", label: "Plan", icon: FileText, path: "/user/plan" },
    { id: "people", label: "People", icon: Users, path: "/user/people" },
    { id: "property", label: "Property", icon: Building2, path: "/user/property" },
    { id: "pets", label: "Pets", icon: Dog, path: "/user/pets" },
    { id: "wishes", label: "Wishes", icon: Heart, path: "/user/wishes" },
  ];

  const allTabs = [...tabs, { id: "account", label: "Account", icon: SettingsIcon, path: "/user/account" }];

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
            ← Back
          </button>
          <h1 className="font-black uppercase text-lg tracking-wide">USER</h1>
          <button
            onClick={() => navigate("/user/account")}
            className={`p-1.5 rounded-lg transition-colors ${
              location.pathname === "/user/account"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label="Account settings"
          >
            <SettingsIcon className="w-5 h-5" strokeWidth={location.pathname === "/user/account" ? 2.5 : 1.5} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        <Routes>
          <Route path="/" element={<Navigate to="/user/home" replace />} />
          <Route path="/home" element={<HomeStatus />} />
          <Route path="/plan" element={<PlanManagement />} />
          <Route path="/people" element={<PeopleManagement />} />
          <Route path="/property" element={<PropertyAccess />} />
          <Route path="/pets" element={<PetManagement />} />
          <Route path="/wishes" element={<LastWishes />} />
          <Route path="/account" element={<AccountSettings />} />
        </Routes>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden">
        <div className="grid grid-cols-6 gap-1">
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

      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border">
        <div className="p-6 border-b border-border">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground mb-4 block">
            ← Back to Roles
          </button>
          <h1 className="font-black uppercase text-xl tracking-wide">USER</h1>
        </div>
        <nav className="p-4 space-y-2">
          {allTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="uppercase font-medium text-sm tracking-wide">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
