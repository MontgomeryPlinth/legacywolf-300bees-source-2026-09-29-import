import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userProfileSchema, type UserProfileFormData } from "../../../lib/validations";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { User, Mail, Phone, Save } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "../../contexts/AppContext";

interface ProfileEditFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProfileEditForm({ onSuccess, onCancel }: ProfileEditFormProps) {
  const { user, updateUser } = useApp();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  });

  const onSubmit = async (data: UserProfileFormData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      updateUser(data);

      toast.success("Profile updated", {
        description: "Your changes have been saved",
      });

      onSuccess?.();
    } catch (error) {
      toast.error("Update failed", {
        description: "Please try again",
      });
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-black uppercase tracking-tight">Edit Profile</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Update your personal information
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name *
            </Label>
            <Input
              id="name"
              placeholder="Your full name"
              className="rounded-lg"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address *
            </Label>
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
            <p className="text-xs text-muted-foreground">
              We'll send important notifications to this email
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number *
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+61 XXX XXX XXX"
              className="rounded-lg"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Australian format: +61 followed by your number
            </p>
          </div>

          {/* Info Card */}
          <Card className="p-4 bg-muted/30">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Important:</strong> Changes to your email or
              phone number will require verification before taking effect.
            </p>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 rounded-full"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="flex-1 rounded-full"
            >
              {isSubmitting ? (
                "Saving..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
