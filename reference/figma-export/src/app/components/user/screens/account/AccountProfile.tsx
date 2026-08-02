import { useState } from "react";
import { Card } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Badge } from "../../../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { Camera, Upload, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../../ui/sheet";

interface AccountProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountProfile({ open, onOpenChange }: AccountProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    legalFirstName: "Alex",
    legalLastName: "Morgan",
    preferredName: "Alex",
    dateOfBirth: "1985-03-15",
    email: "alex.morgan@email.com",
    phone: "+61 412 345 678",
    emergencyContact: "+61 423 456 789",
    photoUrl: "",
    governmentIdStatus: "verified",
    governmentIdExpiry: "2027-03-15",
  });

  const handleSave = () => {
    // Save logic here
    setIsEditing(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[95vh] overflow-y-auto">
        <SheetHeader className="pb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-black uppercase tracking-tight text-xl">
              Profile
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-left">
            Legal name and identity verification
          </p>
        </SheetHeader>

        <div className="space-y-6 pb-24">
          {/* Profile Photo */}
          <Card className="p-6">
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-4">
              Profile Photo
            </h3>
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profileData.photoUrl} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {profileData.legalFirstName[0]}
                  {profileData.legalLastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-3">
                  This photo helps responders identify you in an emergency
                </p>
                <Button variant="outline" size="sm" className="gap-2">
                  <Camera className="w-4 h-4" />
                  Update Photo
                </Button>
              </div>
            </div>
          </Card>

          {/* Legal Information */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground">
                Legal Information
              </h3>
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Legal First Name
                  </Label>
                  {isEditing ? (
                    <Input
                      value={profileData.legalFirstName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          legalFirstName: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p className="text-base font-medium py-2">
                      {profileData.legalFirstName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Legal Last Name
                  </Label>
                  {isEditing ? (
                    <Input
                      value={profileData.legalLastName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          legalLastName: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p className="text-base font-medium py-2">
                      {profileData.legalLastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Preferred Name
                </Label>
                {isEditing ? (
                  <Input
                    value={profileData.preferredName}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        preferredName: e.target.value,
                      })
                    }
                    placeholder="What you like to be called"
                  />
                ) : (
                  <p className="text-base font-medium py-2">
                    {profileData.preferredName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Date of Birth
                </Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        dateOfBirth: e.target.value,
                      })
                    }
                  />
                ) : (
                  <p className="text-base font-medium py-2">
                    {new Date(profileData.dateOfBirth).toLocaleDateString(
                      "en-AU",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3 mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            )}
          </Card>

          {/* Contact Information */}
          <Card className="p-6">
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-4">
              Contact Information
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Email Address
                </Label>
                <div className="flex items-center gap-2">
                  <p className="text-base font-medium">{profileData.email}</p>
                  <Badge
                    variant="outline"
                    className="border-primary text-primary text-xs"
                  >
                    VERIFIED
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" className="text-xs h-auto p-0">
                  Change email
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Phone Number
                </Label>
                <div className="flex items-center gap-2">
                  <p className="text-base font-medium">{profileData.phone}</p>
                  <Badge
                    variant="outline"
                    className="border-primary text-primary text-xs"
                  >
                    VERIFIED
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" className="text-xs h-auto p-0">
                  Change phone number
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Emergency Contact (Non-Plan)
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  A backup contact for account recovery
                </p>
                <Input
                  value={profileData.emergencyContact}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      emergencyContact: e.target.value,
                    })
                  }
                  placeholder="+61 4XX XXX XXX"
                />
              </div>
            </div>
          </Card>

          {/* Government ID Verification */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground">
                Government ID Verification
              </h3>
              {profileData.governmentIdStatus === "verified" && (
                <Badge className="bg-primary text-primary-foreground gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  VERIFIED
                </Badge>
              )}
            </div>

            {profileData.governmentIdStatus === "verified" ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-lg border border-primary/30">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium mb-1">
                      Australian Driver's License Verified
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Your identity has been verified and meets Legacy Wolf
                      requirements
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Document expires: {new Date(profileData.governmentIdExpiry).toLocaleDateString("en-AU")}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Upload className="w-4 h-4" />
                  Update ID Document
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/30">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium mb-1">ID Verification Required</p>
                    <p className="text-sm text-muted-foreground">
                      Upload a government-issued ID to complete your profile
                    </p>
                  </div>
                </div>
                <Button className="w-full gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Government ID
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Accepted: Australian Driver's License, Passport, Proof of Age
                  Card
                </p>
              </div>
            )}
          </Card>

          {/* Member Information */}
          <Card className="p-6">
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-4">
              Membership
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Member ID
                </Label>
                <p className="text-base font-medium mt-2">LW-US-8472</p>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Member Since
                </Label>
                <p className="text-base font-medium mt-2">November 15, 2025</p>
              </div>
            </div>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}
