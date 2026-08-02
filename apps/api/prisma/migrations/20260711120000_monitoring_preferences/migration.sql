ALTER TABLE "motion_timers"
  ADD COLUMN "monitoring_strategy" TEXT NOT NULL DEFAULT 'motion',
  ADD COLUMN "cancel_escalation_on_movement" BOOLEAN NOT NULL DEFAULT true;
