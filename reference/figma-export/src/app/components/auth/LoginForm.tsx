import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "../../../lib/validations";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { Shield, LogIn } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "../../contexts/AppContext";
import { useNotifications } from "../notifications/NotificationProvider";
import { useState } from "react";
import { useNavigate } from "react-router";

export function LoginForm() {
  const { login } = useApp();
  const { requestPermission, permission, isSupported } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "user",
      rememberMe: false,
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock user IDs by role
      const userIdByRole = {
        user: "LW-US-8472",
        contact: "CONT-001",
        responder: "RESP-045",
        admin: "ADM-001",
      };

      login(data.role, userIdByRole[data.role]);

      toast.success("Login successful", {
        description: `Logged in as ${data.role}`,
      });

      // Request notification permission after successful login
      if (isSupported && permission === "default") {
        setTimeout(() => {
          requestPermission();
        }, 1000); // Wait 1 second before asking
      }

      // Navigate based on role
      const roleRoutes = {
        user: "/user",
        contact: "/nominated-contact",
        responder: "/responder",
        admin: "/admin",
      };
      navigate(roleRoutes[data.role]);
    } catch (error) {
      toast.error("Login failed", {
        description: "Invalid credentials. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const roleDescriptions = {
    user: "Access your protection plan, pets, and contacts",
    contact: "View your nominated roles and respond to incidents",
    responder: "Manage dispatches and incident responses",
    admin: "Full system access and user management",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        {/* Logo/Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-primary/10">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Legacy Wolf</h1>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Select Role *</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["user", "contact", "responder", "admin"] as const).map((role) => (
                <label
                  key={role}
                  className={`
                    flex items-center justify-center p-3 border rounded-lg cursor-pointer
                    transition-all hover:border-primary/50
                    ${selectedRole === role ? "border-primary bg-primary/5" : "border-border"}
                  `}
                >
                  <input
                    type="radio"
                    value={role}
                    {...register("role")}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium uppercase tracking-wide">
                    {role}
                  </span>
                </label>
              ))}
            </div>
            {selectedRole && (
              <p className="text-xs text-muted-foreground">
                {roleDescriptions[selectedRole]}
              </p>
            )}
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="rounded-lg"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="rounded-lg"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("rememberMe")}
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-sm text-muted-foreground">Remember me</span>
            </label>
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => toast.info("Password reset", { description: "Feature coming soon" })}
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full rounded-full py-6 uppercase font-bold tracking-wide"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>Loading...</>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <button
            className="text-primary hover:underline font-medium"
            onClick={() => toast.info("Sign up", { description: "Feature coming soon" })}
          >
            Sign up
          </button>
        </div>

        {/* Demo Info */}
        <Card className="p-4 bg-muted/30">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Demo Mode:</strong> Any email/password will work.
            Select a role to see different app views.
          </p>
        </Card>
      </Card>
    </div>
  );
}