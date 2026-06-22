import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAuth } from "../context/AuthContext";
import { ordersService } from "../services/ordersService";
import { theme } from "../theme";

export function OrdersScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = Boolean(user?.is_admin);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    orderId: number;
    status: string;
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: isAdmin ? ["orders", "admin"] : ["orders"],
    queryFn: isAdmin ? ordersService.getAllAdminOrders : ordersService.getMyOrders,
  });

  const list = Array.isArray(data) ? data : data?.orders || [];

  const statusOptions = ["pending", "paid", "shipped", "delivered", "cancelled"];
  const statusLabelMap: Record<string, string> = {
    pending: "Pendente",
    paid: "Pago",
    shipped: "Enviado",
    delivered: "Entregue",
    cancelled: "Cancelado",
  };

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      ordersService.updateAdminOrderStatus(id, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["orders", "admin"] }),
      ]);
      setUpdatingOrderId(null);
    },
    onError: () => {
      setUpdatingOrderId(null);
    },
  });

  const formatStatus = (status: string) => statusLabelMap[status] || status;

  const requestChangeStatus = (orderId: number, status: string) => {
    setPendingStatusChange({ orderId, status });
  };

  const confirmChangeStatus = () => {
    if (!pendingStatusChange) {
      return;
    }

    const { orderId, status } = pendingStatusChange;
    setPendingStatusChange(null);
    setUpdatingOrderId(orderId);
    updateStatusMutation.mutate({ id: orderId, status });
  };

  const cancelChangeStatus = () => {
    if (updatingOrderId) {
      return;
    }
    setPendingStatusChange(null);
  };

  return (
    <View style={styles.container}>
      <Modal
        visible={Boolean(pendingStatusChange)}
        animationType="fade"
        transparent
        onRequestClose={cancelChangeStatus}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Confirmar alteracao de status?</Text>
            <Text style={styles.confirmText}>
              Deseja realmente alterar o pedido #{pendingStatusChange?.orderId} para{" "}
              {pendingStatusChange?.status ? formatStatus(pendingStatusChange.status) : "-"}?
            </Text>

            <View style={styles.confirmActions}>
              <Pressable style={styles.cancelButton} onPress={cancelChangeStatus}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable style={styles.confirmButton} onPress={confirmChangeStatus}>
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <FlatList
        data={list}
        keyExtractor={(item: any) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>{isAdmin ? "Pedidos (Admin)" : "Pedidos"}</Text>
            {isLoading ? <Text style={styles.loading}>Carregando...</Text> : null}
            {!isLoading && list.length === 0 ? (
              <Text style={styles.empty}>Nenhum pedido encontrado.</Text>
            ) : null}
          </View>
        }
        renderItem={({ item: order }: any) => (
          <View style={styles.card}>
            <Text style={styles.orderId}>Pedido #{order.id}</Text>
            {isAdmin ? (
              <Text style={styles.meta}>Cliente: {order.user_name || order.email || "-"}</Text>
            ) : null}
            <Text style={styles.meta}>Status: {formatStatus(order.status)}</Text>
            <Text style={styles.total}>Total: R$ {Number(order.total).toFixed(2)}</Text>

            {isAdmin ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator
                contentContainerStyle={styles.statusActions}
              >
                {statusOptions.map((status) => {
                  const isCurrent = order.status === status;
                  const isUpdatingThis = updatingOrderId === order.id;

                  return (
                    <Pressable
                      key={`${order.id}-${status}`}
                      style={[
                        styles.statusButton,
                        isCurrent && styles.statusButtonCurrent,
                        isUpdatingThis && styles.statusButtonDisabled,
                      ]}
                      onPress={() => requestChangeStatus(order.id, status)}
                      disabled={isCurrent || isUpdatingThis}
                    >
                      <Text
                        style={[
                          styles.statusButtonText,
                          isCurrent && styles.statusButtonTextCurrent,
                        ]}
                      >
                        {formatStatus(status)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            ) : null}
          </View>
        )}
      />

      {updateStatusMutation.isError ? (
        <Text style={styles.error}>Nao foi possivel atualizar o status do pedido.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  listContent: {
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  loading: {
    color: theme.colors.muted,
    marginBottom: theme.spacing.sm,
  },
  empty: {
    color: theme.colors.muted,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  card: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    gap: 4,
  },
  orderId: {
    fontWeight: "700",
    color: theme.colors.text,
  },
  meta: {
    color: theme.colors.muted,
  },
  total: {
    color: theme.colors.primary,
    fontWeight: "700",
  },
  statusActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
    paddingRight: 6,
  },
  statusButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusButtonCurrent: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  statusButtonDisabled: {
    opacity: 0.6,
  },
  statusButtonText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  statusButtonTextCurrent: {
    color: "#fff",
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
    fontSize: 20,
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
  error: {
    color: theme.colors.danger,
    fontSize: 13,
    marginTop: 8,
  },
});
