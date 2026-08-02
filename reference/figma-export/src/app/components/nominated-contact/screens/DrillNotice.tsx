import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

export function DrillNotice() {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Test Banner */}
      <Card className="p-6 bg-primary/10 border-2 border-primary">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h2 className="text-xl font-black uppercase tracking-wide mb-2">THIS IS A TEST</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Alex Morgan is running a practice drill to verify their emergency plan works correctly.
            </p>
            <Badge className="bg-primary text-primary-foreground">DRILL ACTIVE</Badge>
          </div>
        </div>
      </Card>

      {/* What This Means */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm uppercase tracking-wider font-bold">WHAT THIS MEANS</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">This is not a real emergency</p>
              <p className="text-sm text-muted-foreground">
                Alex is testing their Legacy Wolf plan to ensure notifications reach you correctly.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">No action required from you</p>
              <p className="text-sm text-muted-foreground">
                Simply acknowledge this test so Alex knows their alert system is working.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Why drills matter</p>
              <p className="text-sm text-muted-foreground">
                Practice runs help catch issues like outdated phone numbers or notification settings before a real emergency.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Sample Alert Preview */}
      <Card className="p-6 space-y-4 bg-muted/30 border-dashed border-2">
        <h3 className="text-sm uppercase tracking-wider font-bold">WHAT A REAL ALERT LOOKS LIKE</h3>
        <Card className="p-4 bg-destructive/10 border-destructive">
          <div className="space-y-2">
            <Badge className="bg-destructive text-white text-xs">ACTIVE INCIDENT</Badge>
            <p className="font-black text-lg">ALEX IS UNRESPONSIVE</p>
            <p className="text-sm text-muted-foreground">
              Alex has not responded to Motion Timer check-in. You have been activated.
            </p>
            <Button className="w-full rounded-full uppercase font-bold tracking-wide mt-3" size="sm">
              View Instructions
            </Button>
          </div>
        </Card>
        <p className="text-xs text-muted-foreground">
          During a real incident, this would include property access details, pet information, and responder coordination.
        </p>
      </Card>

      {/* Acknowledge */}
      <div className="space-y-3">
        <Button className="w-full rounded-full py-6 uppercase font-bold tracking-wide" size="lg">
          <CheckCircle className="w-5 h-5 mr-2" />
          Acknowledge Test
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          This confirms you received the drill notification
        </p>
      </div>

      {/* Info */}
      <Card className="p-5 bg-muted/30">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Regular drills build confidence.</strong> Alex can run practice alerts periodically to ensure their protection plan is ready when needed. Each drill helps verify contact details and notification delivery.
        </p>
      </Card>
    </div>
  );
}
