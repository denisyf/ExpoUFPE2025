import { NavigationContainer } from '@react-navigation/native'
import { GestureHandlerRootView } from "react-native-gesture-handler";


import Routes from './src/routes';

export default function App() {
  return (
    <GestureHandlerRootView>
      <NavigationContainer>
        <Routes />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

