import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './index'; 
import UploadPage from '../uploadPage';
import LivePage from '../livePage';
import ProfilePage from './profilePage'; 
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import {Colors} from '@/constants/Colors'; 

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack for Home Tab
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="UploadPage" component={UploadPage} options={{ title: 'Upload' }} />
      <Stack.Screen name="LivePage" component={LivePage} options={{ title: 'Live' }} />
    </Stack.Navigator>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          title: 'Home', 
          tabBarLabel: 'Home', 
          tabBarIcon: () => (
            <MaterialIcons name="home" size={24} color={Colors[colorScheme ?? 'light'].tint} />
          ),
        }}
      />

      <Tab.Screen
        name="ProfileTab" 
        component={ProfilePage} 
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name={focused ? 'person' : 'person-outline'} color={color} size={28}/>
          ),
        }}
      />
    </Tab.Navigator>
  );
}