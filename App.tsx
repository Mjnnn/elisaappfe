// File App.tsx
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './src/navigation/AuthStack';
import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <View style={styles.container}>
      <NavigationContainer>
        <AuthStack />
      </NavigationContainer>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});