// path: /home/jatin/Documents/RN/bep/app/(tabs)/_layout.jsx
import Colors from "@/constants/colors";
import { Tabs } from "expo-router";
import { Brain, Clock, Feather, TrendingUp } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.energy,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Brain",
          tabBarIcon: ({ color, size }) => <Brain size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Timeline",
          tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="trend"
        options={{
          title: "Trend",
          tabBarIcon: ({ color, size }) => (
            <TrendingUp size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="reset21"
        options={{
          title: "21 Day Reset",
          tabBarIcon: ({ color }) => (
            <Feather name="zap" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
