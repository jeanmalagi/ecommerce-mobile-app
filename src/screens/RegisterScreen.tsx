import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useAuth } from "../context/AuthContext";
import { theme } from "../theme";

export function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async () => {
    try {
      await register(name, email, password);
      Alert.alert("Sucesso", "Conta criada com sucesso");
      setName("");
      setEmail("");
      setPassword("");
    } catch {
      Alert.alert("Erro", "Falha no cadastro");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>MyStore</Text>
        <Text testID="register-title" style={styles.subtitle}>Crie sua conta</Text>

        <TextInput
          testID="register-input-nome"
          placeholder="Digite seu nome"
          placeholderTextColor={theme.colors.muted}
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          testID="register-input-email"
          placeholder="Digite seu email"
          placeholderTextColor={theme.colors.muted}
          style={styles.input}
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          testID="register-input-senha"
          placeholder="Digite sua senha"
          placeholderTextColor={theme.colors.muted}
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable testID="btn-cadastrar" style={styles.primaryBtn} onPress={onSubmit}>
          <Text style={styles.primaryBtnText}>Cadastrar</Text>
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
});
