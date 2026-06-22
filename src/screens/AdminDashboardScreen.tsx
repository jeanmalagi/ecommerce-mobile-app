import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "../context/AuthContext";
import { dashboardService } from "../services/dashboardService";
import { theme } from "../theme";

export function AdminDashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: dashboardService.getDashboard,
  });

  const requestLogout = () => {
    setIsMenuOpen(false);
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
  };

  const metrics = useMemo(
    () => [
      {
        key: "sales",
        value: `R$ ${Number(data?.totalSales ?? 0).toFixed(2)}`,
        label: "Faturamento",
      },
      {
        key: "orders",
        value: String(data?.totalOrders ?? 0),
        label: "Pedidos",
      },
      {
        key: "users",
        value: String(data?.totalUsers ?? 0),
        label: "Clientes",
      },
      {
        key: "stock",
        value: String(data?.lowStock ?? 0),
        label: "Estoque critico",
      },
    ],
    [data]
  );

  const recentOrders = Array.isArray(data?.recentOrders) ? data.recentOrders : [];
  const criticalProducts = Array.isArray(data?.criticalProducts) ? data.criticalProducts : [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      <Modal
        visible={isMenuOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <View style={styles.menuOverlay}>
          <Pressable style={styles.menuBackdrop} onPress={() => setIsMenuOpen(false)} />
          <View style={styles.menuPanel}>
            <Text style={styles.menuTitle}>Menu Admin</Text>
            <Text style={styles.menuSubtitle}>Ola, {user?.name}</Text>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setIsMenuOpen(false);
                navigation.navigate("ProdutosAdmin");
              }}
            >
              <Text style={styles.menuItemText}>Produtos</Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setIsMenuOpen(false);
                navigation.navigate("Pedidos");
              }}
            >
              <Text style={styles.menuItemText}>Pedidos</Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setIsMenuOpen(false);
                navigation.navigate("Estoque");
              }}
            >
              <Text style={styles.menuItemText}>Estoque</Text>
            </Pressable>

            <Pressable
              style={styles.menuLogoutItem}
              onPress={requestLogout}
            >
              <Text style={styles.menuLogoutText}>Sair</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isLogoutModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsLogoutModalOpen(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Deseja sair do app?</Text>
            <Text style={styles.confirmText}>Voce sera desconectado da sua conta admin.</Text>

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

      <View style={styles.banner}>
        <View style={styles.bannerHeader}>
          <Text style={styles.bannerTitle}>Painel Admin</Text>
          <Pressable
            style={styles.menuButton}
            onPress={() => setIsMenuOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Abrir menu admin"
          >
            <Text style={styles.menuButtonText}>☰</Text>
          </Pressable>
        </View>
        <Text style={styles.bannerText}>Ola, {user?.name}</Text>
      </View>

      <View style={styles.metricsGrid}>
        {metrics.map((metric) => (
          <View key={metric.key} style={styles.metricCard}>
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={styles.metricLabel}>{metric.label}</Text>
          </View>
        ))}
      </View>

      {isLoading ? <Text style={styles.loading}>Carregando dados do dashboard...</Text> : null}

      <View style={styles.actionsGrid}>
        <Pressable
          style={styles.actionCard}
          onPress={() => navigation.navigate("ProdutosAdmin")}
        >
          <Text style={styles.actionTitle}>Produtos</Text>
          <Text style={styles.actionText}>Gerenciar produtos</Text>
        </Pressable>

        <Pressable style={styles.actionCard} onPress={() => navigation.navigate("Pedidos")}>
          <Text style={styles.actionTitle}>Pedidos</Text>
          <Text style={styles.actionText}>Gerenciar pedidos</Text>
        </Pressable>

        <Pressable
          style={styles.actionCard}
          onPress={() => navigation.navigate("Estoque")}
        >
          <Text style={styles.actionTitle}>Estoque</Text>
          <Text style={styles.actionText}>Controle estoque</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pedidos recentes</Text>
        {recentOrders.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum pedido recente.</Text>
        ) : (
          recentOrders.map((order) => (
            <View key={String(order.id)} style={styles.listCard}>
              <View style={styles.listLeft}>
                <Text style={styles.listStrong}>Pedido #{order.id}</Text>
                <Text style={styles.listMuted}>{order.user_name || "Cliente"}</Text>
              </View>
              <Text style={styles.listStrong}>R$ {Number(order.total || 0).toFixed(2)}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estoque critico</Text>
        {criticalProducts.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum item em estoque critico.</Text>
        ) : (
          criticalProducts.map((product) => (
            <View key={String(product.id)} style={styles.listCard}>
              <Text style={styles.listStrong}>{product.name}</Text>
              <View style={styles.stockBadge}>
                <Text style={styles.stockBadgeText}>{product.stock}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <Pressable style={styles.logoutBtn} onPress={requestLogout}>
        <Text style={styles.logoutBtnText}>Sair</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    paddingBottom: 28,
  },
  banner: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
  },
  bannerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bannerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  menuButton: {
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  menuButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 26,
  },
  bannerText: {
    color: "#fff",
    marginTop: 2,
  },
  menuOverlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  menuBackdrop: {
    flex: 1,
  },
  menuPanel: {
    width: 260,
    backgroundColor: theme.colors.surface,
    paddingTop: 52,
    paddingHorizontal: theme.spacing.md,
    borderLeftWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
  },
  menuSubtitle: {
    color: theme.colors.muted,
    marginBottom: 6,
  },
  menuItem: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.background,
  },
  menuItemText: {
    color: theme.colors.text,
    fontWeight: "600",
    fontSize: 16,
  },
  menuLogoutItem: {
    marginTop: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    alignItems: "center",
  },
  menuLogoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
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
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  metricCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    width: "48%",
    minHeight: 94,
    justifyContent: "center",
    gap: 4,
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "700",
  },
  metricLabel: {
    color: theme.colors.muted,
    fontSize: 14,
  },
  loading: {
    color: theme.colors.muted,
    marginTop: 2,
  },
  actionsGrid: {
    gap: theme.spacing.sm,
  },
  actionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: 6,
  },
  actionTitle: {
    color: theme.colors.text,
    fontWeight: "700",
    fontSize: 22,
  },
  actionText: {
    color: theme.colors.muted,
    fontSize: 16,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: "700",
  },
  listCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listLeft: {
    gap: 3,
  },
  listStrong: {
    color: theme.colors.text,
    fontWeight: "700",
    fontSize: 18,
  },
  listMuted: {
    color: theme.colors.muted,
    fontSize: 15,
  },
  emptyText: {
    color: theme.colors.muted,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  stockBadge: {
    backgroundColor: theme.colors.danger,
    borderRadius: theme.radius.sm,
    minWidth: 42,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  stockBadgeText: {
    color: "#fff",
    fontWeight: "700",
  },
  logoutBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 6,
  },
  logoutBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
});
