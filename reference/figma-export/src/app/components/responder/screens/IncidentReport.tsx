import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Textarea } from "../../ui/textarea";
import { FileText, Camera, CheckCircle, Clock, AlertCircle } from "lucide-react";

export function IncidentReport() {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="font-black uppercase tracking-tight text-2xl">INCIDENT REPORT</h2>
        <p className="text-muted-foreground">
          Document dispatch #LW-2346
        </p>
      </div>

      {/* Incident Summary */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-sm uppercase tracking-wider font-bold">INCIDENT SUMMARY</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">DISPATCH ID</p>
            <p className="font-medium">#LW-2346</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">USER</p>
            <p className="font-medium">Alex Morgan</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">ACCEPTED</p>
            <p className="font-medium">10:23 AM</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground tracking-wide mb-1">ARRIVED</p>
            <p className="font-medium">10:45 AM</p>
          </div>
        </div>
      </Card>

      {/* Auto-populated Timeline */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="text-sm uppercase tracking-wider font-bold">TIMELINE</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Dispatch accepted</p>
                <p className="text-xs text-muted-foreground">10:23 AM</p>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">En route to property</p>
                <p className="text-xs text-muted-foreground">10:24 AM</p>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Arrived at property</p>
                <p className="text-xs text-muted-foreground">10:45 AM</p>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Property accessed</p>
                <p className="text-xs text-muted-foreground">10:48 AM</p>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">User check completed</p>
                <p className="text-xs text-muted-foreground">10:52 AM</p>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Pet secured — Guardian contacted</p>
                <p className="text-xs text-muted-foreground">10:58 AM</p>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Pants On checklist completed</p>
                <p className="text-xs text-muted-foreground">11:12 AM</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* User Status */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm uppercase tracking-wider font-bold">USER STATUS ON ARRIVAL</h3>
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start rounded-full">
            <div className="w-4 h-4 rounded-full border-2 border-primary mr-3" />
            Alive & responsive
          </Button>
          <Button variant="outline" className="w-full justify-start rounded-full">
            <div className="w-4 h-4 rounded-full border-2 border-primary mr-3" />
            Alive & unresponsive
          </Button>
          <Button variant="default" className="w-full justify-start rounded-full bg-primary">
            <div className="w-4 h-4 rounded-full bg-background mr-3 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary-foreground" />
            </div>
            Deceased
          </Button>
          <Button variant="outline" className="w-full justify-start rounded-full">
            <div className="w-4 h-4 rounded-full border-2 border-primary mr-3" />
            Not at home
          </Button>
        </div>
      </Card>

      {/* Narrative */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm uppercase tracking-wider font-bold">NARRATIVE</h3>
        <Textarea
          placeholder="Describe what you observed on scene, actions taken, and any notable circumstances..."
          className="min-h-[150px] rounded-xl"
        />
      </Card>

      {/* Photo Documentation */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm uppercase tracking-wider font-bold">PHOTO DOCUMENTATION</h3>
          <Badge variant="outline">6 PHOTOS</Badge>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-lg bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/70 transition-colors"
            >
              <Camera className="w-8 h-8 text-muted-foreground" />
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full rounded-full uppercase font-medium tracking-wide">
          <Camera className="w-4 h-4 mr-2" />
          Add Photos
        </Button>
      </Card>

      {/* Emergency Services */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm uppercase tracking-wider font-bold">EMERGENCY SERVICES CALLED</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="w-5 h-5 rounded border-2 border-primary bg-primary flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm">Ambulance (000 called at 10:50 AM)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="w-5 h-5 rounded border-2 border-primary bg-primary flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm">Police (000 called at 10:51 AM)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="w-5 h-5 rounded border-2 border-muted-foreground" />
            <span className="text-sm">None required</span>
          </label>
        </div>
      </Card>

      {/* Contacts Notified */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm uppercase tracking-wider font-bold">CONTACTS NOTIFIED</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Sarah Chen (Nominated Contact)</p>
              <p className="text-sm text-muted-foreground">Called at 10:55 AM</p>
            </div>
            <CheckCircle className="w-5 h-5 text-primary" />
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Sarah Chen (Pet Guardian)</p>
              <p className="text-sm text-muted-foreground">Arrived at 11:20 AM</p>
            </div>
            <CheckCircle className="w-5 h-5 text-primary" />
          </div>
        </div>
      </Card>

      {/* Sign Off */}
      <Card className="p-5 bg-primary/10 border-primary/30">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-2">Sign off confirmation</p>
            <p className="text-sm text-muted-foreground mb-4">
              By submitting this report, you confirm all information is accurate and complete to the best of your knowledge.
            </p>
            <div className="text-sm">
              <p className="font-medium">Emma Rodriguez</p>
              <p className="text-muted-foreground">Registered Nurse • License #NMW0123456</p>
              <p className="text-muted-foreground">Saturday, May 23, 2026 11:35 AM</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Submit */}
      <div className="space-y-3">
        <Button className="w-full rounded-full py-6 uppercase font-bold tracking-wide" size="lg">
          Submit Report for Review
        </Button>
        <Button variant="outline" className="w-full rounded-full uppercase font-medium tracking-wide">
          Save Draft
        </Button>
      </div>
    </div>
  );
}
