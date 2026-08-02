# Legacy Wolf component map

Status: every exported screen family has a functional Expo/RN surface. A route filename alone is not considered a port: the target must include the source view's primary states, actions, live-data contract, loading/empty/error handling, and associated sheet behavior. Provider-dependent controls remain visibly disabled until their integrations are configured.

The source under `reference/figma-export/` is read-only. Screen IDs below are provisional where the export does not annotate an ID; they must be reconciled with the architecture reference during implementation.

## Entry and authentication

| Export source                    | Target                | Disposition / notes                                                               |
| -------------------------------- | --------------------- | --------------------------------------------------------------------------------- |
| `auth/RoleSelectionScreen.tsx`   | `/` Entry             | Implemented as the specified shield/tagline/Log In/Sign Up screen; no role cards. |
| `auth/UserLogin.tsx`             | `/login`              | Implemented as unified Google + phone OTP + email OTP UI.                         |
| `auth/NominatedContactLogin.tsx` | —                     | Remove; roles resolve after authentication.                                       |
| `auth/ResponderLogin.tsx`        | —                     | Remove; roles resolve after authentication.                                       |
| `auth/AdminLogin.tsx`            | —                     | Remove; roles resolve after authentication.                                       |
| `auth/LoginForm.tsx`             | Login form primitives | Visual/reference audit only; no demo authentication.                              |
| `auth/SignUpWizard.tsx`          | `/signup`             | Implemented with all 14 post-entry states and both exported response branches.    |
| `auth/PinCreationDialog.tsx`     | —                     | Do not port; superseded by biometric opt-in and OTP session model.                |
| `auth/PinPromptDialog.tsx`       | —                     | Do not port; superseded by biometric opt-in and OTP session model.                |

Signup states: entry, pet question, core details, SMS verification, terms, response selection, contact details, contact notification, monitoring method, threshold, alert summary, attend explainer, access instructions, emergency contacts, and attend summary. “Entry” is replaced by the new app entry screen, leaving 14 wizard states after it.

Provisional onboarding mapping: O1 entry/pet question; O2 core identity and SMS verification; O3 terms and response authorization; O4 nominated-contact branch; O5 monitoring/timer branch; O6 attendance/access branch and activation summaries. The source architecture does not provide a more granular authoritative O1–O6 mapping.

## User surface

| Export source                                         | Target                          | Screen ID / notes                         |
| ----------------------------------------------------- | ------------------------------- | ----------------------------------------- |
| `user/screens/HomeStatus.tsx`                         | `/user/home`                    | H1; timer uses server `next_expiry_at`. |
| `user/sheets/EditTimerSheet.tsx`                      | Home/plan bottom sheet          | T-series.                                 |
| `user/sheets/BatteryBehaviourSheet.tsx`               | Home/plan bottom sheet          | Timer battery behavior.                   |
| `user/screens/PlanManagement.tsx`                     | `/user/plan`                    | P-series.                                 |
| `user/sheets/ResponseQueueSheet.tsx`                  | Plan bottom sheet               | Ordered instruction plan.                 |
| `user/sheets/AddQueueStepSheet.tsx`                   | Response Queue bottom sheet     | Queue step editor.                        |
| `user/screens/PeopleManagementEnhanced.tsx`           | `/user/people`                  | Canonical People view.                    |
| `user/screens/PeopleManagement.tsx`                   | —                               | Superseded; reference only.               |
| `user/PersonDetailSheet.tsx`                          | People detail bottom sheet      | Shared by Home and People.                |
| `user/NominatedContactsSheet.tsx`                     | Nominated contacts bottom sheet | Shared by Home.                           |
| `user/PrimaryContactSheet.tsx`                        | Primary contact bottom sheet    | Shared by Home.                           |
| `user/EditInstructionsSheet.tsx`                      | Instructions bottom sheet       | User-authored instructions.               |
| `user/screens/PetManagementEnhanced.tsx`              | `/user/pets`                    | Canonical Pet view.                       |
| `user/screens/PetManagement.tsx`                      | —                               | Superseded; reference only.               |
| `user/sheets/PetGuardianSheet.tsx`                    | Pet Guardian bottom sheet       | Pet handover/guardian details.            |
| `user/screens/PropertyAccess.tsx`                     | `/user/property`                | Masked/write-only access details.         |
| `forms/PropertyAccessEditDialog.tsx`                  | Property access modal           | Port relevant form and media behavior.    |
| `forms/AddressFormDialog.tsx`                         | Address modal                   | Port relevant address behavior.           |
| `forms/AddressInput.tsx`                              | Address fields                  | Shared form primitive.                    |
| `user/screens/LastWishes.tsx`                         | `/user/wishes`                  | Last wishes.                              |
| `user/screens/AccountSettings.tsx`                    | `/user/account`                 | Account hub.                              |
| `user/screens/account/AccountProfile.tsx`             | Account modal/sheet             | Profile.                                  |
| `user/screens/account/AccountSubscription.tsx`        | Account modal/sheet             | Subscription.                             |
| `user/screens/account/AccountLegalAuthorizations.tsx` | Account modal/sheet             | Legal authorizations.                     |
| `user/screens/account/AccountNotifications.tsx`       | Account modal/sheet             | Notifications.                            |
| `user/screens/account/AccountSecurity.tsx`            | Account modal/sheet             | Security; remove PIN semantics.           |
| `user/screens/account/AccountHistory.tsx`             | Account modal/sheet             | History.                                  |
| `user/EmergencyModal.tsx`                             | Home modal                      | “Are You OK?” state.                      |
| `user/SickModeModal.tsx`                              | Home modal                      | M4; Ember only at severity 9–10.          |
| `user/TripModeModal.tsx`                              | Home modal                      | Trip Mode.                                |

## Linked nominated-contact role

These render inside the authenticated account role switcher, not in a parallel login/app shell.

| Export source                                 | Target           | Notes                    |
| --------------------------------------------- | ---------------- | ------------------------ |
| `nominated-contact/screens/InviteLanding.tsx` | Linked-role view | Invitation acceptance.   |
| `nominated-contact/screens/MyRole.tsx`        | Linked-role view | Canonical role overview. |
| `nominated-contact/screens/ActiveAlert.tsx`   | Linked-role view | Active alert details.    |
| `nominated-contact/screens/DrillNotice.tsx`   | Linked-role view | Drill notice.            |

## Responder and Admin

| Export source                            | Target                | Notes                                                                           |
| ---------------------------------------- | --------------------- | ------------------------------------------------------------------------------- |
| `responder/screens/ShiftHome.tsx`        | `/responder/shift`    | Mobile responder.                                                               |
| `responder/screens/ActiveDispatch.tsx`   | `/responder/dispatch` | Mobile responder.                                                               |
| `responder/screens/IncidentReport.tsx`   | `/responder/report`   | Mobile responder.                                                               |
| `responder/screens/ResponderAccount.tsx` | `/responder/account`  | Mobile responder.                                                               |
| `admin/screens/AdminDashboard.tsx`       | `/admin/dashboard`    | Web desktop only.                                                               |
| `admin/screens/UsersManagement.tsx`      | `/admin/users`        | Web desktop only.                                                               |
| `admin/screens/RespondersManagement.tsx` | `/admin/responders`   | Web desktop only.                                                               |
| `admin/screens/IncidentsManagement.tsx`  | `/admin/incidents`    | Web desktop only.                                                               |
| `admin/AdminApp.tsx` placeholder routes  | —                     | Compliance, billing, and settings have no exported screens; do not invent them. |

## Used UI audit

Only these exported UI modules are imported by product/auth/form components and are candidates for the RN package: AddressDisplay, Alert, AlertDialog, Avatar, Badge, Button, Card, Checkbox, Collapsible, Dialog/Modal, Input, Label, RadioGroup, Select, Sheet/bottom sheet, Switch, Tabs, and Textarea. `sonner` is used at the app root. Progress, Slider, Separator, Skeleton, and OTP input are required by the governing Phase 1 spec even where the export implements equivalent UI inline.

| Export module                                      | RN target                                                 | Notes                                            |
| -------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------ |
| `ui/button`                                        | `@legacy-wolf/ui/Button`                                  | Pressable variants; token-only states.           |
| `ui/card`                                          | `Card`                                                    | Graphite/Onyx surfaces.                          |
| `ui/input`, `ui/textarea`, `ui/label`              | Form primitives                                           | React Hook Form compatible.                      |
| `ui/badge`                                         | `Badge`                                                   | Semantic token mapping.                          |
| `ui/dialog`, `ui/alert-dialog`                     | `Modal` / `AlertModal`                                    | RN Modal/Reanimated.                             |
| `ui/sheet`                                         | `BottomSheet`                                             | `@gorhom/bottom-sheet`.                          |
| `ui/tabs`                                          | `Tabs`                                                    | Accessible RN/web implementation.                |
| `ui/switch`                                        | `Switch`                                                  | Tokenized native control wrapper.                |
| `ui/select`, `ui/radio-group`, `ui/checkbox`       | Choice controls                                           | Accessible RN/web implementation.                |
| `ui/avatar`                                        | `Avatar`                                                  | Image fallback without embedded non-palette SVG. |
| `ui/alert`, `ui/collapsible`, `ui/address-display` | Supporting components                                     | Port only used behavior.                         |
| `ui/sonner`                                        | `Toast`                                                   | Cross-platform toast equivalent.                 |
| inline/required                                    | `Progress`, `Slider`, `Separator`, `Skeleton`, `OtpInput` | Required core set.                               |
