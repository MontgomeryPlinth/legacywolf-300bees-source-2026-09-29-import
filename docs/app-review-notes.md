# App review notes

## Motion Timer

Legacy Wolf uses accelerometer readings as a low-frequency liveness signal. It does not infer health, death, falls, or a medical condition. A threshold crossing starts only a short high-frequency confirmation burst; confirmed motion queues a signed heartbeat. The server owns expiry and escalation decisions.

On iOS, background execution is opportunistic and cannot guarantee continuous accelerometer delivery after suspension or force-quit. Background tasks, silent-push nudges, and coarse significant-distance location wakes improve delivery but cannot remove this constraint. Location coordinates are not placed in heartbeats or stored in a user plan by the wake-signal task.

Android declares activity recognition and a health foreground service. The generated native service shows the persistent “Legacy Wolf protection is active” notification while monitoring is enabled.

## Biometrics

Face ID, Touch ID, fingerprint, or face unlock releases a device-bound refresh session from secure storage. Biometric templates never enter the app and biometrics are not a primary credential.

## Sensitive access data

Property codes and instructions are write-only on the client, AES-256-GCM encrypted on the service, and releasable only during an active incident or audited administrative reveal.

## Reviewer drill

Provide a non-production review account and a drill-mode plan. Drill Mode must never contact emergency services or a real responder.
