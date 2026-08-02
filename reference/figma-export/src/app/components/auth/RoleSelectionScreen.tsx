import { Card } from "../ui/card";
import { Shield, Users, Radio, Lock } from "lucide-react";
import { useNavigate } from "react-router";

export function RoleSelectionScreen() {
  const navigate = useNavigate();

  const roles = [
    {
      id: "user",
      title: "User",
      icon: Shield,
      description: "Access your protection plan and manage your emergency settings",
      color: "text-primary border-primary hover:bg-primary/10",
      path: "/login/user"
    },
    {
      id: "contact",
      title: "Nominated Contact",
      icon: Users,
      description: "Respond to emergency alerts and view your role in someone's safety network",
      color: "text-primary border-primary hover:bg-primary/10",
      path: "/login/contact"
    },
    {
      id: "responder",
      title: "Responder",
      icon: Radio,
      description: "Clock in, view dispatches, and manage your active incidents",
      color: "text-orange-500 border-orange-500 hover:bg-orange-500/10",
      path: "/login/responder"
    },
    {
      id: "admin",
      title: "Admin",
      icon: Lock,
      description: "Monitor system operations and manage users, incidents, and responders",
      color: "text-purple-500 border-purple-500 hover:bg-purple-500/10",
      path: "/login/admin"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Shield className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight">
            Legacy Wolf
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Select your account type to continue
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card
                key={role.id}
                className={`p-6 cursor-pointer transition-all duration-200 border-2 ${role.color}`}
                onClick={() => navigate(role.path)}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Icon className="w-8 h-8" />
                    <h2 className="text-xl font-bold uppercase tracking-wide">
                      {role.title}
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {role.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Sign-up CTA */}
        <div className="text-center space-y-1">
          <p className="text-sm text-muted-foreground">New to Legacy Wolf?</p>
          <button
            onClick={() => navigate("/signup")}
            className="text-primary font-bold text-sm hover:underline uppercase tracking-wide"
          >
            Sign up — 4-week free trial
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>Need help? Contact support at support@legacywolf.com.au</p>
        </div>
      </div>
    </div>
  );
}