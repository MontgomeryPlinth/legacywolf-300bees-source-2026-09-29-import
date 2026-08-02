import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../../ui/sheet";
import { Button } from "../../ui/button";
import {
  MessageSquare,
  PhoneCall,
  MapPin,
  UserPlus,
  Trash2,
  Plus,
  AlertTriangle,
  X,
  ListOrdered,
  GripVertical,
} from "lucide-react";
import { useState, useRef } from "react";
import { useApp } from "../../../contexts/AppContext";
import { type ResponseQueueStep, type QueueStepType, validateQueue } from "../../../contexts/AppContext";
import { AddQueueStepSheet } from "./AddQueueStepSheet";
import { toast } from "sonner";

interface ResponseQueueSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEP_ICON: Record<QueueStepType, React.ElementType> = {
  "text-user":      MessageSquare,
  "call-user":      PhoneCall,
  "attend-address": MapPin,
  "text-contact":   UserPlus,
  "call-contact":   PhoneCall,
};

const STEP_LABEL: Record<QueueStepType, (name?: string) => string> = {
  "text-user":      () => "Text to me",
  "call-user":      () => "Call to me",
  "attend-address": () => "Attend my address",
  "text-contact":   (n) => `Text to ${n ?? "contact"}`,
  "call-contact":   (n) => `Call ${n ?? "contact"}`,
};

export function ResponseQueueSheet({ open, onOpenChange }: ResponseQueueSheetProps) {
  const {
    responseQueue,
    reorderQueueSteps,
    removeQueueStep,
    saveQueue,
    discardQueue,
    dismissSubstitutionNotice,
    people,
  } = useApp();

  const [showAddSheet, setShowAddSheet] = useState(false);

  // Drag state
  const dragIndex = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const { staged, isDirty, substitutionNotice } = responseQueue;

  const handleDragStart = (index: number) => {
    dragIndex.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOver(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === dropIndex) { setDragOver(null); return; }

    const next = [...staged];
    const [moved] = next.splice(from, 1);
    next.splice(dropIndex, 0, moved);

    const err = validateQueue(next);
    if (err) { toast.error(err); setDragOver(null); return; }

    reorderQueueSteps(next);
    dragIndex.current = null;
    setDragOver(null);
  };

  const handleDragEnd = () => {
    dragIndex.current = null;
    setDragOver(null);
  };

  const handleRemove = (step: ResponseQueueStep) => {
    const preview = staged.filter(s => s.id !== step.id);
    const err = validateQueue(preview);
    if (err) { toast.error(err); return; }
    removeQueueStep(step.id);
  };

  const handleSave = () => {
    const err = validateQueue(staged);
    if (err) { toast.error(err); return; }
    saveQueue();
    toast.success("Response queue saved");
  };

  const handleDiscard = () => {
    discardQueue();
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="inset-x-2 bottom-2 rounded-2xl h-[88vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl uppercase tracking-wide font-black flex items-center gap-2">
              <ListOrdered className="w-6 h-6 text-primary" />
              Response Queue
            </SheetTitle>
            <SheetDescription className="text-base">
              Steps run in order — if one gets a response, we stop. Drag to reorder.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 pt-5 pb-32">
            {/* Substitution notice */}
            {substitutionNotice && (
              <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-200 flex-1 leading-relaxed">{substitutionNotice}</p>
                <button onClick={dismissSubstitutionNotice} className="text-muted-foreground hover:text-foreground flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step cards — draggable */}
            <div className="space-y-1">
              {staged.map((step, index) => {
                const Icon = STEP_ICON[step.type];
                const contactName = step.contactId
                  ? people.find(p => p.id === step.contactId)?.name
                  : undefined;
                const label = STEP_LABEL[step.type](contactName);
                const isDragTarget = dragOver === index;

                return (
                  <div key={step.id}>
                    <div
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-3 bg-card border rounded-2xl p-3.5 cursor-grab active:cursor-grabbing transition-all select-none ${
                        isDragTarget ? "border-primary bg-primary/5 scale-[1.01]" : "border-border"
                      }`}
                    >
                      {/* Drag handle */}
                      <GripVertical className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />

                      {/* Number badge */}
                      <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-black text-primary">{index + 1}</span>
                      </div>

                      {/* Icon circle */}
                      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Icon className="text-black" style={{ width: 18, height: 18, strokeWidth: 2.5 }} />
                      </div>

                      {/* Label */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{label}</p>
                        {step.type === "attend-address" && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {step.authorityLevel === "enter" ? "Enter if no answer" : "Knock only"}
                          </p>
                        )}
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => handleRemove(step)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Connector */}
                    {index < staged.length - 1 && (
                      <div className="flex items-center gap-2 px-4 py-1">
                        <div className="w-px h-4 bg-border ml-[34px]" />
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                          If no response, then:
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Terminal */}
              <div className="flex items-center gap-2 px-4 py-1">
                <div className="w-px h-4 bg-border ml-[34px]" />
              </div>
              <div className="flex items-center gap-3 bg-card/40 border border-dashed border-border rounded-2xl p-3.5">
                <GripVertical className="w-4 h-4 opacity-0 flex-shrink-0" />
                <div className="w-6 h-6 rounded-full bg-border/50 flex items-center justify-center flex-shrink-0">
                  <X className="w-3 h-3 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No further action.</p>
              </div>
            </div>

            {/* Add step */}
            <button
              onClick={() => setShowAddSheet(true)}
              className="w-full flex items-center gap-3 border-2 border-dashed border-border rounded-2xl p-4 hover:border-primary/40 hover:bg-primary/5 transition-all group"
            >
              <div className="w-9 h-9 rounded-full bg-accent group-hover:bg-primary/10 flex items-center justify-center flex-shrink-0 transition-colors">
                <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                Add a step
              </p>
            </button>
          </div>

          {/* Fixed footer */}
          <div className="fixed bottom-0 left-0 right-0 p-5 bg-background border-t border-border">
            <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
              <Button
                variant="outline"
                onClick={handleDiscard}
                className="rounded-full uppercase font-medium tracking-wide"
              >
                {isDirty ? "Discard" : "Close"}
              </Button>
              <Button
                onClick={handleSave}
                disabled={!isDirty}
                className="rounded-full uppercase font-bold tracking-wide bg-primary hover:bg-primary/90 disabled:opacity-40"
              >
                Save Queue
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AddQueueStepSheet open={showAddSheet} onOpenChange={setShowAddSheet} />
    </>
  );
}
