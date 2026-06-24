import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { cartService } from "../services/cartService";
import { productsService } from "../services/productsService";
import { theme } from "../theme";
import { cartFeedbackStore } from "../utils/cartFeedbackStore";

export function ProductDetailsScreen({ route, navigation }: any) {
  const { productId } = route.params;
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => productsService.getById(productId),
  });

  const addToCart = async () => {
    const stock = Number(data?.stock ?? 0);
    if (stock <= 0) {
      Alert.alert("Indisponivel", "Este produto esta sem estoque");
      return;
    }

    try {
      await cartService.addItem(productId, quantity);
      const successMessage = `${data?.name || "Produto"} adicionado ao carrinho`;
      console.log("[ProductDetailsScreen] Saving success message to store:", successMessage);
      cartFeedbackStore.setSuccessMessage(successMessage);
      console.log("[ProductDetailsScreen] Invalidating cart cache");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      console.log("[ProductDetailsScreen] Calling goBack()");
      navigation.goBack();
    } catch {
      Alert.alert("Erro", "Nao foi possivel adicionar no carrinho");
    }
  };

  const increaseQuantity = () => {
    const stock = Number(data?.stock ?? 0);
    setQuantity((prev) => {
      if (stock <= 0) {
        return 1;
      }
      return Math.min(prev + 1, stock);
    });
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  if (isLoading) {
    return <Text style={styles.loading}>Carregando...</Text>;
  }

  if (!data) {
    return <Text style={styles.loading}>Produto nao encontrado.</Text>;
  }

  const stock = Number(data.stock ?? 0);
  const isOutOfStock = stock <= 0;
  const maxReached = quantity >= stock && stock > 0;
  const canDecrease = quantity > 1;
  const subtotal = Number(data.price ?? 0) * quantity;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{data.name}</Text>
        <Text style={styles.text}>{data.description}</Text>
        <Text style={styles.meta}>Categoria: {data.category}</Text>
        <Text style={styles.meta}>Estoque: {data.stock}</Text>
        <Text style={styles.price}>R$ {Number(data.price).toFixed(2)}</Text>

        <View style={styles.quantitySection}>
          <Text style={styles.quantityLabel}>Quantidade</Text>
          <View style={styles.quantityRow}>
            <Pressable
              style={[styles.stepperBtn, !canDecrease && styles.stepperBtnDisabled]}
              onPress={decreaseQuantity}
              disabled={!canDecrease}
            >
              <Text style={styles.stepperBtnText}>-</Text>
            </Pressable>

            <View style={styles.quantityValueBox}>
              <Text style={styles.quantityValue}>{quantity}</Text>
            </View>

            <Pressable
              style={[styles.stepperBtn, (isOutOfStock || maxReached) && styles.stepperBtnDisabled]}
              onPress={increaseQuantity}
              disabled={isOutOfStock || maxReached}
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </Pressable>
          </View>
          <Text style={styles.subtotal}>Subtotal: R$ {subtotal.toFixed(2)}</Text>
        </View>

        <Pressable
          testID="btn-add-to-cart"
          style={[styles.primaryBtn, isOutOfStock && styles.primaryBtnDisabled]}
          onPress={addToCart}
          disabled={isOutOfStock}
        >
          <Text style={styles.primaryBtnText}>
            {isOutOfStock ? "Sem estoque" : "Adicionar ao carrinho"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  loading: {
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
    color: theme.colors.muted,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
  },
  text: {
    fontSize: 16,
    color: theme.colors.text,
  },
  meta: {
    color: theme.colors.muted,
  },
  price: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.primary,
    marginTop: 6,
  },
  quantitySection: {
    marginTop: 6,
    gap: 8,
  },
  quantityLabel: {
    color: theme.colors.text,
    fontWeight: "600",
    fontSize: 15,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnDisabled: {
    backgroundColor: theme.colors.border,
  },
  stepperBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 22,
    lineHeight: 24,
  },
  quantityValueBox: {
    minWidth: 56,
    height: 40,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  quantityValue: {
    color: theme.colors.text,
    fontWeight: "700",
    fontSize: 18,
  },
  subtotal: {
    color: theme.colors.muted,
    fontSize: 14,
  },
  primaryBtn: {
    marginTop: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryBtnDisabled: {
    backgroundColor: theme.colors.border,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
