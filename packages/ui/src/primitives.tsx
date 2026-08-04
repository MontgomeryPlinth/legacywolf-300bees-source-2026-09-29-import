import { forwardRef, useEffect, useRef, type PropsWithChildren, type ReactNode } from "react";
import {
  ActivityIndicator,
  Modal as NativeModal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
  type TouchableOpacityProps,
  type ViewProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radii, spacing, typography } from "@legacy-wolf/tokens";

export type ButtonVariant = "primary" | "secondary" | "critical" | "ghost";
export interface ButtonProps extends Omit<TouchableOpacityProps, "children"> {
  children: ReactNode;
  variant?: ButtonVariant;
  loading?: boolean;
}
export function Button({
  children,
  variant = "primary",
  loading = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      accessibilityRole="button"
      disabled={disabled || loading}
      style={[
        styles.button,
        buttonStyles[variant],
        (disabled || loading) && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? colors.obsidian : colors.white}
        />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === "primary" && styles.buttonTextDark,
          ]}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export function Card({ style, ...props }: ViewProps) {
  return <View style={[styles.card, style]} {...props} />;
}
export function Separator() {
  return <View accessibilityElementsHidden style={styles.separator} />;
}
export function Label({ children }: PropsWithChildren) {
  return <Text style={styles.label}>{children}</Text>;
}
export const Input = forwardRef<TextInput, TextInputProps>(function Input(
  { style, placeholderTextColor = colors.slate, ...props },
  ref,
) {
  return (
    <TextInput
      ref={ref}
      placeholderTextColor={placeholderTextColor}
      style={[styles.input, style]}
      {...props}
    />
  );
});
export function Badge({
  children,
  critical = false,
}: PropsWithChildren<{ critical?: boolean }>) {
  return (
    <View style={[styles.badge, critical && styles.badgeCritical]}>
      <Text style={[styles.badgeText, critical && styles.badgeTextCritical]}>
        {children}
      </Text>
    </View>
  );
}

export function Progress({ value }: { value: number }) {
  const width = `${Math.max(0, Math.min(100, value))}%` as `${number}%`;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: value }}
      style={styles.progressTrack}
    >
      <View style={[styles.progressValue, { width }]} />
    </View>
  );
}
export function Skeleton({
  height = 20,
  width = "100%",
}: {
  height?: number;
  width?: number | `${number}%`;
}) {
  return (
    <View
      accessibilityLabel="Loading"
      style={[styles.skeleton, { height, width }]}
    />
  );
}

export function OtpInput({
  value,
  onChange,
  length = 6,
}: {
  value: string;
  onChange(value: string): void;
  length?: number;
}) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timeout = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => inputRef.current?.focus()}
      style={styles.otpRow}
    >
      {Array.from({ length }, (_, index) => (
        <View key={index} style={styles.otpCell}>
          <Text style={styles.otpText}>{value[index] ?? ""}</Text>
        </View>
      ))}
      <TextInput
        ref={inputRef}
        accessibilityLabel={`${length}-digit verification code`}
        autoComplete="one-time-code"
        caretHidden
        inputMode="numeric"
        keyboardType="number-pad"
        maxLength={length}
        onChangeText={(next) => onChange(next.replace(/\D/g, ""))}
        showSoftInputOnFocus
        style={styles.hiddenInput}
        textContentType="oneTimeCode"
        value={value}
      />
    </Pressable>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: PropsWithChildren<{ open: boolean; onClose(): void; title: string }>) {
  return (
    <NativeModal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={open}
    >
      <SafeAreaView style={styles.modalSafeArea}>
        <View style={styles.modalBackdrop}>
          <Card accessibilityViewIsModal style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text accessibilityRole="header" style={styles.heading}>
                {title}
              </Text>
              <Pressable
                accessibilityLabel="Close"
                accessibilityRole="button"
                hitSlop={12}
                onPress={onClose}
              >
                <Text style={styles.close}>×</Text>
              </Pressable>
            </View>
            <ScrollView
              contentContainerStyle={styles.modalContent}
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              showsVerticalScrollIndicator
              style={styles.modalScroll}
            >
              {children}
            </ScrollView>
          </Card>
        </View>
      </SafeAreaView>
    </NativeModal>
  );
}

const buttonStyles = StyleSheet.create({
  primary: { backgroundColor: colors.guardianGreen },
  secondary: {
    backgroundColor: "transparent",
    borderColor: colors.white,
    borderWidth: 1,
  },
  critical: { backgroundColor: colors.ember },
  ghost: { backgroundColor: "transparent" },
});
const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: radii.pill,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: spacing[6],
  },
  buttonText: {
    ...typography.label,
    color: colors.white,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  buttonTextDark: { color: colors.obsidian },
  disabled: { opacity: 0.45 },
  card: {
    backgroundColor: colors.graphite,
    borderColor: colors.coal,
    borderRadius: radii.card,
    borderWidth: 1,
    padding: spacing[6],
  },
  separator: { backgroundColor: colors.coal, height: 1, width: "100%" },
  label: {
    ...typography.label,
    color: colors.mist,
    marginBottom: spacing[2],
    textTransform: "uppercase",
  },
  input: {
    ...typography.body,
    backgroundColor: colors.graphite,
    borderColor: colors.coal,
    borderRadius: radii.input,
    borderWidth: 1,
    color: colors.white,
    minHeight: 52,
    paddingHorizontal: spacing[4],
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.onyx,
    borderRadius: radii.pill,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  badgeCritical: { backgroundColor: colors.ember },
  badgeText: {
    ...typography.label,
    color: colors.mist,
    textTransform: "uppercase",
  },
  badgeTextCritical: { color: colors.white },
  progressTrack: {
    backgroundColor: colors.coal,
    borderRadius: radii.pill,
    height: 2,
    overflow: "hidden",
  },
  progressValue: { backgroundColor: colors.guardianGreen, height: "100%" },
  skeleton: { backgroundColor: colors.onyx, borderRadius: radii.small },
  otpRow: { backgroundColor: colors.graphite, borderColor: colors.guardianGreen, borderRadius: radii.card, borderWidth: 2, flexDirection: "row", minHeight: 62, paddingHorizontal: spacing[3], position: "relative" },
  otpCell: {
    alignItems: "center",
    flex: 1,
    height: 58,
    justifyContent: "center",
  },
  otpText: { ...typography.heading, color: colors.white, fontSize: 28, fontWeight: "900" },
  hiddenInput: {
    bottom: 0,
    left: 0,
    opacity: 0.01,
    position: "absolute",
    right: 0,
    top: 0,
  },
  modalSafeArea: {
    backgroundColor: colors.obsidian,
    flex: 1,
  },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: colors.obsidian,
    flex: 1,
    justifyContent: "center",
    padding: spacing[4],
  },
  modalCard: {
    flexShrink: 1,
    maxHeight: "100%",
    maxWidth: 480,
    overflow: "hidden",
    width: "100%",
  },
  modalContent: { flexGrow: 0, paddingBottom: spacing[2] },
  modalScroll: { flexShrink: 1 },
  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing[4],
  },
  heading: { ...typography.heading, color: colors.white },
  close: { color: colors.mist, fontSize: 28 },
});
