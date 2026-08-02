import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Shield, Heart, Check, Info } from "lucide-react";
import { useNavigate } from "react-router";

export function InviteLanding() {
  const navigate = useNavigate();

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Logo */}
      <div className="text-center">
        <Shield className="w-16 h-16 text-primary mx-auto mb-4" strokeWidth={1.5} />
        <h1 className="font-black uppercase tracking-tight text-2xl mb-2">LEGACY WOLF</h1>
      </div>

      {/* Main Message */}
      <Card className="p-8 text-center space-y-4">
        <Heart className="w-12 h-12 text-primary mx-auto" />
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Alex Morgan has named you as a Nominated Contact</h2>
          <p className="text-muted-foreground">
            This means Alex trusts you to be notified if they become unresponsive and need help.
          </p>
        </div>
      </Card>

      {/* What This Means */}
      <div className="space-y-4">
        <h3 className="text-sm uppercase tracking-wider font-bold">WHAT THIS MEANS</h3>
        <Card className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">You'll be notified in an emergency</p>
              <p className="text-sm text-muted-foreground">
                If Alex doesn't respond to their Motion Timer check-in, you'll receive an alert with instructions.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">You'll have access to what you need</p>
              <p className="text-sm text-muted-foreground">
                Alex has pre-authorized what information and access details you'll receive.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">You're not alone</p>
              <p className="text-sm text-muted-foreground">
                Legacy Wolf coordinates the response. You'll know what's happening and when.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Info Box */}
      <Card className="p-5 bg-primary/10 border-primary/30">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Legacy Wolf is a monitoring service for people living solo. It protects what matters when they can't — their pets, property, and dignity.
          </p>
        </div>
      </Card>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          className="w-full rounded-full py-6 uppercase font-bold tracking-wide"
          size="lg"
          onClick={() => navigate("/nominated-contact/my-role")}
        >
          Accept Role
        </Button>
        <Button
          variant="outline"
          className="w-full rounded-full py-4 uppercase font-medium tracking-wide"
        >
          View Details First
        </Button>
        <Button
          variant="ghost"
          className="w-full text-muted-foreground"
        >
          Ask Me Later
        </Button>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground">
        By accepting, you confirm you understand your role and will respond to alerts.
      </p>
    </div>
  );
}
