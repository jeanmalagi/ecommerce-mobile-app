import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { CartSuccessModal } from "../components/CartSuccessModal";
import { cartService } from "../services/cartService";
import { ordersService } from "../services/ordersService";
import { theme } from "../theme";

export function CartScreen({ navigation }: any) {
  const queryClient = useQueryClient();
  const [itemToRemove, setItemToRemove] = useState<any>(null);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutSuccessMessage, setCheckoutSuccessMessage] = useState("");
  const [showCheckoutSuccessModal, setShowCheckoutSuccessModal] = useState(false);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["cart"],
    queryFn: cartService.getCart,
  });

  const items = data?.cart || data?.items || [];

  const requestRemoveItem = (item: any) => {
    setItemToRemove(item);
    setIsRemoveModalOpen(true);
  };

  const confirmRemoveItem = async () => {
    if (!itemToRemove) {
      return;
    }

    try {
      await cartService.removeItem(itemToRemove.id);
      setIsRemoveModalOpen(false);
      setItemToRemove(null);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      refetch();
    } catch {
      setIsRemoveModalOpen(false);
      setItemToRemove(null);
    }
  };

  const requestCheckout = () => {
    if (items.length === 0 || isCheckoutLoading) {
      return;
    }

    setCheckoutError(null);
    setIsCheckoutModalOpen(true);
  };

  const confirmCheckout = async () => {
    try {
      setIsCheckoutLoading(true);
      setCheckoutError(null);

      const result = await ordersService.createOrder();

      setIsCheckoutModalOpen(false);
      setCheckoutSuccessMessage(result?.message || "Pedido criado com sucesso");
      setShowCheckoutSuccessModal(true);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["cart"] }),
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
      ]);

      refetch();
      navigation.navigate("Pedidos");
    } catch (error: any) {
      const backendMessage = error?.response?.data?.error;
      setCheckoutError(
        backendMessage || "Nao foi possivel finalizar o pedido. Tente novamente."
      );
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const cancelCheckout = () => {
    if (isCheckoutLoading) {
      return;
    }
    setIsCheckoutModalOpen(false);
    setCheckoutError(null);
  };

  const total = items.reduce((sum: number, item: any) => {
    const price = Number(item.price ?? item.product_price ?? 0);
    return sum + price * Number(item.quantity ?? 0);
  }, 0);

  return (
    <View style={styles.container}>
      <CartSuccessModal
        visible={showCheckoutSuccessModal}
        message={checkoutSuccessMessage}
        onDismiss={() => setShowCheckoutSuccessModal(false)}
      />

      <Modal
        visible={isRemoveModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsRemoveModalOpen(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Remover item do carrinho?</Text>
            <Text style={styles.confirmText}>
              Deseja remover "{itemToRemove?.name ?? itemToRemove?.product_name}" do carrinho?
            </Text>

            <View style={styles.confirmActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setIsRemoveModalOpen(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable style={styles.removeButton} onPress={confirmRemoveItem}>
                <Text style={styles.removeButtonText}>Remover</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isCheckoutModalOpen}
        animationType="fade"
        transparent
        onRequestClose={cancelCheckout}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Finalizar pedido?</Text>
            <Text style={styles.confirmText}>
              Deseja concluir a compra com {items.length} {items.length === 1 ? "item" : "itens"}?
            </Text>
            <Text style={styles.checkoutTotalText}>Total: R$ {total.toFixed(2)}</Text>
            {checkoutError ? <Text style={styles.checkoutError}>{checkoutError}</Text> : null}

            <View style={styles.confirmActions}>
              <Pressable style={styles.cancelButton} onPress={cancelCheckout} disabled={isCheckoutLoading}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={[styles.checkoutConfirmButton, isCheckoutLoading && styles.actionButtonDisabled]}
                onPress={confirmCheckout}
                disabled={isCheckoutLoading}
              >
                <Text style={styles.checkoutConfirmButtonText}>
                  {isCheckoutLoading ? "Finalizando..." : "Confirmar"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Text style={styles.title}>Carrinho</Text>
      {isLoading ? <Text style={styles.loading}>Carregando...</Text> : null}

      <FlatList
        data={items}
        keyExtractor={(item: any) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }: any) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.name}>{item.name ?? item.product_name}</Text>
              <Text style={styles.meta}>Qtd: {item.quantity}</Text>
            </View>
            <Pressable style={styles.removeBtn} onPress={() => requestRemoveItem(item)}>
              <Text style={styles.removeBtnText}>Remover</Text>
            </Pressable>
          </View>
        )}
      />

      <Text style={styles.total}>Total: R$ {total.toFixed(2)}</Text>

      <Pressable
        style={[
          styles.checkoutButton,
          (items.length === 0 || isCheckoutLoading) && styles.actionButtonDisabled,
        ]}
        onPress={requestCheckout}
        disabled={items.length === 0 || isCheckoutLoading}
      >
        <Text style={styles.checkoutButtonText}>Finalizar compra</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
  },
  loading: {
    color: theme.colors.muted,
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
  removeButton: {
    backgroundColor: theme.colors.danger,
    borderRadius: theme.radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  checkoutConfirmButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  checkoutConfirmButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  listContent: {
    paddingBottom: 8,
  },
  row: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
  },
  name: {
    fontWeight: "700",
    fontSize: 16,
    color: theme.colors.text,
  },
  meta: {
    color: theme.colors.muted,
  },
  removeBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: theme.colors.danger,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  removeBtnText: {
    color: theme.colors.danger,
    fontWeight: "700",
  },
  total: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 8,
    color: theme.colors.primary,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  checkoutButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 13,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  checkoutTotalText: {
    color: theme.colors.primary,
    fontWeight: "700",
    fontSize: 16,
  },
  checkoutError: {
    color: theme.colors.danger,
    fontSize: 14,
  },
});
