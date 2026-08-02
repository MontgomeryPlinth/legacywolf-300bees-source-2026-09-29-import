import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  User,
  CreditCard,
  FileCheck,
  Bell,
  Shield,
  Clock,
  HelpCircle,
  ChevronRight,
  Phone
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../../../contexts/AppContext";
import { AccountProfile } from "./account/AccountProfile";
import { AccountSubscription } from "./account/AccountSubscription";
import { AccountLegalAuthorizations } from "./account/AccountLegalAuthorizations";
import { AccountNotifications } from "./account/AccountNotifications";
import { AccountSecurity } from "./account/AccountSecurity";
import { AccountHistory } from "./account/AccountHistory";

export function AccountSettings() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const { logout } = useApp();
  const navigate = useNavigate();

  const settingsSections = [
    {
      id: "profile",
      title: "Profile",
      description: "Legal name, ID verification",
      icon: User,
      status: "verified"
    },
    {
      id: "subscription",
      title: "Subscription & Billing",
      description: "Full Tier • Next bill Feb 23, 2026",
      icon: CreditCard,
      status: "active"
    },
    {
      id: "legal",
      title: "Legal Authorizations",
      description: "4 documents signed",
      icon: FileCheck,
      status: "complete"
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Manage alerts and reminders",
      icon: Bell,
      status: null
    },
    {
      id: "security",
      title: "Security & Privacy",
      description: "Biometric lock, data export",
      icon: Shield,
      status: "enabled"
    },
    {
      id: "history",
      title: "History / Audit Log",
      description: "View all plan changes and events",
      icon: Clock,
      status: null
    },
    {
      id: "support",
      title: "Help & Support",
      description: "FAQ, chat, emergency line",
      icon: HelpCircle,
      status: null
    }
  ];

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="font-black uppercase tracking-tight text-2xl">ACCOUNT</h2>
        <p className="text-muted-foreground">
          Manage your settings and preferences
        </p>
      </div>

      {/* Account Summary */}
      <Card className="p-6 bg-primary/10 border-primary/30">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold mb-1">Alex Morgan</h3>
            <p className="text-sm text-muted-foreground">alex.morgan@email.com</p>
            <p className="text-sm text-muted-foreground">+61 412 345 678</p>
          </div>
          <Badge className="bg-primary text-primary-foreground">FULL TIER</Badge>
        </div>
        <div className="pt-4 border-t border-border/50">
          <p className="text-xs uppercase text-muted-foreground tracking-wide mb-2">MEMBER SINCE</p>
          <p className="font-medium">November 15, 2025</p>
        </div>
      </Card>

      {/* Settings Sections */}
      <div className="space-y-3">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.id}
              className="p-5 cursor-pointer hover:border-primary/50 transition-all"
              onClick={() => setOpenSection(section.id)}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-muted">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold">{section.title}</h4>
                    {section.status && (
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          section.status === "verified" || section.status === "active" || section.status === "complete" || section.status === "enabled"
                            ? "border-primary text-primary"
                            : ""
                        }`}
                      >
                        {section.status.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Emergency Contact */}
      <Card className="p-6 bg-destructive/10 border-destructive/30">
        <div className="flex items-start gap-3 mb-4">
          <Phone className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold mb-1">24/7 Emergency Line</h4>
            <p className="text-sm text-muted-foreground mb-3">
              If you need immediate assistance or want to speak to Legacy Wolf operations
            </p>
            <p className="text-2xl font-black text-destructive">1800 LEGACY (1800 534 229)</p>
          </div>
        </div>
      </Card>

      {/* Sign Out */}
      <Button
        variant="outline"
        className="w-full rounded-full py-6 uppercase font-medium tracking-wide text-destructive border-destructive hover:bg-destructive hover:text-white"
        onClick={() => { logout(); navigate("/"); }}
      >
        Sign Out
      </Button>

      {/* Version */}
      <p className="text-center text-xs text-muted-foreground">
        Legacy Wolf v1.0.0 • Build 2026.01
      </p>

      {/* Internal Views */}
      <AccountProfile 
        open={openSection === "profile"} 
        onOpenChange={(open) => !open && setOpenSection(null)} 
      />
      <AccountSubscription 
        open={openSection === "subscription"} 
        onOpenChange={(open) => !open && setOpenSection(null)} 
      />
      <AccountLegalAuthorizations 
        open={openSection === "legal"} 
        onOpenChange={(open) => !open && setOpenSection(null)} 
      />
      <AccountNotifications 
        open={openSection === "notifications"} 
        onOpenChange={(open) => !open && setOpenSection(null)} 
      />
      <AccountSecurity 
        open={openSection === "security"} 
        onOpenChange={(open) => !open && setOpenSection(null)} 
      />
      <AccountHistory 
        open={openSection === "history"} 
        onOpenChange={(open) => !open && setOpenSection(null)} 
      />
    </div>
  );
}