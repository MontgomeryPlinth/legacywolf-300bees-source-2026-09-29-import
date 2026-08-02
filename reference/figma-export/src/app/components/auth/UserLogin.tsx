import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { Shield, ArrowLeft, LogIn } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "../../contexts/AppContext";
import { useNotifications } from "../notifications/NotificationProvider";
import { useNavigate } from "react-router";

export function UserLogin() {
  const { login } = useApp();
  const { requestPermission, permission, isSupported } = useNotifications();
  const navigate = useNavigate();

  const handleLogin = () => {
    login("user", "LW-US-8472");

    if (isSupported && permission === "default") {
      setTimeout(() => {
        requestPermission();
      }, 500);
    }

    navigate("/user");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Shield className="w-16 h-16 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-tight">
              User Login
            </h1>
            <p className="text-muted-foreground">
              Access your protection plan and check your motion timer
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="p-8">
          <div className="space-y-6">
            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="uppercase text-xs font-bold tracking-wide">
                Mobile Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="04XX XXX XXX"
                className="h-12"
                defaultValue="0412 345 678"
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
                className="text-sm text-primary hover:underline"
                onClick={() => toast.info("Password reset", { description: "Check your mobile for reset instructions" })}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <Button
              onClick={handleLogin}
              className="w-full h-12 rounded-full uppercase font-bold tracking-wide"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </Button>
          </div>
        </Card>

        {/* Demo Info */}
        <Card className="p-4 bg-primary/10 border-primary">
          <p className="text-sm text-center">
            <strong>Demo Mode:</strong> Any phone number + password: 123456
          </p>
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
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-primary hover:underline font-medium"
            >
              Sign up free
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}