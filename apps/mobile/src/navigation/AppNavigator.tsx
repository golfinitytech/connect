import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/ResetPasswordScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { NewRoundScreen } from '../screens/NewRoundScreen';
import { HoleMapScreen } from '../screens/HoleMapScreen';
import { OrderScreen } from '../screens/OrderScreen';
import { OrderStatusScreen } from '../screens/OrderStatusScreen';
import { PlayerSelectionScreen } from '../screens/PlayerSelectionScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RoundScoringScreen } from '../screens/RoundScoringScreen';
import { RoundSummaryScreen } from '../screens/RoundSummaryScreen';
import { ScorecardScreen } from '../screens/ScorecardScreen';
import { SocialScreen } from '../screens/SocialScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { colors } from '../theme/colors';
import { Logo } from '../components/Logo';
import { RootStackParamList, TabParamList } from './types';
import { useAuth } from '../context/AuthContext';
import { RectSkeleton } from '../components/Skeleton';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: '#8A948F',
        tabBarStyle: {
          height: 74,
          borderTopColor: colors.border,
          backgroundColor: '#FCFDFC',
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginBottom: 8,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Social"
        component={SocialScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="people" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Order"
        component={OrderScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="restaurant" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Logo size={120} />
        <RectSkeleton width={120} height={4} borderRadius={2} style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Tabs">
          <Stack.Screen name="Tabs" component={TabsNavigator} />
          <Stack.Screen name="NewRound" component={NewRoundScreen} />
          <Stack.Screen name="PlayerSelection" component={PlayerSelectionScreen} />
          <Stack.Screen name="RoundScoring" component={RoundScoringScreen} />
          <Stack.Screen name="Scorecard" component={ScorecardScreen} />
          <Stack.Screen name="RoundSummary" component={RoundSummaryScreen} />
          <Stack.Screen name="OrderStatus" component={OrderStatusScreen} />
          <Stack.Screen name="HoleMap" component={HoleMapScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
