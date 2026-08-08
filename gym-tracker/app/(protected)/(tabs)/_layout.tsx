import { Tabs } from 'expo-router';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: 'green' }}> 
            <Tabs.Screen
                name='workouts'
                options={{
                    title: 'Workouts',
                }}
            />
            <Tabs.Screen
                name='progression'
                options={{
                    title: 'Progression',
                }}
            />
            <Tabs.Screen 
                name='index'
                options={{
                    title: 'Home',
                }}
            />
            <Tabs.Screen
                name='feed'
                options={{
                    title: 'Feed',
                }}
            />
            <Tabs.Screen 
                name='settings'
                options={{
                    title: 'Settings',
                }}
            />
        </Tabs>
    )
}