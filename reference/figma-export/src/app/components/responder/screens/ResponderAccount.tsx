import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  User,
  Shield,
  FileCheck,
  GraduationCap,
  DollarSign,
  Calendar,
  Heart,
  Phone,
  ChevronRight
} from "lucide-react";

export function ResponderAccount() {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="font-black uppercase tracking-tight text-2xl">ACCOUNT</h2>
        <p className="text-muted-foreground">
          Your profile and credentials
        </p>
      </div>

      {/* Profile Card */}
      <Card className="p-6 bg-primary/10 border-primary/30">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center font-black text-2xl">
            ER
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">Emma Rodriguez</h3>
            <p className="text-sm text-muted-foreground mb-2">Accredited Legacy Wolf Responder</p>
            <Badge className="bg-primary text-primary-foreground">ACTIVE</Badge>
          </div>
        </div>
        <div className="pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">MEMBER SINCE</p>
            <p className="font-medium">March 2025</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">RESPONDER ID</p>
            <p className="font-medium">LW-RSP-1247</p>
          </div>
        </div>
      </Card>

      {/* Credentials */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-sm uppercase tracking-wider font-bold">CREDENTIALS</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Registered Nurse</p>
              <p className="text-sm text-muted-foreground">License #NMW0123456</p>
            </div>
            <Badge variant="outline" className="border-primary text-primary text-xs">VERIFIED</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Australian National Character Check</p>
              <p className="text-sm text-muted-foreground">Valid until Dec 2026</p>
            </div>
            <Badge variant="outline" className="border-primary text-primary text-xs">CURRENT</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Animal Care Training</p>
              <p className="text-sm text-muted-foreground">Certified Feb 2025</p>
            </div>
            <Badge variant="outline" className="border-primary text-primary text-xs">CERTIFIED</Badge>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm uppercase tracking-wider font-bold">YOUR PERFORMANCE</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-black text-primary mb-1">47</div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Dispatches</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-primary mb-1">18</div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">This Month</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-primary mb-1">12m</div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Avg Response</p>
          </div>
        </div>
      </Card>

      {/* Menu Items */}
      <div className="space-y-3">
        <Card className="p-5 cursor-pointer hover:border-primary/50 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-muted">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold">Training & Certification</h4>
              <p className="text-sm text-muted-foreground">Required modules and updates</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-5 cursor-pointer hover:border-primary/50 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-muted">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold">Schedule & Coverage</h4>
              <p className="text-sm text-muted-foreground">View and manage your shifts</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-5 cursor-pointer hover:border-primary/50 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-muted">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold">Pay & Billing</h4>
              <p className="text-sm text-muted-foreground">Payment history and tax documents</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-5 cursor-pointer hover:border-primary/50 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-muted">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold">Wellness Support</h4>
              <p className="text-sm text-muted-foreground">Counseling and mental health resources</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-5 cursor-pointer hover:border-primary/50 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-muted">
              <FileCheck className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold">Dispatch History</h4>
              <p className="text-sm text-muted-foreground">View all past incidents and reports</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Emergency Contact */}
      <Card className="p-5 bg-destructive/10 border-destructive/30">
        <div className="flex items-start gap-3">
          <Phone className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Operations Support Line</p>
            <p className="text-xl font-black text-destructive">1800 OPS LINE</p>
            <p className="text-xs text-muted-foreground mt-1">24/7 for on-shift assistance</p>
          </div>
        </div>
      </Card>

      {/* Sign Out */}
      <Button variant="outline" className="w-full rounded-full py-6 uppercase font-medium tracking-wide text-destructive border-destructive hover:bg-destructive hover:text-white">
        Sign Out
      </Button>
    </div>
  );
}
