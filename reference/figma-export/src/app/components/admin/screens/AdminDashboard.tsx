import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  Activity,
  Users,
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle,
  MapPin,
  TrendingUp
} from "lucide-react";

export function AdminDashboard() {
  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="font-black uppercase tracking-tight text-2xl md:text-3xl mb-2">DASHBOARD</h1>
        <p className="text-muted-foreground text-sm md:text-base">Real-time operations overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <Card className="p-4 md:p-6">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="p-2 md:p-3 rounded-full bg-primary/10">
              <Activity className="w-4 h-4 md:w-6 md:h-6 text-primary" />
            </div>
            <Badge className="bg-destructive text-white text-xs">LIVE</Badge>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-black mb-1 md:mb-2">2</div>
            <p className="text-xs md:text-sm uppercase tracking-wide text-muted-foreground">Active Incidents</p>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="p-2 md:p-3 rounded-full bg-primary/10">
              <Shield className="w-4 h-4 md:w-6 md:h-6 text-primary" />
            </div>
            <Badge variant="outline" className="border-primary text-primary text-xs">ON SHIFT</Badge>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-black mb-1 md:mb-2">12</div>
            <p className="text-xs md:text-sm uppercase tracking-wide text-muted-foreground">Responders</p>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="p-2 md:p-3 rounded-full bg-primary/10">
              <Users className="w-4 h-4 md:w-6 md:h-6 text-primary" />
            </div>
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-black mb-1 md:mb-2">1,247</div>
            <p className="text-xs md:text-sm uppercase tracking-wide text-muted-foreground">Users</p>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="p-2 md:p-3 rounded-full bg-primary/10">
              <Clock className="w-4 h-4 md:w-6 md:h-6 text-primary" />
            </div>
            <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-black mb-1 md:mb-2">11m</div>
            <p className="text-xs md:text-sm uppercase tracking-wide text-muted-foreground">Response</p>
          </div>
        </Card>
      </div>

      {/* Active Incidents Map */}
      <Card className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-xs md:text-sm uppercase tracking-wider font-bold">ACTIVE INCIDENTS</h2>
          <Badge className="bg-destructive text-white text-xs">2 ACTIVE</Badge>
        </div>
        <div className="h-[250px] md:h-[400px] bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
          {/* Simplified map representation */}
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50" />

          {/* Incident markers */}
          <div className="absolute top-1/3 left-1/3">
            <div className="relative">
              <div className="w-4 h-4 bg-destructive rounded-full animate-ping absolute" />
              <div className="w-4 h-4 bg-destructive rounded-full relative" />
              <div className="absolute -top-2 left-6 bg-background border border-border rounded px-3 py-1 whitespace-nowrap">
                <p className="text-xs font-medium">#LW-2346 • North Sydney</p>
                <p className="text-xs text-muted-foreground">Responder: E. Rodriguez • 8 min ETA</p>
              </div>
            </div>
          </div>

          <div className="absolute top-2/3 right-1/3">
            <div className="relative">
              <div className="w-4 h-4 bg-destructive rounded-full animate-ping absolute" />
              <div className="w-4 h-4 bg-destructive rounded-full relative" />
              <div className="absolute -top-2 left-6 bg-background border border-border rounded px-3 py-1 whitespace-nowrap">
                <p className="text-xs font-medium">#LW-2347 • Mosman</p>
                <p className="text-xs text-muted-foreground">Responder: M. Chen • 15 min ETA</p>
              </div>
            </div>
          </div>

          <div className="absolute text-center">
            <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Greater Sydney Coverage Zone</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Active Incidents List */}
        <Card className="p-4 md:p-6">
          <h2 className="text-xs md:text-sm uppercase tracking-wider font-bold mb-4 md:mb-6">INCIDENT DETAILS</h2>
          <div className="space-y-4">
            <Card className="p-5 bg-destructive/10 border-destructive/30">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-black text-lg">#LW-2346</p>
                    <Badge className="bg-destructive text-white text-xs">ACTIVE</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">North Sydney • Full Tier</p>
                </div>
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">User:</span>
                  <span className="font-medium">Alex Morgan</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Responder:</span>
                  <span className="font-medium">Emma Rodriguez</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium text-primary">En Route (8 min)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Activated:</span>
                  <span className="font-medium">34 min ago</span>
                </div>
              </div>
              <Button className="w-full rounded-full mt-4 uppercase font-bold tracking-wide" size="sm">
                View Live Command
              </Button>
            </Card>

            <Card className="p-5 bg-destructive/10 border-destructive/30">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-black text-lg">#LW-2347</p>
                    <Badge className="bg-destructive text-white text-xs">ACTIVE</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Mosman • Attend & Check</p>
                </div>
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">User:</span>
                  <span className="font-medium">Patricia Lin</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Responder:</span>
                  <span className="font-medium">Marcus Chen</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium text-primary">En Route (15 min)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Activated:</span>
                  <span className="font-medium">18 min ago</span>
                </div>
              </div>
              <Button className="w-full rounded-full mt-4 uppercase font-bold tracking-wide" size="sm">
                View Live Command
              </Button>
            </Card>
          </div>
        </Card>

        {/* Alerts Requiring Attention */}
        <Card className="p-4 md:p-6">
          <h2 className="text-xs md:text-sm uppercase tracking-wider font-bold mb-4 md:mb-6">ALERTS REQUIRING ATTENTION</h2>
          <div className="space-y-3">
            <Card className="p-4 bg-muted">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm mb-1">Responder credential expiring</p>
                  <p className="text-xs text-muted-foreground mb-2">Sarah Williams • ANCC expires in 14 days</p>
                  <Button variant="outline" size="sm" className="text-xs uppercase">
                    Review
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-muted">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm mb-1">Payment failed</p>
                  <p className="text-xs text-muted-foreground mb-2">User #LW-US-6842 • Subscription at risk</p>
                  <Button variant="outline" size="sm" className="text-xs uppercase">
                    Contact User
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-muted">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm mb-1">Coverage gap alert</p>
                  <p className="text-xs text-muted-foreground mb-2">Eastern Suburbs • Tomorrow 2-4 PM</p>
                  <Button variant="outline" size="sm" className="text-xs uppercase">
                    Assign Shift
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </Card>
      </div>

      {/* Today's Activity */}
      <Card className="p-4 md:p-6">
        <h2 className="text-xs md:text-sm uppercase tracking-wider font-bold mb-4 md:mb-6">TODAY'S ACTIVITY</h2>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
          <div className="text-center">
            <div className="text-3xl font-black text-primary mb-1">24</div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Incidents</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-primary mb-1">22</div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Completed</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-primary mb-1">2</div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">In Progress</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-primary mb-1">0</div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Escalations</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-primary mb-1">98%</div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">SLA Met</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
