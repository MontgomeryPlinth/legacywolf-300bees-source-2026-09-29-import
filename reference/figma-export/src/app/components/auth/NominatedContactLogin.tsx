import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { Users, ArrowLeft, LogIn, Heart, Phone, Lock } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "../../contexts/AppContext";
import { useNotifications } from "../notifications/NotificationProvider";
import { useNavigate } from "react-router";

export function NominatedContactLogin() {
  const { login } = useApp();
  const { requestPermission, permission, isSupported } = useNotifications();
  const navigate = useNavigate();

  const handleLogin = () => {
    login("contact", "CONT-001");

    toast.success("Welcome", {
      description: "You're here for someone who matters. Thank you.",
    });

    if (isSupported && permission === "default") {
      setTimeout(() => {
        requestPermission();
      }, 500);
    }

    navigate("/nominated-contact");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm uppercase tracking-wide font-medium">Back</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          {/* Title Section */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Users className="w-16 h-16 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight">Nominated Contact</h1>
              <p className="text-muted-foreground">
                Access your emergency contact dashboard
              </p>
            </div>
          </div>

          {/* Login Card */}
          <Card className="p-8 border-primary">
            <div className="space-y-6">
              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="uppercase text-xs font-bold tracking-wide">
                  Mobile Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="pl-12 h-12"
                    defaultValue="0423 567 890"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="uppercase text-xs font-bold tracking-wide">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-12 h-12"
                    defaultValue="123456"
                  />
                </div>
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => toast.info("Password reset", { description: "Check your mobile for reset instructions" })}
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <Button
                onClick={handleLogin}
                className="w-full h-12 rounded-full uppercase font-bold tracking-wide bg-primary hover:bg-primary/90"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Log In
              </Button>
            </div>
          </Card>

          {/* Info Card */}
          <Card className="p-4 bg-primary/10 border-primary">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Your Role Matters</p>
                <p className="text-muted-foreground">
                  You've been trusted to be someone's emergency contact. Thank you for being there when it matters most.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}