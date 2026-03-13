import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignIn from './screens/SignIn';
import { NavigationContainer } from '@react-navigation/native';
import Toast, { ErrorToast } from 'react-native-toast-message';
import "./global.css";
export default function App() {
  const stack = createNativeStackNavigator();
  const toastConfig = {
    error: (props) => (<ErrorToast {...props} style={{ backgroundColor: '#e74c3c', borderLeftColor: "#e74c3c" }} text1Style={{ color: '#fff' }} text2Style={{ color: '#fff' }} />),
  }
  return (
    <>
      <NavigationContainer>
        <stack.Navigator>
          <stack.Screen
            name="SignIn"
            component={SignIn}
            options={{
              title: "Sign In",
              headerStyle: { backgroundColor: "#282C34" },
              headerTintColor: "#fff",
              headerTitleStyle: { fontWeight: "bold" },
              headerTitleAlign: "center"
            }}
          />
        </stack.Navigator>
      </NavigationContainer>
      <Toast config={toastConfig} />
    </>
  );
}
