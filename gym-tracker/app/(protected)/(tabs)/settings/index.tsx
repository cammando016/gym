import { useAuth } from "@/contexts/AuthContext";
import AccountSettings from "@/forms/account/edit/AccountSettings";
import { View, Text } from "react-native";

export default function Settings() {
    const { user } = useAuth();
    if (!user) return <View><Text>You must be logged in to view this page</Text></View>
    return <AccountSettings key={JSON.stringify(user)} user={user} />
}