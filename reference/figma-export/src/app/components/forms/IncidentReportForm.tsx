import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { incidentReportSchema, type IncidentReportFormData } from "../../../lib/validations";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card } from "../ui/card";
import { AlertTriangle, Send } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "../../contexts/AppContext";
import { Checkbox } from "../ui/checkbox";

interface IncidentReportFormProps {
  userId?: string;
  onSuccess?: (incidentId: string) => void;
  onCancel?: () => void;
}

export function IncidentReportForm({ userId, onSuccess, onCancel }: IncidentReportFormProps) {
  const { createIncident, availableResponders } = useApp();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<IncidentReportFormData>({
    resolver: zodResolver(incidentReportSchema),
    defaultValues: {
      userId: userId || "",
      priority: "high",
      services: [],
      notes: "",
      dispatchResponder: false,
      responderId: "",
    },
  });

  const shouldDispatch = watch("dispatchResponder");
  const selectedServices = watch("services");

  const availableServices = [
    { id: "friend-alert", label: "Friend Alert" },
    { id: "attend-check", label: "Attend & Check" },
    { id: "pet-guardian", label: "Pet Guardian" },
    { id: "reputation-guard", label: "Reputation Guard" },
  ];

  const toggleService = (serviceId: string) => {
    const current = selectedServices || [];
    if (current.includes(serviceId)) {
      setValue("services", current.filter(s => s !== serviceId));
    } else {
      setValue("services", [...current, serviceId]);
    }
  };

  const onSubmit = async (data: IncidentReportFormData) => {
    try {
      createIncident(data.userId);

      toast.success("Incident created", {
        description: "Emergency response initiated",
      });

      if (data.dispatchResponder && data.responderId) {
        toast.info("Responder dispatched", {
          description: "Responder has been notified",
        });
      }

      onSuccess?.("INC-2026-XXX");
    } catch (error) {
      toast.error("Failed to create incident", {
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
            <AlertTriangle className="w-6 h-6 text-destructive" />
            <h2 className="text-2xl font-black uppercase tracking-tight">Create Incident</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Trigger an emergency response for a user
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* User ID */}
          <div className="space-y-2">
            <Label htmlFor="userId">User ID *</Label>
            <Input
              id="userId"
              placeholder="LW-US-XXXX"
              className="rounded-lg font-mono"
              {...register("userId")}
            />
            {errors.userId && (
              <p className="text-sm text-destructive">{errors.userId.message}</p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority *</Label>
            <select
              id="priority"
              className="w-full h-10 px-3 rounded-lg border border-border bg-background"
              {...register("priority")}
            >
              <option value="critical">Critical - Life threatening</option>
              <option value="high">High - Urgent response needed</option>
              <option value="medium">Medium - Standard response</option>
              <option value="low">Low - Non-urgent</option>
            </select>
            {errors.priority && (
              <p className="text-sm text-destructive">{errors.priority.message}</p>
            )}
          </div>

          {/* Services */}
          <div className="space-y-3">
            <Label>Services to Activate *</Label>
            <div className="space-y-2">
              {availableServices.map((service) => (
                <div key={service.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={service.id}
                    checked={selectedServices?.includes(service.id)}
                    onCheckedChange={() => toggleService(service.id)}
                  />
                  <label
                    htmlFor={service.id}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {service.label}
                  </label>
                </div>
              ))}
            </div>
            {errors.services && (
              <p className="text-sm text-destructive">{errors.services.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Incident Notes *</Label>
            <Textarea
              id="notes"
              placeholder="Describe the situation, reason for triggering, and any relevant details..."
              className="rounded-lg min-h-[120px]"
              {...register("notes")}
            />
            <p className="text-xs text-muted-foreground">
              Minimum 10 characters required
            </p>
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>

          {/* Dispatch Responder */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dispatchResponder"
                {...register("dispatchResponder")}
              />
              <label
                htmlFor="dispatchResponder"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Immediately dispatch a responder
              </label>
            </div>

            {shouldDispatch && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="responderId">Select Responder</Label>
                <select
                  id="responderId"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background"
                  {...register("responderId")}
                >
                  <option value="">Auto-assign nearest available responder</option>
                  {availableResponders.map((responder) => (
                    <option key={responder.id} value={responder.id}>
                      {responder.name} - {responder.location.address} ({responder.rating}⭐)
                    </option>
                  ))}
                </select>
                {errors.responderId && (
                  <p className="text-sm text-destructive">{errors.responderId.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Warning */}
          <Card className="p-4 bg-destructive/10 border-destructive/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">Critical Action</p>
                <p className="text-sm text-muted-foreground">
                  Creating an incident will trigger emergency protocols and may dispatch responders.
                  Ensure all details are accurate before proceeding.
                </p>
              </div>
            </div>
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
              disabled={isSubmitting}
              className="flex-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                "Creating..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Create Incident
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
