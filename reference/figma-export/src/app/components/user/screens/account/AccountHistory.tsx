import { useState } from "react";
import { Card } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import {
  Clock,
  CheckCircle2,
  Shield,
  Users,
  FileText,
  Download,
  Filter,
  Calendar,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../../ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";

interface AccountHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CheckInEvent {
  id: string;
  timestamp: string;
  type: "manual" | "automatic" | "grace-window" | "missed";
  method?: string;
  location?: string;
}

interface AuditEvent {
  id: string;
  timestamp: string;
  category: "plan" | "contact" | "security" | "billing" | "incident" | "document";
  action: string;
  description: string;
  actor?: string;
}

export function AccountHistory({ open, onOpenChange }: AccountHistoryProps) {
  const [timeRange, setTimeRange] = useState("last-year");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAllCheckIns, setShowAllCheckIns] = useState(false);

  // Generate mock check-in data for the last year
  const generateCheckIns = (): CheckInEvent[] => {
    const checkIns: CheckInEvent[] = [];
    const now = new Date();
    const intervalHours = 16; // Motion timer interval
    
    // Generate for last year
    for (let i = 0; i < 365; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // 2-3 check-ins per day based on 16h interval
      for (let j = 0; j < 2; j++) {
        const checkInTime = new Date(date);
        checkInTime.setHours(8 + (j * intervalHours), Math.floor(Math.random() * 60));
        
        // 95% success rate
        const missed = Math.random() < 0.05;
        
        checkIns.push({
          id: `checkin_${i}_${j}`,
          timestamp: checkInTime.toISOString(),
          type: missed ? "missed" : (Math.random() < 0.7 ? "manual" : "automatic"),
          method: missed ? undefined : (Math.random() < 0.8 ? "mobile" : "watch"),
          location: "Melbourne, VIC",
        });
      }
    }
    
    return checkIns.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const allCheckIns = generateCheckIns();
  const displayedCheckIns = showAllCheckIns 
    ? allCheckIns 
    : allCheckIns.filter(ci => {
        const checkInDate = new Date(ci.timestamp);
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return checkInDate >= oneYearAgo;
      });

  const auditEvents: AuditEvent[] = [
    {
      id: "audit_1",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      category: "plan",
      action: "Plan Updated",
      description: "Changed Motion Timer from 12h to 16h",
      actor: "You",
    },
    {
      id: "audit_2",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      category: "contact",
      action: "Contact Added",
      description: 'Added Emma Roberts as backup Nominated Contact',
      actor: "You",
    },
    {
      id: "audit_3",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      category: "security",
      action: "Login",
      description: "New login from Safari on macOS • Melbourne, VIC",
      actor: "You",
    },
    {
      id: "audit_4",
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      category: "incident",
      action: "Drill Completed",
      description: "Test Run completed successfully • All contacts notified",
      actor: "System",
    },
    {
      id: "audit_5",
      timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      category: "billing",
      action: "Payment Successful",
      description: "Subscription payment of $89.00 processed",
      actor: "System",
    },
    {
      id: "audit_6",
      timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      category: "document",
      action: "Document Signed",
      description: "Property Access Authorization re-signed",
      actor: "You",
    },
    {
      id: "audit_7",
      timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      category: "plan",
      action: "Service Activated",
      description: "Enabled Reputation Guard / Pants On Service",
      actor: "You",
    },
    {
      id: "audit_8",
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      category: "contact",
      action: "Contact Verified",
      description: "Jessica Chen accepted role as Primary Nominated Contact",
      actor: "System",
    },
    {
      id: "audit_9",
      timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      category: "security",
      action: "2FA Enabled",
      description: "Two-factor authentication activated",
      actor: "You",
    },
    {
      id: "audit_10",
      timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      category: "plan",
      action: "Tier Upgrade",
      description: "Upgraded from Pet Guardian to Full Tier",
      actor: "You",
    },
  ];

  const filteredAuditEvents = auditEvents.filter(event => 
    categoryFilter === "all" || event.category === categoryFilter
  );

  // Calculate stats
  const totalCheckIns = allCheckIns.length;
  const successfulCheckIns = allCheckIns.filter(ci => ci.type !== "missed").length;
  const missedCheckIns = allCheckIns.filter(ci => ci.type === "missed").length;
  const successRate = ((successfulCheckIns / totalCheckIns) * 100).toFixed(1);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "plan":
        return Shield;
      case "contact":
        return Users;
      case "security":
        return Shield;
      case "billing":
        return FileText;
      case "incident":
        return AlertTriangle;
      case "document":
        return FileText;
      default:
        return Clock;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "incident":
        return "text-destructive";
      case "security":
        return "text-primary";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[95vh] overflow-y-auto">
        <SheetHeader className="pb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-black uppercase tracking-tight text-xl">
              History & Audit Log
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-left">
            Complete record of check-ins and account activity
          </p>
        </SheetHeader>

        <div className="space-y-6 pb-24">
          <Tabs defaultValue="check-ins" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="check-ins">Check-Ins</TabsTrigger>
              <TabsTrigger value="audit">Audit Log</TabsTrigger>
            </TabsList>

            {/* Check-Ins Tab */}
            <TabsContent value="check-ins" className="space-y-6 mt-6">
              {/* Check-In Stats */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Success Rate
                    </p>
                  </div>
                  <p className="text-3xl font-black text-primary">{successRate}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {successfulCheckIns} of {totalCheckIns} check-ins
                  </p>
                </Card>

                <Card className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Missed
                    </p>
                  </div>
                  <p className="text-3xl font-black text-destructive">{missedCheckIns}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last 12 months
                  </p>
                </Card>
              </div>

              {/* Time Range Info */}
              <Card className="p-5 bg-primary/10 border-primary/30">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium mb-1">
                      Showing {showAllCheckIns ? "All Time" : "Last 12 Months"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {displayedCheckIns.length} check-in events recorded
                    </p>
                  </div>
                </div>
              </Card>

              {/* Check-In Timeline */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs uppercase tracking-wide text-muted-foreground">
                    Check-In Timeline
                  </h3>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export CSV
                  </Button>
                </div>

                <div className="space-y-2">
                  {displayedCheckIns.slice(0, 50).map((checkIn) => (
                    <Card key={checkIn.id} className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          checkIn.type === "missed" 
                            ? "bg-destructive/10" 
                            : "bg-primary/10"
                        }`}>
                          {checkIn.type === "missed" ? (
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">
                              {checkIn.type === "missed" 
                                ? "Missed Check-In" 
                                : checkIn.type === "grace-window"
                                ? "Grace Window Check-In"
                                : checkIn.type === "automatic"
                                ? "Automatic Check-In"
                                : "Manual Check-In"}
                            </p>
                            {checkIn.method && (
                              <Badge variant="outline" className="text-xs">
                                {checkIn.method.toUpperCase()}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(checkIn.timestamp).toLocaleString("en-AU", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {checkIn.location && (
                              <>
                                <span>•</span>
                                <span>{checkIn.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {!showAllCheckIns && allCheckIns.length > displayedCheckIns.length && (
                  <Button
                    variant="outline"
                    className="w-full mt-4 gap-2"
                    onClick={() => setShowAllCheckIns(true)}
                  >
                    <ChevronDown className="w-4 h-4" />
                    Show Older Check-Ins (All Time)
                  </Button>
                )}

                {showAllCheckIns && (
                  <Button
                    variant="outline"
                    className="w-full mt-4 gap-2"
                    onClick={() => setShowAllCheckIns(false)}
                  >
                    <ChevronUp className="w-4 h-4" />
                    Show Last 12 Months Only
                  </Button>
                )}
              </div>
            </TabsContent>

            {/* Audit Log Tab */}
            <TabsContent value="audit" className="space-y-6 mt-6">
              {/* Filters */}
              <div className="flex gap-3">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="plan">Plan Changes</SelectItem>
                    <SelectItem value="contact">Contacts</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="incident">Incidents</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Download className="w-4 h-4" />
                </Button>
              </div>

              {/* Audit Events */}
              <div className="space-y-3">
                {filteredAuditEvents.map((event) => {
                  const Icon = getCategoryIcon(event.category);
                  const colorClass = getCategoryColor(event.category);
                  
                  return (
                    <Card key={event.id} className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-muted">
                          <Icon className={`w-4 h-4 ${colorClass}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{event.action}</p>
                            <Badge variant="outline" className="text-xs">
                              {event.category.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {event.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(event.timestamp).toLocaleString("en-AU", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {event.actor && (
                              <>
                                <span>•</span>
                                <span>By {event.actor}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <Card className="p-5 bg-muted">
                <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                  About Audit Logs
                </h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    • All account changes and data access are logged permanently
                  </p>
                  <p>
                    • During incidents, responder actions are logged with timestamps
                  </p>
                  <p>
                    • You can export your complete audit trail at any time
                  </p>
                  <p>
                    • Logs are retained for the lifetime of your account plus 7 years
                  </p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
