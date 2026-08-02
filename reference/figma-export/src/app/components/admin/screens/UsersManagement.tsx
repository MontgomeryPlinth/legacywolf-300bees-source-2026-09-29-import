import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Search, Filter, User, MapPin, Phone, Mail, ChevronRight, Shield } from "lucide-react";

export function UsersManagement() {
  const users = [
    {
      id: "LW-US-8472",
      name: "Alex Morgan",
      location: "North Sydney",
      tier: "Full",
      status: "protected",
      lastCheckIn: "2 hours ago",
      phone: "+61 412 345 678",
      email: "alex.morgan@email.com",
      joinedDate: "Nov 2025"
    },
    {
      id: "LW-US-7821",
      name: "Patricia Lin",
      location: "Mosman",
      tier: "Attend & Check",
      status: "protected",
      lastCheckIn: "45 min ago",
      phone: "+61 423 456 789",
      email: "patricia.lin@email.com",
      joinedDate: "Oct 2025"
    },
    {
      id: "LW-US-6842",
      name: "David Thompson",
      location: "Neutral Bay",
      tier: "Full",
      status: "payment-failed",
      lastCheckIn: "5 hours ago",
      phone: "+61 434 567 890",
      email: "david.t@email.com",
      joinedDate: "Sep 2025"
    },
    {
      id: "LW-US-5234",
      name: "Emma Sullivan",
      location: "Cremorne",
      tier: "Pet Guardian",
      status: "protected",
      lastCheckIn: "1 hour ago",
      phone: "+61 445 678 901",
      email: "emma.sullivan@email.com",
      joinedDate: "Dec 2025"
    }
  ];

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-black uppercase tracking-tight text-2xl md:text-3xl mb-2">USERS</h1>
          <p className="text-muted-foreground text-sm md:text-base">Manage protected users</p>
        </div>
        <Button className="rounded-full uppercase font-bold tracking-wide text-sm md:text-base">
          <User className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <Card className="p-3 md:p-5">
          <div className="text-2xl md:text-3xl font-black text-primary mb-1">1,247</div>
          <p className="text-[10px] md:text-xs uppercase tracking-wide text-muted-foreground">Total Users</p>
        </Card>
        <Card className="p-3 md:p-5">
          <div className="text-2xl md:text-3xl font-black text-primary mb-1">1,189</div>
          <p className="text-[10px] md:text-xs uppercase tracking-wide text-muted-foreground">Active</p>
        </Card>
        <Card className="p-3 md:p-5">
          <div className="text-2xl md:text-3xl font-black text-primary mb-1">42</div>
          <p className="text-[10px] md:text-xs uppercase tracking-wide text-muted-foreground">New Month</p>
        </Card>
        <Card className="p-3 md:p-5">
          <div className="text-2xl md:text-3xl font-black text-primary mb-1">58</div>
          <p className="text-[10px] md:text-xs uppercase tracking-wide text-muted-foreground">Trial</p>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10 rounded-full text-sm"
            />
          </div>
          <Button variant="outline" className="rounded-full uppercase font-medium tracking-wide text-sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="p-3 md:p-6">
        <div className="space-y-3">
          {users.map((user) => (
            <Card
              key={user.id}
              className={`p-4 md:p-5 cursor-pointer hover:border-primary/50 transition-all ${
                user.status === "payment-failed" ? "border-destructive/30 bg-destructive/5" : ""
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* User Avatar */}
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-black flex-shrink-0 text-sm">
                  {user.name.split(" ").map((n) => n[0]).join("")}
                </div>

                {/* User Info - Mobile Layout */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-sm md:text-base">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.id}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground md:hidden" />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs md:text-sm">{user.location}</p>
                    </div>
                    <Badge
                      className={`text-xs ${
                        user.tier === "Full"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {user.tier}
                    </Badge>
                    <Badge
                      variant={user.status === "protected" ? "default" : "destructive"}
                      className={`text-xs ${user.status === "protected" ? "bg-primary text-primary-foreground" : ""}`}
                    >
                      {user.status === "protected" ? "PROTECTED" : "PAYMENT FAILED"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Last check-in: {user.lastCheckIn}</span>
                    <Button variant="outline" size="sm" className="text-xs uppercase hidden md:inline-flex">
                      View Details
                    </Button>
                  </div>
                </div>

                {/* Desktop Only - ChevronRight */}
                <ChevronRight className="w-5 h-5 text-muted-foreground hidden md:block" />
              </div>

              {user.status === "payment-failed" && (
                <div className="mt-4 pt-4 border-t border-destructive/30 flex items-center justify-between">
                  <p className="text-sm text-destructive font-medium">
                    Payment failed 3 days ago — Account will downgrade to Friend Alert in 11 days
                  </p>
                  <Button size="sm" variant="outline" className="text-destructive border-destructive uppercase text-xs">
                    Contact User
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs md:text-sm text-muted-foreground">Showing 1-4 of 1,247 users</p>
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
            312
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
