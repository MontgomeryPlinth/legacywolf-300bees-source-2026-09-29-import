import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Search, Filter, Activity, Clock, CheckCircle, AlertCircle, Eye } from "lucide-react";

export function IncidentsManagement() {
  const incidents = [
    {
      id: "LW-2346",
      user: "Alex Morgan",
      responder: "Emma Rodriguez",
      status: "active",
      tier: "Full",
      location: "North Sydney",
      activated: "34 min ago",
      eta: "8 min",
      type: "unresponsive"
    },
    {
      id: "LW-2347",
      user: "Patricia Lin",
      responder: "Marcus Chen",
      status: "active",
      tier: "Attend & Check",
      location: "Mosman",
      activated: "18 min ago",
      eta: "15 min",
      type: "unresponsive"
    },
    {
      id: "LW-2345",
      user: "David Thompson",
      responder: "Emma Rodriguez",
      status: "completed",
      tier: "Full",
      location: "North Sydney",
      activated: "3 hours ago",
      completed: "2h 42m ago",
      outcome: "User responsive — false alarm",
      type: "unresponsive"
    },
    {
      id: "LW-2344",
      user: "Sarah Chen",
      responder: "Marcus Chen",
      status: "completed",
      tier: "Pet Guardian",
      location: "Cremorne",
      activated: "5 hours ago",
      completed: "4h 18m ago",
      outcome: "Pet secured — User hospitalized",
      type: "unresponsive"
    }
  ];

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-black uppercase tracking-tight text-2xl md:text-3xl mb-2">INCIDENTS</h1>
          <p className="text-muted-foreground text-sm md:text-base">Active and historical incident management</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6">
        <Card className="p-3 md:p-5">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            <Badge className="bg-destructive text-white text-xs">LIVE</Badge>
          </div>
          <div className="text-2xl md:text-3xl font-black text-primary mb-1">2</div>
          <p className="text-[10px] md:text-xs uppercase tracking-wide text-muted-foreground">Active</p>
        </Card>
        <Card className="p-3 md:p-5">
          <div className="text-2xl md:text-3xl font-black text-primary mb-1">24</div>
          <p className="text-[10px] md:text-xs uppercase tracking-wide text-muted-foreground">Today</p>
        </Card>
        <Card className="p-3 md:p-5 hidden md:block">
          <div className="text-3xl font-black text-primary mb-1">147</div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">This Week</p>
        </Card>
        <Card className="p-3 md:p-5 hidden md:block">
          <div className="text-3xl font-black text-primary mb-1">98%</div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">SLA Met</p>
        </Card>
        <Card className="p-3 md:p-5 hidden md:block">
          <div className="text-3xl font-black text-primary mb-1">11m</div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Avg Response</p>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search incidents..."
              className="pl-10 rounded-full text-sm"
            />
          </div>
          <Button variant="outline" className="rounded-full uppercase font-medium tracking-wide text-sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </Card>

      {/* Incidents List */}
      <div className="space-y-3">
        {incidents.map((incident) => (
          <Card
            key={incident.id}
            className={`p-4 md:p-6 cursor-pointer hover:border-primary/50 transition-all ${
              incident.status === "active" ? "border-2 border-destructive bg-destructive/5" : ""
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="p-2 md:p-3 rounded-full bg-muted flex-shrink-0">
                  {incident.status === "active" ? (
                    <Activity className="w-5 h-5 md:w-6 md:h-6 text-destructive" />
                  ) : (
                    <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-lg md:text-xl font-black">#{incident.id}</h3>
                    <Badge
                      className={`text-xs ${
                        incident.status === "active"
                          ? "bg-destructive text-white"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {incident.status.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{incident.tier}</Badge>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">{incident.location}</p>
                </div>
              </div>

              <div className="text-left md:text-right">
                <div className="flex items-center gap-2 md:justify-end mb-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs md:text-sm font-medium">
                    {incident.status === "active" ? `Activated ${incident.activated}` : `Completed ${incident.completed}`}
                  </p>
                </div>
                {incident.status === "active" && incident.eta && (
                  <p className="text-xs md:text-sm text-primary font-bold">ETA: {incident.eta}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 mb-4">
              <div>
                <p className="text-[10px] md:text-xs uppercase text-muted-foreground tracking-wide mb-1 md:mb-2">USER</p>
                <p className="font-medium text-sm md:text-base">{incident.user}</p>
              </div>
              <div>
                <p className="text-[10px] md:text-xs uppercase text-muted-foreground tracking-wide mb-1 md:mb-2">RESPONDER</p>
                <p className="font-medium text-sm md:text-base">{incident.responder}</p>
              </div>
            </div>

            {incident.status === "completed" && incident.outcome && (
              <Card className="p-4 bg-muted/50 mb-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">OUTCOME</p>
                    <p className="text-sm font-medium">{incident.outcome}</p>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex flex-col md:flex-row gap-2 md:gap-3">
              <Button
                className="flex-1 rounded-full uppercase font-bold tracking-wide text-sm"
                variant={incident.status === "active" ? "default" : "outline"}
              >
                <Eye className="w-4 h-4 mr-2" />
                {incident.status === "active" ? "Live Command" : "View Report"}
              </Button>
              {incident.status === "active" && (
                <>
                  <Button variant="outline" className="flex-1 md:flex-initial rounded-full uppercase font-medium tracking-wide text-sm">
                    Override
                  </Button>
                  <Button variant="outline" className="flex-1 md:flex-initial rounded-full uppercase font-medium tracking-wide text-sm text-destructive border-destructive">
                    Escalate
                  </Button>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs md:text-sm text-muted-foreground">Showing 1-4 of 2,347 incidents</p>
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
          <span className="px-2 flex items-center hidden md:flex">...</span>
          <Button variant="outline" size="sm" className="text-xs hidden md:inline-flex">
            587
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
