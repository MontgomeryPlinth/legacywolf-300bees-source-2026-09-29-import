ALTER TABLE "motion_timers"
ADD COLUMN "battery_rule_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "battery_behaviour" TEXT NOT NULL DEFAULT 'suppress',
ADD COLUMN "offline_escalation_hours" INTEGER NOT NULL DEFAULT 48,
ADD CONSTRAINT "motion_timer_battery_behaviour" CHECK ("battery_behaviour" IN ('suppress', 'respond', 'alert_contact')),
ADD CONSTRAINT "motion_timer_offline_hours" CHECK ("offline_escalation_hours" BETWEEN 4 AND 168);
