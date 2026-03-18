import { Slot, Redirect, Stack } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedLayout() {
    const { isLoggedIn } = useAuth();
    // isLoading && null;
  
    if (!isLoggedIn) {
      return <Redirect href="/(auth)/login" />;
    }
  
    return (
      <Stack>
        <Stack.Screen name="(tabs)" options={{headerShown: false}} />
      </Stack>
    );
}