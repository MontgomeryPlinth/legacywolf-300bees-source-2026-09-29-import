import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Search, Filter, Shield, MapPin, Activity, ChevronRight, Plus } from "lucide-react";

export function RespondersManagement() {
  const responders = [
    {
      id: "LW-RSP-1247",
      name: "Emma Rodriguez",
      status: "on-shift",
      zone: "North Sydney & Surrounding",
      credentials: "verified",
      license: "NMW0123456",
      dispatches: {
        today: 2,
        total: 47,
        avgResponse: "12m"
      },
      shiftStart: "7:00 AM",
      joinedDate: "Mar 2025"
    },
    {
      id: "LW-RSP-0982",
      name: "Marcus Chen",
      status: "on-shift",
      zone: "Eastern Suburbs",
      credentials: "verified",
      license: "NMW0198234",
      dispatches: {
        today: 1,
        total: 82,
        avgResponse: "10m"
      },
      shiftStart: "7:30 AM",
      joinedDate: "Jan 2025"
    },
    {
      id: "LW-RSP-1523",
      name: "Sarah Williams",
      status: "off-shift",
      zone: "Inner West",
      credentials: "expiring-soon",
      license: "NMW0145789",
      dispatches: {
        today: 0,
        total: 134,
        avgResponse: "9m"
      },
      shiftStart: null,
      joinedDate: "Nov 2024"
    },
    {
      id: "LW-RSP-1689",
      name: "James Park",
      status: "off-shift",
      zone: "Northern Beaches",
      credentials: "verified",
      license: "NMW0167423",
      dispatches: {
        today: 0,
        total: 56,
        avgResponse: "13m"
      },
      shiftStart: null,
      joinedDate: "Apr 2025"
    }
  ];

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-black uppercase tracking-tight text-2xl md:text-3xl mb-2">RESPONDERS</h1>
          <p className="text-muted-foreground text-sm md:text-base">Manage Accredited Legacy Wolf Responders</p>
        </div>
        <Button className="rounded-full uppercase font-bold tracking-wide text-sm md:text-base">
          <Plus className="w-4 h-4 mr-2" />
          Add Responder
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <Card className="p-3 md:p-5">
          <div className="text-2xl md:text-3xl font-black text-primary mb-1">34</div>
          <p className="text-[10px] md:text-xs uppercase tracking-wide text-muted-foreground">Total</p>
        </Card>
        <Card className="p-3 md:p-5">
          <div className="text-2xl md:text-3xl font-black text-primary mb-1">12</div>
          <p className="text-[10px] md:text-xs uppercase tracking-wide text-muted-foreground">On Shift</p>
        </Card>
        <Card className="p-3 md:p-5">
          <div className="text-2xl md:text-3xl font-black text-primary mb-1">11m</div>
          <p className="text-[10px] md:text-xs uppercase tracking-wide text-muted-foreground">Avg Time</p>
        </Card>
        <Card className="p-3 md:p-5">
          <div className="text-2xl md:text-3xl font-black text-primary mb-1">5</div>
          <p className="text-[10px] md:text-xs uppercase tracking-wide text-muted-foreground">Onboard</p>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search responders..."
              className="pl-10 rounded-full text-sm"
            />
          </div>
          <Button variant="outline" className="rounded-full uppercase font-medium tracking-wide text-sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </Card>

      {/* Responders Table */}
      <Card className="p-3 md:p-6">
        <div className="space-y-3">
          {responders.map((responder) => (
            <Card
              key={responder.id}
              className={`p-5 cursor-pointer hover:border-primary/50 transition-all ${
                responder.credentials === "expiring-soon" ? "border-primary/30 bg-primary/5" : ""
              } ${responder.status === "on-shift" ? "border-primary/20" : ""}`}
            >
              <div className="flex items-center gap-6">
                {/* Responder Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center font-black flex-shrink-0 relative">
                  {responder.name.split(" ").map((n) => n[0]).join("")}
                  {responder.status === "on-shift" && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-background" />
                  )}
                </div>

                {/* Responder Info */}
                <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                  <div>
                    <p className="font-bold">{responder.name}</p>
                    <p className="text-xs text-muted-foreground">{responder.id}</p>
                  </div>

                  <div>
                    <Badge
                      className={
                        responder.status === "on-shift"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {responder.status === "on-shift" ? "ON SHIFT" : "OFF SHIFT"}
                    </Badge>
                    {responder.shiftStart && (
                      <p className="text-xs text-muted-foreground mt-1">Since {responder.shiftStart}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <p className="text-sm">{responder.zone}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Joined {responder.joinedDate}</p>
                  </div>

                  <div>
                    <Badge
                      variant={responder.credentials === "verified" ? "default" : "outline"}
                      className={
                        responder.credentials === "verified"
                          ? "bg-primary text-primary-foreground"
                          : "border-primary text-primary"
                      }
                    >
                      {responder.credentials === "verified" ? "VERIFIED" : "EXPIRING SOON"}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">RN {responder.license}</p>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <div className="text-right mr-4">
                      <p className="text-2xl font-black text-primary">
                        {responder.dispatches.today}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Today
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs uppercase">
                      View Details
                    </Button>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">
                    TOTAL DISPATCHES
                  </p>
                  <p className="text-lg font-black">{responder.dispatches.total}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">
                    AVG RESPONSE
                  </p>
                  <p className="text-lg font-black">{responder.dispatches.avgResponse}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">
                    STATUS
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    <Activity className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium">Active</p>
                  </div>
                </div>
              </div>

              {responder.credentials === "expiring-soon" && (
                <div className="mt-4 pt-4 border-t border-primary/30 flex items-center justify-between">
                  <p className="text-sm text-primary font-medium">
                    <Shield className="w-4 h-4 inline mr-1" />
                    ANCC expires in 14 days — Renewal required
                  </p>
                  <Button size="sm" variant="outline" className="text-primary border-primary uppercase text-xs">
                    Review Credentials
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs md:text-sm text-muted-foreground">Showing 1-4 of 34 responders</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled className="text-xs">
            Previous
          </Button>
          <Button variant="outline" size="sm" className="bg-primary text-primary-foreground text-xs">
            1
          </Button>
          <Button variant="outline" size="sm" className="text-xs hidden md:inline-flex">
            2
          </Button>
          <Button variant="outline" size="sm" className="text-xs hidden md:inline-flex">
            3
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
