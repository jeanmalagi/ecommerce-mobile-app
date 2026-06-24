import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { theme } from "../theme";

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <MaterialCommunityIcons name="shopping" size={42} color={theme.colors.primary} />
      </View>

      <Text style={styles.title}>Carregando sua loja</Text>
      <Text style={styles.subtitle}>Estamos preparando produtos, carrinho e pedidos.</Text>

      <View style={styles.iconRow}>
        <MaterialCommunityIcons name="cart-outline" size={24} color={theme.colors.muted} />
        <MaterialCommunityIcons name="tag-outline" size={24} color={theme.colors.muted} />
        <MaterialCommunityIcons name="truck-fast-outline" size={24} color={theme.colors.muted} />
      </View>

      <ActivityIndicator size="large" color={theme.colors.primary} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  logoCircle: {
    width: 94,
    height: 94,
    borderRadius: 47,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
  },
  subtitle: {
    marginTop: theme.spacing.xs,
    textAlign: "center",
    color: theme.colors.muted,
  },
  iconRow: {
    marginTop: theme.spacing.md,
    flexDirection: "row",
    gap: theme.spacing.md,
    alignItems: "center",
  },
  spinner: {
    marginTop: theme.spacing.lg,
  },
});
