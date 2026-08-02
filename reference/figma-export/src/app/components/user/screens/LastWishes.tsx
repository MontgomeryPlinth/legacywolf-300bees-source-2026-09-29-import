import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { FileText, Mic, Lock, Plus, Eye } from "lucide-react";

export function LastWishes() {
  const letters = [
    {
      id: "1",
      recipient: "Sarah Chen",
      status: "completed",
      lastUpdated: "2 weeks ago"
    },
    {
      id: "2",
      recipient: "Marcus Wong",
      status: "draft",
      lastUpdated: "1 month ago"
    }
  ];

  const memos = [
    {
      id: "1",
      title: "For my family",
      duration: "2:34",
      status: "completed",
      lastUpdated: "3 weeks ago"
    }
  ];

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="font-black uppercase tracking-tight text-2xl">LAST WISHES</h2>
        <p className="text-muted-foreground">
          Messages and instructions for after you're gone
        </p>
      </div>

      {/* Privacy Notice */}
      <Card className="p-5 bg-primary/10 border-primary/30">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">End-to-end encrypted</p>
            <p className="text-sm text-muted-foreground">
              These messages are encrypted and only released to your designated recipients when authorized.
            </p>
          </div>
        </div>
      </Card>

      {/* Hand-off Letters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm uppercase tracking-wider font-bold">HAND-OFF LETTERS</h3>
          <Button size="sm" variant="ghost" className="text-primary uppercase tracking-wide">
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>

        {letters.length > 0 ? (
          <div className="space-y-3">
            {letters.map((letter) => (
              <Card key={letter.id} className="p-5 cursor-pointer hover:border-primary/50 transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold">To: {letter.recipient}</h4>
                      <Badge
                        variant={letter.status === "completed" ? "default" : "secondary"}
                        className={letter.status === "completed" ? "bg-primary text-primary-foreground" : ""}
                      >
                        {letter.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Updated {letter.lastUpdated}</p>
                  </div>
                  <Eye className="w-5 h-5 text-muted-foreground" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No letters yet</p>
          </Card>
        )}
      </div>

      {/* Voice Memos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm uppercase tracking-wider font-bold">VOICE MEMOS</h3>
          <Button size="sm" variant="ghost" className="text-primary uppercase tracking-wide">
            <Plus className="w-4 h-4 mr-1" />
            Record
          </Button>
        </div>

        {memos.length > 0 ? (
          <div className="space-y-3">
            {memos.map((memo) => (
              <Card key={memo.id} className="p-5 cursor-pointer hover:border-primary/50 transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Mic className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold">{memo.title}</h4>
                      <Badge className="bg-primary text-primary-foreground">{memo.duration}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Recorded {memo.lastUpdated}</p>
                  </div>
                  <Eye className="w-5 h-5 text-muted-foreground" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Mic className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No voice memos yet</p>
          </Card>
        )}
      </div>

      {/* Digital Vault - Future */}
      <Card className="p-6 bg-muted/30 border-dashed">
        <div className="text-center space-y-3">
          <Lock className="w-10 h-10 text-muted-foreground mx-auto" />
          <div>
            <h4 className="font-bold mb-1">Digital Vault</h4>
            <p className="text-sm text-muted-foreground">
              Coming soon: Secure storage for passwords, accounts, and digital assets
            </p>
          </div>
          <Badge variant="secondary">FUTURE FEATURE</Badge>
        </div>
      </Card>

      {/* Info */}
      <Card className="p-5 bg-muted/30">
        <div className="space-y-2">
          <h4 className="font-bold text-sm uppercase tracking-wide">DELIVERY TRIGGERS</h4>
          <p className="text-sm text-muted-foreground">
            You control when each letter or memo is delivered:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
            <li>On activation (when your alert triggers)</li>
            <li>On confirmed death</li>
            <li>On family arrival</li>
            <li>Custom timing you specify</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
