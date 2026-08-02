import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { Radio, ArrowLeft, Clock } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "../../contexts/AppContext";
import { useNotifications } from "../notifications/NotificationProvider";
import { useState } from "react";
import { useNavigate } from "react-router";

export function ResponderLogin() {
  const { login } = useApp();
  const { requestPermission, permission, isSupported } = useNotifications();
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
  const navigate = useNavigate();

  const handleLogin = () => {
    login("responder", "RESP-045");

    toast.success("Clocked in", {
      description: "Ready for dispatch. Stay safe out there.",
    });

    if (isSupported && permission === "default") {
      setTimeout(() => {
        requestPermission();
      }, 500);
    }

    navigate("/responder");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Radio className="w-16 h-16 text-orange-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-tight">
              Responder Portal
            </h1>
            <p className="text-muted-foreground">
              Clock in to view dispatches and manage active incidents
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="p-8 border-orange-500">
          <div className="space-y-6">
            {/* Login Method Toggle */}
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              <button
                type="button"
                onClick={() => setLoginMethod("phone")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === "phone"
                    ? "bg-orange-500 text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Mobile
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod("email")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === "email"
                    ? "bg-orange-500 text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Email
              </button>
            </div>

            {/* Phone or Email */}
            <div className="space-y-2">
              <Label htmlFor="identifier" className="uppercase text-xs font-bold tracking-wide">
                {loginMethod === "phone" ? "Mobile Number" : "Work Email"}
              </Label>
              <Input
                id="identifier"
                type={loginMethod === "phone" ? "tel" : "email"}
                placeholder={loginMethod === "phone" ? "04XX XXX XXX" : "your.name@legacywolf.com"}
                className="h-12"
                defaultValue={loginMethod === "phone" ? "0412 789 456" : "james.mitchell@legacywolf.com"}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="uppercase text-xs font-bold tracking-wide">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="h-12"
                defaultValue="123456"
              />
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-orange-500 hover:underline"
                onClick={() => toast.info("Password reset", { description: "Contact your supervisor for assistance" })}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <Button
              onClick={handleLogin}
              className="w-full h-12 rounded-full uppercase font-bold tracking-wide bg-orange-500 hover:bg-orange-600"
            >
              <Clock className="w-5 h-5 mr-2" />
              Clock In
            </Button>
          </div>
        </Card>

        {/* Safety Info */}
        <Card className="p-4 bg-orange-500/10 border-orange-500">
          <div className="flex items-start gap-3">
            <Radio className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Remember: Safety First</p>
              <p className="text-muted-foreground">
                Review all dispatch details carefully. If a situation feels unsafe, contact your supervisor immediately.
              </p>
            </div>
          </div>
        </Card>

        {/* Back Link */}
        <div className="text-center">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to role selection
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Need access?{" "}
            <button
              onClick={() => toast.info("Contact HR", { description: "Reach out to hr@legacywolf.com" })}
              className="text-orange-500 hover:underline"
            >
              Contact HR
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}