import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "../context/AuthContext";
import { productsService } from "../services/productsService";
import { CartSuccessModal } from "../components/CartSuccessModal";
import { theme } from "../theme";
import { cartFeedbackStore } from "../utils/cartFeedbackStore";

export function ProductsScreen({ navigation }: any) {
  const { logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { data = [], isLoading, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: productsService.list,
  });

  useEffect(() => {
    console.log("[ProductsScreen] Component mounted");
    const unsubscribe = navigation.addListener("focus", () => {
      console.log("[ProductsScreen] Navigation focus event triggered");
      const message = cartFeedbackStore.consumeSuccessMessage();
      console.log("[ProductsScreen] Consumed message from store:", message);
      if (message) {
        setSuccessMessage(message);
        setShowSuccessModal(true);
      }
    });

    return unsubscribe;
  }, [navigation]);

  const requestLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
  };

  return (
    <View style={styles.container}>
      <CartSuccessModal
        visible={showSuccessModal}
        message={successMessage || ""}
        onDismiss={() => setShowSuccessModal(false)}
      />

      <Modal
        visible={isLogoutModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsLogoutModalOpen(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Deseja sair do app?</Text>
            <Text style={styles.confirmText}>Voce sera desconectado da sua conta.</Text>

            <View style={styles.confirmActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setIsLogoutModalOpen(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable style={styles.confirmButton} onPress={confirmLogout}>
                <Text style={styles.confirmButtonText}>Sair</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.headerRow}>
        <View>
          <Text testID="customer-brand" style={styles.brand}>MyStore</Text>
          <Text testID="customer-products-title" style={styles.title}>Produtos</Text>
        </View>
        <Pressable style={styles.logoutBtn} onPress={requestLogout}>
          <Text style={styles.logoutBtnText}>Sair</Text>
        </Pressable>
      </View>

      {isLoading ? <ActivityIndicator color={theme.colors.primary} /> : null}

      <FlatList
        data={data}
        keyExtractor={(item: any) => String(item.id)}
        refreshing={isLoading}
        contentContainerStyle={styles.listContent}
        onRefresh={refetch}
        renderItem={({ item }: any) => (
          <TouchableOpacity
            testID="product-card"
            style={styles.card}
            onPress={() => navigation.navigate("ProductDetails", { productId: item.id })}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.category}>{item.category}</Text>
            <Text style={styles.price}>R$ {Number(item.price).toFixed(2)}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
  },
  brand: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  logoutBtn: {
    backgroundColor: "#fff",
    borderRadius: theme.radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  logoutBtnText: {
    color: theme.colors.primary,
    fontWeight: "700",
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.md,
  },
  confirmCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: 12,
  },
  confirmTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "700",
  },
  confirmText: {
    color: theme.colors.muted,
    fontSize: 15,
  },
  confirmActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 4,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  cancelButtonText: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: 10,
    gap: 4,
    backgroundColor: theme.colors.surface,
  },
  name: {
    fontWeight: "700",
    fontSize: 17,
    color: theme.colors.text,
  },
  category: {
    color: theme.colors.muted,
  },
  price: {
    color: theme.colors.primary,
    fontWeight: "700",
    fontSize: 18,
  },
});
