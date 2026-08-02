import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { Lock, ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "../../contexts/AppContext";
import { useState } from "react";
import { useNavigate } from "react-router";

export function AdminLogin() {
  const { login } = useApp();
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("email");
  const navigate = useNavigate();

  const handleLogin = () => {
    login("admin", "ADM-001");

    toast.success("Access granted", {
      description: "Welcome to the admin dashboard.",
    });

    navigate("/admin");
  };

  const handleMethodChange = (method: "phone" | "email") => {
    setLoginMethod(method);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Lock className="w-16 h-16 text-purple-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-tight">
              Admin Access
            </h1>
            <p className="text-muted-foreground">
              Authorized personnel only — all access is logged
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="p-8 border-purple-500">
          <div className="space-y-6">
            {/* Login Method Toggle */}
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              <button
                type="button"
                onClick={() => setLoginMethod("phone")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === "phone"
                    ? "bg-purple-500 text-white"
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
                    ? "bg-purple-500 text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Email
              </button>
            </div>

            {/* Phone or Email */}
            <div className="space-y-2">
              <Label htmlFor="identifier" className="uppercase text-xs font-bold tracking-wide">
                {loginMethod === "phone" ? "Mobile Number" : "Admin Email"}
              </Label>
              <Input
                id="identifier"
                type={loginMethod === "phone" ? "tel" : "email"}
                placeholder={loginMethod === "phone" ? "04XX XXX XXX" : "admin@legacywolf.com"}
                className="h-12"
                defaultValue={loginMethod === "phone" ? "0400 000 000" : "admin@legacywolf.com"}
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
                className="text-sm text-purple-500 hover:underline"
                onClick={() => toast.info("Password reset", { description: "Contact IT support for admin password reset" })}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <Button
              onClick={handleLogin}
              className="w-full h-12 rounded-full uppercase font-bold tracking-wide bg-purple-500 hover:bg-purple-600"
            >
              <ShieldCheck className="w-5 h-5 mr-2" />
              Access Dashboard
            </Button>
          </div>
        </Card>

        {/* Security Notice */}
        <Card className="p-4 bg-purple-500/10 border-purple-500">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Security Notice</p>
              <p className="text-muted-foreground">
                All admin actions are logged and monitored. This system handles sensitive user data — access responsibly.
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
            Need admin access?{" "}
            <button
              onClick={() => toast.info("Contact IT", { description: "Email it@legacywolf.com for access requests" })}
              className="text-purple-500 hover:underline"
            >
              Contact IT
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}