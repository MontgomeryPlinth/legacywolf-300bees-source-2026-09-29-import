import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { FileText, Phone, MapPin, Key, Dog, Clock, Shield } from "lucide-react";
import { useNavigate } from "react-router";

export function MyRole() {
  const navigate = useNavigate();

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Status */}
      <div className="flex justify-center">
        <Badge className="bg-primary text-primary-foreground px-6 py-2 text-sm uppercase font-bold tracking-wide rounded-full">
          <Shield className="w-4 h-4 mr-2 inline" />
          Verified Contact
        </Badge>
      </div>

      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="font-black uppercase tracking-tight text-2xl">YOUR ROLE</h2>
        <p className="text-muted-foreground">
          Here's what Alex has asked you to do if the time comes
        </p>
      </div>

      {/* User Info */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-black text-2xl">
            AM
          </div>
          <div>
            <h3 className="text-xl font-bold">Alex Morgan</h3>
            <p className="text-sm text-muted-foreground">Named you: November 15, 2025</p>
          </div>
        </div>
      </Card>

      {/* Instructions from Alex */}
      <Card className="p-6 space-y-4 border-2 border-primary/30">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-sm uppercase tracking-wider font-bold">INSTRUCTIONS FOR YOU</h3>
        </div>
        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm italic">
            "Sarah, you're my closest friend and you know Daisy well. If something happens to me, please make sure she's calm and gets to your place safely. The responder will contact you. My spare house key is where you know it is. Thank you for being there."
          </p>
        </div>
      </Card>

      {/* What You Have Access To */}
      <div className="space-y-4">
        <h3 className="text-sm uppercase tracking-wider font-bold">WHAT YOU HAVE ACCESS TO</h3>
        <Card className="p-5">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Emergency notifications</p>
                <p className="text-sm text-muted-foreground">Via SMS, push, and voice call</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Property address</p>
                <p className="text-sm text-muted-foreground">••••••••••••••</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Access details</p>
                <p className="text-sm text-muted-foreground">Unlocked during active incident only</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Dog className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Pet information (Daisy)</p>
                <p className="text-sm text-muted-foreground">You're designated as Primary Pet Guardian</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* What Gets Unlocked */}
      <Card className="p-5 bg-muted/30">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-2">When an incident activates:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc ml-4">
              <li>You'll receive immediate notification</li>
              <li>Property address and access details revealed</li>
              <li>Pet care instructions and vet contact</li>
              <li>Coordination with responder (if dispatched)</li>
              <li>Real-time status updates</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Test Drills */}
      <Card className="p-5 border-2 border-border">
        <h4 className="font-bold mb-2">Practice Drills</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Alex may run test drills to make sure alerts reach you. You'll be clearly notified when it's a test.
        </p>
        <Button
          variant="outline"
          className="w-full rounded-full uppercase font-medium tracking-wide"
          onClick={() => navigate("/nominated-contact/drill")}
        >
          View Sample Drill
        </Button>
      </Card>

      {/* Emergency Contact */}
      <Card className="p-5 bg-destructive/10 border-destructive/30">
        <div className="flex items-start gap-3">
          <Phone className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Questions or concerns?</p>
            <p className="text-xl font-black text-destructive">1800 LEGACY (1800 534 229)</p>
            <p className="text-xs text-muted-foreground mt-1">24/7 support line</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
