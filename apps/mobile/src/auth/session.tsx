import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { Platform } from "react-native";
import { type Account, type HandoffLetter } from "@legacy-wolf/core";
import * as SecureStore from "../storage/secure";
import * as LocalAuthentication from "expo-local-authentication";
import { deviceId, devicePublicKey } from "../motion/heartbeat";
import { RestApiClient } from "../api/rest-client";
import { registerPushNotifications } from "../notifications/register";

interface SessionValue {
  account: Account | null;
  biometricPromptSeen: boolean;
  biometricEnabled: boolean;
  preferenceLoaded: boolean;
  developmentOtpCode: string | null;
  client: RestApiClient;
  completeAuthentication(account: Account): void;
  completeBiometricPrompt(enabled: boolean): void;
  requestOtp(
    identity: string,
    channel: "sms" | "email",
    signup?: boolean,
  ): Promise<void>;
  verifyOtp(code: string): Promise<Account>;
  authenticateGoogle(idToken: string): Promise<Account>;
  logout(): Promise<void>;
  createHandoffLetter(
    body: string,
    trigger: HandoffLetter["delivery_trigger"],
    recipient?: string | null,
  ): Promise<HandoffLetter>;
  quickUnlock(): Promise<Account>;
}

interface ApiSession {
  accessToken: string;
  refreshToken: string;
}
const SessionContext = createContext<SessionValue | null>(null);
const apiUrl = process.env.EXPO_PUBLIC_API_URL;

export function SessionProvider({ children }: PropsWithChildren) {
  const client = useMemo(
    () => new RestApiClient(apiUrl ?? ""),
    [],
  );
  const [account, setAccount] = useState<Account | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [biometricPromptSeen, setBiometricPromptSeen] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [preferenceLoaded, setPreferenceLoaded] = useState(false);
  const [developmentOtpCode, setDevelopmentOtpCode] = useState<string | null>(null);

  useEffect(() => {
    void SecureStore.getItemAsync("legacy-wolf-biometric-preference").then(
      (stored) => {
        if (stored) {
          setBiometricPromptSeen(true);
          setBiometricEnabled(stored === "enabled");
        }
        setPreferenceLoaded(true);
      },
    );
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      account,
      biometricEnabled,
      biometricPromptSeen,
      client,
      preferenceLoaded,
      developmentOtpCode,
      completeAuthentication: setAccount,
      completeBiometricPrompt: (enabled) => {
        setBiometricEnabled(enabled);
        setBiometricPromptSeen(true);
        void SecureStore.setItemAsync(
          "legacy-wolf-biometric-preference",
          enabled ? "enabled" : "declined",
        );
      },
      requestOtp: async (identity, channel, signup = false) => {
        const base = requireApiUrl();
        const response = await fetch(`${base}/v1/auth/otp/request`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            identity,
            channel,
            intent: signup ? "signup" : "login",
          }),
        });
        if (!response.ok) throw new Error(await responseMessage(response));
        const result = (await response.json()) as { challengeId: string; developmentCode?: string };
        setChallengeId(result.challengeId);
        setDevelopmentOtpCode(result.developmentCode ?? null);
      },
      verifyOtp: async (code) => {
        if (!challengeId) throw new Error("Request a new verification code.");
        return authenticate(`${requireApiUrl()}/v1/auth/otp/verify`, {
          challengeId,
          code,
        });
      },
      authenticateGoogle: async (idToken) =>
        authenticate(`${requireApiUrl()}/v1/auth/google`, { idToken }),
      logout: async () => {
        setAccount(null);
        setChallengeId(null);
        setDevelopmentOtpCode(null);
        await Promise.all([
          client.auth.logout(),
          SecureStore.deleteItemAsync("legacy-wolf-access-token"),
          SecureStore.deleteItemAsync("legacy-wolf-refresh-token"),
        ]);
      },
      createHandoffLetter: async (body, trigger, recipient) => {
        return client.createHandoffLetter(body, trigger, recipient);
      },
      quickUnlock: async () => {
        const [hardware, enrolled] = await Promise.all([
          LocalAuthentication.hasHardwareAsync(),
          LocalAuthentication.isEnrolledAsync(),
        ]);
        if (!hardware || !enrolled) throw new Error("Biometric unlock is not enrolled on this device.");
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: "Unlock Legacy Wolf",
          cancelLabel: "Cancel",
          disableDeviceFallback: false,
        });
        if (!result.success) throw new Error("Quick unlock was not completed.");
        const refreshToken = await SecureStore.getItemAsync(
          "legacy-wolf-refresh-token",
        );
        if (!refreshToken)
          throw new Error("Your stored session has expired. Log in again.");
        const response = await fetch(`${requireApiUrl()}/v1/auth/refresh`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ refreshToken, deviceId: await deviceId() }),
        });
        if (!response.ok) throw new Error(await responseMessage(response));
        const session = (await response.json()) as ApiSession;
        await Promise.all([
          SecureStore.setItemAsync(
            "legacy-wolf-access-token",
            session.accessToken,
          ),
          SecureStore.setItemAsync(
            "legacy-wolf-refresh-token",
            session.refreshToken,
          ),
        ]);
        const currentResponse = await fetch(`${requireApiUrl()}/v1/account`, {
          headers: { authorization: `Bearer ${session.accessToken}` },
        });
        if (!currentResponse.ok)
          throw new Error(await responseMessage(currentResponse));
        const current = mapAccount(await currentResponse.json());
        setAccount(current);
        return current;
      },
    }),
    [
      account,
      biometricEnabled,
      biometricPromptSeen,
      challengeId,
      client,
      developmentOtpCode,
      preferenceLoaded,
    ],
  );

  async function authenticate(
    url: string,
    credentials: Record<string, string>,
  ): Promise<Account> {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...credentials,
        device: {
          id: await deviceId(),
          platform: Platform.OS,
          publicKey: await devicePublicKey(),
        },
      }),
    });
    if (!response.ok) throw new Error(await responseMessage(response));
    const session = (await response.json()) as ApiSession;
    await Promise.all([
      SecureStore.setItemAsync("legacy-wolf-access-token", session.accessToken),
      SecureStore.setItemAsync(
        "legacy-wolf-refresh-token",
        session.refreshToken,
      ),
    ]);
    void registerPushNotifications(requireApiUrl());
    const current = await fetch(`${requireApiUrl()}/v1/account`, {
      headers: { authorization: `Bearer ${session.accessToken}` },
    });
    if (!current.ok) throw new Error(await responseMessage(current));
    return mapAccount(await current.json());
  }

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value)
    throw new Error("useSession must be used inside SessionProvider.");
  return value;
}
export function useOperationsApi() {
  const { client } = useSession();
  return client.operations;
}
function requireApiUrl() {
  if (!apiUrl) throw new Error("The Legacy Wolf API URL is not configured.");
  return apiUrl;
}
async function responseMessage(response: Response) {
  try {
    const body = (await response.json()) as { message?: string | string[] };
    return Array.isArray(body.message)
      ? body.message.join(" ")
      : (body.message ?? "The request could not be completed.");
  } catch {
    return "The request could not be completed.";
  }
}
function mapAccount(value: unknown): Account {
  const source = value as Record<string, unknown>;
  const now = new Date().toISOString();
  const status =
    source.status === "suspended" || source.status === "deletion_pending"
      ? source.status
      : "active";
  return {
    id: String(source.id),
    email: typeof source.email === "string" ? source.email : null,
    phone_e164: typeof source.phoneE164 === "string" ? source.phoneE164 : null,
    email_verified: Boolean(source.emailVerified),
    phone_verified: Boolean(source.phoneVerified),
    legal_name: typeof source.legalName === "string" ? source.legalName : null,
    preferred_name:
      typeof source.preferredName === "string" ? source.preferredName : null,
    dob: typeof source.dob === "string" ? source.dob.slice(0, 10) : null,
    kyc_status: "none",
    status,
    roles: Array.isArray(source.roles)
      ? (source.roles as Account["roles"])
      : ["user"],
    created_at: typeof source.createdAt === "string" ? source.createdAt : now,
    updated_at: typeof source.updatedAt === "string" ? source.updatedAt : now,
  };
}
