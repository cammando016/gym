import { Slot, Redirect } from "expo-router";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

function AuthGate() {
  const { isLoading, isLoggedIn } = useAuth();

  if (!isLoggedIn) return <Redirect href="/login"/>;

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}
