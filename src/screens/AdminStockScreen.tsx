import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { productsService } from "../services/productsService";
import { theme } from "../theme";

const sanitizeStockInput = (value: string) => value.replace(/[^0-9]/g, "");

export function AdminStockScreen() {
  const queryClient = useQueryClient();
  const [stockUpdates, setStockUpdates] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const { data = [], isLoading, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: productsService.list,
  });

  const updateStockMutation = useMutation({
    mutationFn: ({ id, stock }: { id: number; stock: number }) =>
      productsService.updateStock(id, stock),
    onSuccess: async (_, { id }) => {
      setStockUpdates((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      refetch();
    },
    onSettled: () => {
      setUpdatingId(null);
    },
  });

  const handleStockChange = (id: number, value: string) => {
    const sanitized = sanitizeStockInput(value);
    setStockUpdates((prev) => ({ ...prev, [id]: sanitized }));
  };

  const handleUpdateStock = (id: number) => {
    const newStock = stockUpdates[id];
    if (newStock === undefined || newStock.trim() === "") {
      return;
    }

    const stockValue = Number(newStock);
    if (Number.isNaN(stockValue) || stockValue < 0) {
      return;
    }

    setUpdatingId(id);
    updateStockMutation.mutate({ id, stock: stockValue });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gerenciamento de Estoque</Text>

      {isLoading ? <ActivityIndicator color={theme.colors.primary} /> : null}

      {updateStockMutation.isError ? (
        <Text style={styles.error}>Nao foi possivel atualizar o estoque.</Text>
      ) : null}

      <FlatList
        data={data}
        keyExtractor={(item: any) => String(item.id)}
        refreshing={isLoading}
        onRefresh={refetch}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }: any) => {
          const isUpdating = updatingId === item.id;
          const hasChange = stockUpdates[item.id] !== undefined;

          return (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>Estoque atual: {item.stock}</Text>

              <View style={styles.updateRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Novo estoque"
                  keyboardType="number-pad"
                  value={stockUpdates[item.id] || ""}
                  onChangeText={(value) => handleStockChange(item.id, value)}
                />
                <Pressable
                  style={[styles.updateBtn, (!hasChange || isUpdating) && styles.updateBtnDisabled]}
                  onPress={() => handleUpdateStock(item.id)}
                  disabled={!hasChange || isUpdating}
                >
                  <Text style={styles.updateBtnText}>{isUpdating ? "..." : "Salvar"}</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "700",
  },
  error: {
    color: theme.colors.danger,
    fontSize: 13,
  },
  listContent: {
    paddingBottom: theme.spacing.lg,
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
  meta: {
    color: theme.colors.muted,
    marginBottom: 6,
  },
  updateRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: theme.colors.text,
  },
  updateBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  updateBtnDisabled: {
    opacity: 0.6,
  },
  updateBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
});
