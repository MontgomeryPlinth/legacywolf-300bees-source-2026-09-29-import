import { useNavigate } from "react-router";
import { Card } from "./ui/card";
import { Shield, UserCircle, HeartHandshake, Settings } from "lucide-react";

export function RoleSelector() {
  const navigate = useNavigate();

  const roles = [
    {
      id: "user",
      title: "USER",
      description: "Set up and maintain your protection plan",
      icon: UserCircle,
      path: "/user",
      color: "from-guardian-green/20 to-guardian-green/5"
    },
    {
      id: "nominated-contact",
      title: "NOMINATED CONTACT",
      description: "View alerts and emergency instructions",
      icon: HeartHandshake,
      path: "/nominated-contact",
      color: "from-mist/20 to-mist/5"
    },
    {
      id: "responder",
      title: "RESPONDER",
      description: "Accredited Legacy Wolf Responder portal",
      icon: Shield,
      path: "/responder",
      color: "from-guardian-green/30 to-guardian-green/10"
    },
    {
      id: "admin",
      title: "ADMIN",
      description: "Legacy Wolf operations dashboard",
      icon: Settings,
      path: "/admin",
      color: "from-slate/20 to-slate/5"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <div className="max-w-6xl w-full space-y-12">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Shield className="w-12 h-12 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="font-black uppercase tracking-tight" style={{ fontSize: '3rem', lineHeight: '1' }}>
            LEGACY WOLF
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto" style={{ fontSize: '1.125rem' }}>
            Sixty more minutes of control — exactly when you can't be there.
          </p>
        </div>

        {/* Role Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card
                key={role.id}
                className={`p-8 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 bg-gradient-to-br ${role.color} backdrop-blur-sm border-2 border-border`}
                onClick={() => navigate(role.path)}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <Icon className="w-10 h-10 text-primary" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="font-black uppercase tracking-wide" style={{ fontSize: '1.5rem' }}>
                      {role.title}
                    </h2>
                    <p className="text-muted-foreground" style={{ fontSize: '1rem' }}>
                      {role.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Select a role to view the corresponding interface</p>
        </div>
      </div>
    </div>
  );
}
