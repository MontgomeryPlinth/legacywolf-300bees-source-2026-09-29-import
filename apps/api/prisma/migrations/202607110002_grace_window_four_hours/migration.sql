ALTER TABLE "motion_timers"
DROP CONSTRAINT "motion_timer_grace_range";

ALTER TABLE "motion_timers"
ADD CONSTRAINT "motion_timer_grace_range"
CHECK ("grace_minutes" BETWEEN 1 AND 240);
