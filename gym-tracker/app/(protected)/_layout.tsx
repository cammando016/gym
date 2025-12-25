import { Slot, Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedLayout() {
    const { isLoggedIn } = useAuth();
    // isLoading && null;
  
    if (!isLoggedIn) {
      return <Redirect href="/(auth)/login" />;
    }
  
    return <Slot />;
}