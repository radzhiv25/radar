import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={22} style={{ marginBottom: -2 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? '#e7e5e4' : '#44403c',
        tabBarInactiveTintColor: isDark ? '#78716c' : '#a8a29e',
        tabBarStyle: {
          backgroundColor: isDark ? '#0c0a09' : '#fafaf9',
          borderTopColor: isDark ? '#292524' : '#e7e5e4',
          ...Platform.select({
            ios: { paddingTop: 4 },
            default: {},
          }),
        },
        headerStyle: {
          backgroundColor: isDark ? '#0c0a09' : '#fafaf9',
        },
        headerTintColor: isDark ? '#e7e5e4' : '#44403c',
        headerTitleStyle: { fontWeight: '500', fontSize: 17 },
        headerShadowVisible: false,
        headerShown: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="map-marker" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
