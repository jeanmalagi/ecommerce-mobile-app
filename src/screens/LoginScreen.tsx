import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useAuth } from "../context/AuthContext";
import { theme } from "../theme";

type Props = NativeStackScreenProps<any>;

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@email.com");
  const [password, setPassword] = useState("123456");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    try {
      setSubmitting(true);
      await login(email, password);
    } catch {
      Alert.alert("Erro", "Falha no login");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>MyStore</Text>
        <Text style={styles.subtitle}>Bem-vindo de volta</Text>

        <TextInput
          placeholder="Digite seu email"
          placeholderTextColor={theme.colors.muted}
          style={styles.input}
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Digite sua senha"
          placeholderTextColor={theme.colors.muted}
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable style={styles.primaryBtn} onPress={onSubmit}>
          <Text style={styles.primaryBtnText}>{submitting ? "Entrando..." : "Entrar"}</Text>
        </Pressable>

        <Pressable style={styles.secondaryBtn} onPress={() => navigation.navigate("Register")}>
          <Text style={styles.secondaryBtnText}>Criar conta</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  logo: {
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    color: theme.colors.primary,
  },
  subtitle: {
    textAlign: "center",
    color: theme.colors.muted,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 12,
    color: theme.colors.text,
    backgroundColor: "#fff",
  },
  primaryBtn: {
    marginTop: 6,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  secondaryBtn: {
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginTop: 4,
  },
  secondaryBtnText: {
    color: theme.colors.primary,
    fontWeight: "700",
  },
});
