import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";

interface CartSuccessModalProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

export function CartSuccessModal({
  message,
  visible,
  onDismiss,
  duration = 3000,
}: CartSuccessModalProps) {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    setIsVisible(visible);
    if (visible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, onDismiss, duration]);

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={() => setIsVisible(false)}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={() => setIsVisible(false)} />
        <View style={styles.container}>
          <Text style={styles.icon}>✓</Text>
          <Text testID="cart-success-title" style={styles.title}>Sucesso!</Text>
          <Text testID="cart-success-message" style={styles.message}>{message}</Text>
          <Pressable testID="cart-success-ok" style={styles.button} onPress={() => setIsVisible(false)}>
            <Text style={styles.buttonText}>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.md,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    alignItems: "center",
    gap: 12,
    maxWidth: 320,
    zIndex: 1,
  },
  icon: {
    fontSize: 54,
    fontWeight: "700",
    color: theme.colors.success,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
  },
  message: {
    fontSize: 15,
    color: theme.colors.muted,
    textAlign: "center",
  },
  button: {
    marginTop: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
