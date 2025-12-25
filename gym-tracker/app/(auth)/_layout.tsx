import { Slot, Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthLayout() {
    const { isLoggedIn } = useAuth();

    if (isLoggedIn) {
        return <Redirect href="/(protected)/(tabs)" />;
    }

    return <Slot />
}