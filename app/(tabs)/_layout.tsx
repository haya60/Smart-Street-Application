import { Tabs } from 'expo-router';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons , MaterialIcons} from '@expo/vector-icons'; // Import Ionicons for the icons
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

import HomeScreen from './index'; // The home screen file
import UploadPage from '../uploadPage';
import LivePage from '../livePage';


// Stack for Home Tab
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="UploadPage" component={UploadPage} options={{ title: 'Upload' }} />
      <Stack.Screen name="LivePage" component={LivePage} options={{ title: 'Live' }} />
    </Stack.Navigator>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeStack} // Use HomeStack as the component
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: () => (
            <MaterialIcons name="home" size={24} color={Colors[colorScheme ?? 'light'].tint} />
          ),

        }}
        
      />

      <Tabs.Screen
        name="profilePage"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
