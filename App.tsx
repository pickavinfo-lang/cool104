import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CoinProvider } from './src/context/CoinContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { GameScreen } from './src/screens/GameScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { DoubleUpScreen } from './src/screens/DoubleUpScreen';
import { ShopScreen } from './src/screens/ShopScreen';
import { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <CoinProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Game" component={GameScreen} />
            <Stack.Screen name="Result" component={ResultScreen} />
            <Stack.Screen name="DoubleUp" component={DoubleUpScreen} />
            <Stack.Screen name="Shop" component={ShopScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </CoinProvider>
    </SafeAreaProvider>
  );
}
