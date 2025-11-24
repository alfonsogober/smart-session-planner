/**
 * Main App component with navigation
 */
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ThemeProvider } from "styled-components/native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "./src/styles/theme";
import { HomeScreen } from "./src/view/screens/HomeScreen";
import { SuggestionsScreen } from "./src/view/screens/SuggestionsScreen";
import { SessionTypesScreen } from "./src/view/screens/SessionTypesScreen";
import { AvailabilityScreen } from "./src/view/screens/AvailabilityScreen";
import { CalendarScreen } from "./src/view/screens/CalendarScreen";
import { StatsScreen } from "./src/view/screens/StatsScreen";
import { Container, BodyText, SecondaryText } from "./src/view/components/StyledComponents";
import { createStackNavigator } from "@react-navigation/stack";
import { TouchableOpacity, View } from "react-native";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

/**
 * Home stack navigator with Home and Suggestions screens
 */
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="Suggestions" component={SuggestionsScreen} />
  </Stack.Navigator>
);

/**
 * Settings stack navigator with Session Types and Availability
 */
const SettingsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SettingsMain" component={SettingsMainScreen} />
    <Stack.Screen name="SessionTypes" component={SessionTypesScreen} />
    <Stack.Screen name="Availability" component={AvailabilityScreen} />
  </Stack.Navigator>
);

/**
 * Main settings screen
 */
const SettingsMainScreen = ({ navigation }: any) => (
  <Container style={{ justifyContent: "center", alignItems: "center", padding: 20 }}>
    <BodyText style={{ fontSize: 24, fontWeight: "700", marginBottom: 32 }}>Settings</BodyText>
    <TouchableOpacity
      accessible={true}
      accessibilityLabel="Manage session types"
      accessibilityRole="button"
      onPress={() => navigation.navigate("SessionTypes")}
      style={{
        width: "100%",
        backgroundColor: "#FFFFFF",
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
      }}
    >
      <BodyText style={{ fontSize: 18, fontWeight: "600" }}>Session Types</BodyText>
      <SecondaryText style={{ marginTop: 4 }}>Manage your session types</SecondaryText>
    </TouchableOpacity>
    <TouchableOpacity
      accessible={true}
      accessibilityLabel="Manage availability"
      accessibilityRole="button"
      onPress={() => navigation.navigate("Availability")}
      style={{
        width: "100%",
        backgroundColor: "#FFFFFF",
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
      }}
    >
      <BodyText style={{ fontSize: 18, fontWeight: "600" }}>Availability</BodyText>
      <SecondaryText style={{ marginTop: 4 }}>Set your weekly availability</SecondaryText>
    </TouchableOpacity>
  </Container>
);


/**
 * Custom tab bar icon component with better visual feedback
 */
const TabBarIcon = ({ focused, icon }: { focused: boolean; icon: string }) => {
  return (
    <BodyText style={{ fontSize: 22, opacity: focused ? 1 : 0.4 }}>
      {icon}
    </BodyText>
  );
};

/**
 * Tab Navigator component that uses safe area insets
 */
const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary.main,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          height: 60 + insets.bottom,
          paddingBottom: Math.max(8, insets.bottom + 8),
          paddingTop: 8,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon="🏠" />,
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: "Calendar",
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon="📅" />,
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarLabel: "Stats",
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon="📊" />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon="⚙️" />,
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Main App component
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
