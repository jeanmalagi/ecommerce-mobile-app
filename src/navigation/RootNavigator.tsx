import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "../context/AuthContext";
import { LoadingScreen } from "../components/LoadingScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { ProductsScreen } from "../screens/ProductsScreen";
import { AdminProductsScreen } from "../screens/AdminProductsScreen";
import { ProductDetailsScreen } from "../screens/ProductDetailsScreen";
import { CartScreen } from "../screens/CartScreen";
import { OrdersScreen } from "../screens/OrdersScreen";
import { AdminDashboardScreen } from "../screens/AdminDashboardScreen";
import { AdminStockScreen } from "../screens/AdminStockScreen";
import { theme } from "../theme";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const defaultStackOptions = {
  headerStyle: {
    backgroundColor: theme.colors.primary,
  },
  headerTintColor: "#ffffff",
  headerTitleStyle: {
    fontWeight: "700" as const,
  },
  contentStyle: {
    backgroundColor: theme.colors.background,
  },
};

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={defaultStackOptions}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: "#ffffff",
        headerTitleStyle: {
          fontWeight: "700",
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarStyle: {
          borderTopColor: theme.colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}
    >
      <Tab.Screen name="Produtos" component={ProductsScreen} />
      <Tab.Screen name="Carrinho" component={CartScreen} />
      <Tab.Screen name="Pedidos" component={OrdersScreen} />
    </Tab.Navigator>
  );
}

function CustomerStack() {
  return (
    <Stack.Navigator screenOptions={defaultStackOptions}>
      <Stack.Screen
        name="CustomerHome"
        component={CustomerTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator screenOptions={defaultStackOptions}>
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="ProdutosAdmin" component={AdminProductsScreen} options={{ title: "Produtos" }} />
      <Stack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
        options={{ title: "Detalhes do produto" }}
      />
      <Stack.Screen name="Pedidos" component={OrdersScreen} />
      <Stack.Screen name="Estoque" component={AdminStockScreen} />
    </Stack.Navigator>
  );
}

export function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AuthStack />;
  }

  if (user.is_admin) {
    return <AdminStack />;
  }

  return <CustomerStack />;
}
