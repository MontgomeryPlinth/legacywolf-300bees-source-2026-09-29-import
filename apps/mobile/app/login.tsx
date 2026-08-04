import { useEffect, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Button, Input, Label, OtpInput, Separator } from "@legacy-wolf/ui";
import { colors, radii, spacing, typography } from "@legacy-wolf/tokens";
import { AuthShell, authStyles } from "../src/auth/auth-shell";
import { useSession } from "../src/auth/session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import type { CountryCode } from "libphonenumber-js";
import { detectedCountry, InternationalPhoneInput, toE164, validPhone } from "../src/auth/phone-input";

WebBrowser.maybeCompleteAuthSession();

type Channel = "sms" | "email";
type Stage = "identity" | "otp";

export default function LoginScreen() {
  const {
    requestOtp,
    verifyOtp,
    authenticateGoogle,
    completeAuthentication,
    biometricPromptSeen,
    developmentOtpCode,
    client,
  } = useSession();
  const [channel, setChannel] = useState<Channel>("sms");
  const [stage, setStage] = useState<Stage>("identity");
  const [identity, setIdentity] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>(detectedCountry);

  const normalized =
    channel === "sms"
      ? toE164(identity, phoneCountry)
      : identity.trim().toLowerCase();
  const validIdentity =
    channel === "sms"
      ? validPhone(identity, phoneCountry)
      : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);

  async function requestCode() {
    if (!validIdentity) {
      setError(
        channel === "sms"
          ? "Enter a valid mobile number."
          : "Enter a valid email address.",
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await requestOtp(normalized, channel);
      setStage("otp");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "We could not send a verification code.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function verify() {
    setLoading(true);
    setError(null);
    try {
      const account = await verifyOtp(code);
      completeAuthentication(account);
      const plan = await client.plans.get();
      router.replace(plan.status === "setup" ? "/signup" : biometricPromptSeen ? "/user/home" : "/biometric-opt-in");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "We could not verify that code.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      onBack={
        stage === "otp"
          ? () => {
              setStage("identity");
              setCode("");
              setError(null);
            }
          : undefined
      }
    >
      <View style={authStyles.stack}>
        <View>
          <Text style={authStyles.title}>LOG IN</Text>
          <Text style={authStyles.body}>
            Use the account that holds your Legacy Wolf roles.
          </Text>
        </View>
        {stage === "identity" ? (
          <>
            <GoogleLoginButton
              loading={loading}
              onError={setError}
              onLoading={setLoading}
              onSuccess={async (idToken) => {
                const account = await authenticateGoogle(idToken);
                completeAuthentication(account);
                const plan = await client.plans.get();
                router.replace(plan.status === "setup" ? "/signup" : biometricPromptSeen ? "/user/home" : "/biometric-opt-in");
              }}
            />
            <View style={styles.or}>
              <View style={styles.orLine}><Separator /></View>
              <Text style={styles.orText}>OR</Text>
              <View style={styles.orLine}><Separator /></View>
            </View>
            <View style={styles.tabs}>
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: channel === "sms" }}
                onPress={() => {
                  setChannel("sms");
                  setIdentity("");
                  setError(null);
                }}
                style={[styles.tab, channel === "sms" && styles.tabActive]}
              >
                <Text
                  style={[
                    styles.tabText,
                    channel === "sms" && styles.tabTextActive,
                  ]}
                >
                  PHONE
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: channel === "email" }}
                onPress={() => {
                  setChannel("email");
                  setIdentity("");
                  setError(null);
                }}
                style={[styles.tab, channel === "email" && styles.tabActive]}
              >
                <Text
                  style={[
                    styles.tabText,
                    channel === "email" && styles.tabTextActive,
                  ]}
                >
                  EMAIL
                </Text>
              </Pressable>
            </View>
            {channel === "sms" ? (
              <InternationalPhoneInput country={phoneCountry} onChange={setIdentity} onCountryChange={setPhoneCountry} value={identity} />
            ) : <View>
              <Label>
                Email address
              </Label>
              <Input
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setIdentity}
                placeholder={
                  "you@example.com"
                }
                returnKeyType="done"
                value={identity}
              />
            </View>}
            <Text style={authStyles.small}>
              {channel === "sms"
                ? "We’ll send a six-digit SMS code."
                : "We’ll send a six-digit code by email."}
            </Text>
            {error ? (
              <Text accessibilityRole="alert" style={authStyles.error}>
                {error}
              </Text>
            ) : null}
            <Button
              disabled={!validIdentity}
              loading={loading}
              onPress={requestCode}
            >
              Continue
            </Button>
          </>
        ) : (
          <>
            <View>
              <Text style={authStyles.heading}>Enter your code</Text>
              <Text style={authStyles.body}>
                We sent a six-digit code to {normalized}.
              </Text>
            </View>
            <OtpInput onChange={setCode} value={code} />
            {developmentOtpCode ? <View style={styles.devCodeCard}><Text style={styles.devCodeLabel}>LOCAL DEVELOPMENT CODE</Text><Text style={styles.devCode}>{developmentOtpCode}</Text></View> : null}
            {error ? (
              <Text accessibilityRole="alert" style={authStyles.error}>
                {error}
              </Text>
            ) : null}
            <Button
              disabled={code.length !== 6}
              loading={loading}
              onPress={verify}
            >
              Verify and log in
            </Button>
            <Button disabled={loading} onPress={requestCode} variant="ghost">
              Send a new code
            </Button>
          </>
        )}
      </View>
    </AuthShell>
  );
}

function GoogleLoginButton({ loading, onError, onLoading, onSuccess }: { loading: boolean; onError(message: string | null): void; onLoading(value: boolean): void; onSuccess(idToken: string): Promise<void> }) {
  const configured = Platform.select({ ios: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS, android: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID, default: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB });
  if (!configured) return <Button disabled variant="secondary">Continue with Google · setup required</Button>;
  return <ConfiguredGoogleButton loading={loading} onError={onError} onLoading={onLoading} onSuccess={onSuccess} />;
}

function ConfiguredGoogleButton({ loading, onError, onLoading, onSuccess }: { loading: boolean; onError(message: string | null): void; onLoading(value: boolean): void; onSuccess(idToken: string): Promise<void> }) {
  const [request, response, prompt] = Google.useIdTokenAuthRequest({ iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS, androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID, webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB, selectAccount: true });
  const handled = useRef<string | null>(null);
  useEffect(() => {
    if (response?.type !== "success") return;
    const idToken = response.params.id_token;
    if (!idToken || handled.current === idToken) return;
    handled.current = idToken;
    onLoading(true);
    void onSuccess(idToken).catch((reason: unknown) => onError(reason instanceof Error ? reason.message : "Google sign-in could not be completed.")).finally(() => onLoading(false));
  }, [onError, onLoading, onSuccess, response]);
  return <Button disabled={!request} loading={loading} onPress={() => { onError(null); void prompt(); }} variant="secondary">Continue with Google</Button>;
}

const styles = StyleSheet.create({
  devCodeCard: { alignItems: "center", backgroundColor: colors.graphite, borderColor: colors.coal, borderRadius: radii.input, borderWidth: 1, padding: spacing[4] },
  devCodeLabel: { ...typography.label, color: colors.mist },
  devCode: { ...typography.displayM, color: colors.guardianGreen, marginTop: spacing[2] },
  or: { alignItems: "center", flexDirection: "row", width: "100%" },
  orLine: { flex: 1, minWidth: 0 },
  orText: { ...typography.label, color: colors.slate, marginHorizontal: spacing[3], textAlign: "center" },
  tabs: {
    backgroundColor: colors.graphite,
    borderRadius: radii.pill,
    flexDirection: "row",
    padding: spacing[1],
  },
  tab: {
    alignItems: "center",
    borderRadius: radii.pill,
    flex: 1,
    padding: spacing[3],
  },
  tabActive: { backgroundColor: colors.onyx },
  tabText: { ...typography.label, color: colors.slate },
  tabTextActive: { color: colors.white },
});
