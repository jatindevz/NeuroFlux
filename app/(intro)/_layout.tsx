import Colors from "@/constants/colors";
import { Stack } from "expo-router";
import React from "react";
import { StatusBar } from "react-native";

export default function IntroLayout() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="screen1" />
        <Stack.Screen name="screen2" />
        <Stack.Screen name="screen3" />
        <Stack.Screen name="screen4" />
        <Stack.Screen name="screen5" />
      </Stack>
    </>
  );
}
