// path: /home/jatin/Documents/RN/bep/app/(tabs)/Reset/_layout.tsx
import Colors from "@/constants/colors";
import { Stack } from "expo-router";
import React from "react";

export default function ResetLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    />
  );
}
