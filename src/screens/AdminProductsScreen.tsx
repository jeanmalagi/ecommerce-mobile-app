import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";

import { ProductImageAttachment, productsService } from "../services/productsService";
import { theme } from "../theme";

type ProductDraft = {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  image_url: string;
};

const categoryOptions = ["Games", "Informatica", "Casa", "Moda"];

const emptyDraft: ProductDraft = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  image_url: "",
};

const sanitizePriceInput = (value: string) => value.replace(/[^0-9.,]/g, "");

const parsePrice = (value: string) => {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  return Number(normalized);
};

const sanitizeStockInput = (value: string) => value.replace(/[^0-9]/g, "");

export function AdminProductsScreen() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
  const [selectedImage, setSelectedImage] = useState<ProductImageAttachment | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data = [], isLoading, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: productsService.list,
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: ProductDraft) => {
      const body = {
        name: payload.name.trim(),
        description: payload.description.trim(),
        price: parsePrice(payload.price),
        stock: Number(payload.stock),
        category: payload.category.trim(),
        image_url: payload.image_url.trim() || undefined,
        imageAttachment: selectedImage,
      };

      if (editingId) {
        return productsService.update(editingId, body);
      }
      return productsService.create(body);
    },
    onSuccess: async () => {
      closeFormModal();
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      refetch();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || "Nao foi possivel salvar o produto.";
      setFormError(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productsService.remove(id),
    onSuccess: async () => {
      setDeleteTarget(null);
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      refetch();
    },
  });

  const isSaving = saveMutation.isPending;

  const modalTitle = useMemo(
    () => (editingId ? "Editar produto" : "Novo produto"),
    [editingId]
  );

  const openCreateModal = () => {
    setEditingId(null);
    setDraft(emptyDraft);
    setSelectedImage(null);
    setFormError(null);
    setShowFormModal(true);
  };

  const openEditModal = (product: any) => {
    setEditingId(product.id);
    setDraft({
      name: String(product.name || ""),
      description: String(product.description || ""),
      price: String(product.price ?? "").replace(".", ","),
      stock: String(product.stock ?? ""),
      category: String(product.category || ""),
      image_url: String(product.image_url || ""),
    });
    setSelectedImage(null);
    setFormError(null);
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingId(null);
    setDraft(emptyDraft);
    setSelectedImage(null);
    setFormError(null);
  };

  const pickImageAttachment = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];
    const extension = asset.mimeType?.split("/")[1] || "jpg";
    const image: ProductImageAttachment = {
      uri: asset.uri,
      name: asset.fileName || `produto-${Date.now()}.${extension}`,
      type: asset.mimeType || "image/jpeg",
      file: (asset as any).file,
    };

    setSelectedImage(image);
  };

  const submitForm = () => {
    const price = parsePrice(draft.price);
    const stock = Number(draft.stock);

    if (!draft.name.trim() || !draft.description.trim() || !draft.category.trim()) {
      setFormError("Preencha nome, descricao e categoria.");
      return;
    }

    if (Number.isNaN(price) || price <= 0) {
      setFormError("Informe um preco valido maior que zero.");
      return;
    }

    if (Number.isNaN(stock) || stock <= 0) {
      setFormError("Informe um estoque valido maior que zero.");
      return;
    }

    setFormError(null);
    saveMutation.mutate(draft);
  };

  const confirmDelete = () => {
    if (!deleteTarget) {
      return;
    }
    deleteMutation.mutate(deleteTarget.id);
  };

  return (
    <View style={styles.container}>
      <Modal visible={showFormModal} animationType="slide" onRequestClose={closeFormModal}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{modalTitle}</Text>

          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={draft.name}
            onChangeText={(value) => setDraft((prev) => ({ ...prev, name: value }))}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descricao"
            multiline
            value={draft.description}
            onChangeText={(value) => setDraft((prev) => ({ ...prev, description: value }))}
          />
          <View style={styles.moneyInputRow}>
            <Text style={styles.moneyPrefix}>R$</Text>
            <TextInput
              style={styles.moneyInput}
              placeholder="0,00"
              keyboardType="decimal-pad"
              value={draft.price}
              onChangeText={(value) =>
                setDraft((prev) => ({ ...prev, price: sanitizePriceInput(value) }))
              }
            />
          </View>
          <Text style={styles.fieldHint}>Valor em R$ (ex.: 199,90)</Text>
          <TextInput
            style={styles.input}
            placeholder="Estoque"
            keyboardType="number-pad"
            value={draft.stock}
            onChangeText={(value) =>
              setDraft((prev) => ({ ...prev, stock: sanitizeStockInput(value) }))
            }
          />

          <Text style={styles.categoryTitle}>Categoria</Text>
          <View style={styles.categoryOptions}>
            {categoryOptions.map((option) => {
              const selected = draft.category === option;
              return (
                <Pressable
                  key={option}
                  style={[styles.categoryOption, selected && styles.categoryOptionSelected]}
                  onPress={() => setDraft((prev) => ({ ...prev, category: option }))}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      selected && styles.categoryOptionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput
            style={styles.input}
            placeholder="URL da foto (opcional)"
            value={draft.image_url}
            onChangeText={(value) => setDraft((prev) => ({ ...prev, image_url: value }))}
            autoCapitalize="none"
          />

          <View style={styles.attachmentRow}>
            <Pressable style={styles.attachBtn} onPress={pickImageAttachment}>
              <Text style={styles.attachBtnText}>Anexar foto</Text>
            </Pressable>
            {selectedImage ? (
              <Pressable
                style={styles.clearAttachmentBtn}
                onPress={() => setSelectedImage(null)}
              >
                <Text style={styles.clearAttachmentText}>Remover anexo</Text>
              </Pressable>
            ) : null}
          </View>
          <Text style={styles.attachmentInfo}>
            {selectedImage
              ? `Anexo selecionado: ${selectedImage.name}`
              : "Nenhum anexo selecionado"}
          </Text>

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <View style={styles.modalActions}>
            <Pressable style={styles.cancelBtn} onPress={closeFormModal} disabled={isSaving}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </Pressable>
            <Pressable style={styles.saveBtn} onPress={submitForm} disabled={isSaving}>
              <Text style={styles.saveBtnText}>{isSaving ? "Salvando..." : "Salvar"}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={Boolean(deleteTarget)}
        animationType="fade"
        transparent
        onRequestClose={() => setDeleteTarget(null)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Excluir produto?</Text>
            <Text style={styles.confirmText}>
              Deseja remover "{deleteTarget?.name || "produto"}"?
            </Text>
            <View style={styles.confirmActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setDeleteTarget(null)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.deleteBtn} onPress={confirmDelete}>
                <Text style={styles.deleteBtnText}>Excluir</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.headerRow}>
        <Text style={styles.title}>Produtos (Admin)</Text>
        <Pressable style={styles.newBtn} onPress={openCreateModal}>
          <Text style={styles.newBtnText}>Novo</Text>
        </Pressable>
      </View>

      {isLoading ? <Text style={styles.loading}>Carregando...</Text> : null}

      <FlatList
        data={data}
        keyExtractor={(item: any) => String(item.id)}
        refreshing={isLoading}
        onRefresh={refetch}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }: any) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>Categoria: {item.category}</Text>
            <Text style={styles.meta}>Estoque: {item.stock}</Text>
            <Text style={styles.price}>R$ {Number(item.price).toFixed(2)}</Text>

            <View style={styles.cardActions}>
              <Pressable style={styles.editBtn} onPress={() => openEditModal(item)}>
                <Text style={styles.editBtnText}>Editar</Text>
              </Pressable>
              <Pressable style={styles.removeBtn} onPress={() => setDeleteTarget(item)}>
                <Text style={styles.removeBtnText}>Excluir</Text>
              </Pressable>
            </View>
          </View>
        )}
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "700",
  },
  newBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  newBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  loading: {
    color: theme.colors.muted,
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
  },
  price: {
    color: theme.colors.primary,
    fontWeight: "700",
    fontSize: 18,
  },
  cardActions: {
    marginTop: 8,
    flexDirection: "row",
    gap: 8,
  },
  editBtn: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  editBtnText: {
    color: theme.colors.primary,
    fontWeight: "700",
  },
  removeBtn: {
    borderWidth: 1,
    borderColor: theme.colors.danger,
    borderRadius: theme.radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  removeBtnText: {
    color: theme.colors.danger,
    fontWeight: "700",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    gap: 10,
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.colors.text,
  },
  moneyInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
  },
  moneyPrefix: {
    color: theme.colors.muted,
    fontWeight: "700",
    marginRight: 8,
  },
  moneyInput: {
    flex: 1,
    paddingVertical: 10,
    color: theme.colors.text,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  fieldHint: {
    marginTop: -4,
    color: theme.colors.muted,
    fontSize: 12,
  },
  categoryTitle: {
    color: theme.colors.text,
    fontWeight: "600",
    marginTop: 2,
  },
  categoryOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryOption: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
  },
  categoryOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryOptionText: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  categoryOptionTextSelected: {
    color: "#fff",
  },
  attachmentRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  attachBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  attachBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  clearAttachmentBtn: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearAttachmentText: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  attachmentInfo: {
    color: theme.colors.muted,
    fontSize: 12,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  cancelBtnText: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  formError: {
    color: theme.colors.danger,
    fontSize: 13,
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
  deleteBtn: {
    backgroundColor: theme.colors.danger,
    borderRadius: theme.radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  deleteBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
});
