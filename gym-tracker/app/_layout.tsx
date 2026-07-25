import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Slot } from "expo-router";
import { AuthProvider } from "@/contexts/AuthContext";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Slot />
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
