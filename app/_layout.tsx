// path: /home/jatin/Documents/RN/bep/app/_layout.tsx
import Colors from "@/constants/colors";
import useBrainStore from "@/store/brainStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const router = useRouter();


  useEffect(() => {
    const checkOnboarding = async () => {
      const complete = await AsyncStorage.getItem("@onboarding_complete");
      if (!complete) {
        router.replace("/(intro)/screen1");
      } else {
        router.replace("/(tabs)/(home)");
      }
    };
    checkOnboarding();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" options={{ title: "Not Found" }} />
      <Stack.Screen name="(intro)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const checkAndResetDay = useBrainStore((s) => s.checkAndResetDay);

  useEffect(() => {
    checkAndResetDay();
    SplashScreen.hideAsync();
  }, []);



  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <RootLayoutNav />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
