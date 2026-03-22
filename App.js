import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignIn from './screens/SignIn';
import { NavigationContainer } from '@react-navigation/native';
import Toast, { ErrorToast, InfoToast, SuccessToast } from 'react-native-toast-message';
import "./global.css";
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { useContext, useEffect, useState } from 'react';
import Dashboard from './screens/drawer/Dashboard';
import { Drawer, List, MD3Colors } from 'react-native-paper';
import Spinner from 'react-native-loading-spinner-overlay';
import { AppContext } from './context/AppContext';
import WorkOrder from './screens/drawer/WorkOrder';
import TechnicianServices from './screens/drawer/TechnicianServices';
import WorkOrderEdit from './screens/WorkOrderEdit';
import WorkOrderFilter from './screens/WorkOrderFilter';
import TechnicianFilter from './screens/TechnicianFilter';
import TechnicianEdit from './screens/TechnicianEdit';
const HEADEROPTIONS = {
  headerStyle: { backgroundColor: "#282C34" },
  headerTintColor: "#fff",
  headerTitleStyle: { fontWeight: "bold" },
}
export default function App() {
  const { token, loading, logout } = useContext(AppContext)
  const stack = createNativeStackNavigator();
  const toastConfig = {
    error: (props) => (<ErrorToast {...props} style={{ backgroundColor: '#e74c3c', borderLeftColor: "#e74c3c" }} text1Style={{ color: '#fff' }} text2Style={{ color: '#fff' }} />),
    success: (props) => (<SuccessToast {...props} style={{ backgroundColor: '#2ecc71', borderLeftColor: "#2ecc71" }} text1Style={{ color: '#fff' }} text2Style={{ color: '#fff' }} />),
    info: (props) => (<InfoToast {...props} style={{ backgroundColor: '#2B7FFF', borderLeftColor: "#2B7FFF" }} text1Style={{ color: '#fff', fontSize: 15 }} text2Style={{ color: '#fff' }} />)
  }
  return (
    <>
      <KeyboardProvider>
        <Spinner visible={loading} />
        <NavigationContainer>
          <stack.Navigator >
            {
              token ?
                <>
                  <stack.Screen
                    name="DashboardDrawer"
                    component={DashboardDrawer}
                    options={{ headerShown: false }} />
                  <stack.Screen
                    name='WorkOrderEdit'
                    component={WorkOrderEdit}
                    options={{ ...HEADEROPTIONS, title: "Edit or Add Work Order Record" }}
                  />
                  <stack.Screen
                    name='TechnicianEdit'
                    component={TechnicianEdit}
                    options={{ ...HEADEROPTIONS, title: "Edit Technician Services" }}
                  />
                  <stack.Screen
                    name='WorkOrderFilter'
                    component={WorkOrderFilter}
                    options={{ ...HEADEROPTIONS, title: "Filter Work Orders", animation: "slide_from_bottom", presentation: "modal" }}
                  />
                  <stack.Screen
                    name='TechnicianFilter'
                    component={TechnicianFilter}
                    options={{ ...HEADEROPTIONS, title: "Filter Technician", animation: "slide_from_bottom", presentation: "modal" }}
                  />
                </>
                :
                <stack.Screen
                  name="SignIn"
                  component={SignIn}
                  options={{
                    headerShown: false
                  }}
                />}

          </stack.Navigator>
        </NavigationContainer>
      </KeyboardProvider>
      <Toast config={toastConfig} />
    </>
  );

}
function DashboardDrawer() {
  const Drawer = createDrawerNavigator();
  return (
    <Drawer.Navigator drawerContent={(props) => (<CustomDrawerContent {...props} />)}>
      <Drawer.Screen options={{ ...HEADEROPTIONS, title: "Dashboard", drawerItemStyle: { display: "none" } }} name="Dashboard" component={Dashboard} />
      <Drawer.Screen name="Work Orders" component={WorkOrder} options={{ ...HEADEROPTIONS, drawerItemStyle: { display: "none" } }} />
      <Drawer.Screen name="Technician Services" component={TechnicianServices} options={{ ...HEADEROPTIONS, drawerItemStyle: { display: "none" } }} />
    </Drawer.Navigator>
  )
}
function CustomDrawerContent(props) {
  const currentScreen = props.state.routes[props.state.index].name
  return (
    <DrawerContentScrollView style={{ backgroundColor: "#282C34" }} {...props}>
      <Drawer.Item style={{ right: 10 }} active={currentScreen === "Dashboard"} theme={{ colors: { primary: "#8a85ff", onSurfaceVariant: "white", background: "#282C34", onSurface: "white", secondaryContainer: "transparent", onSecondaryContainer: "#8a85ff" } }} label='Dashboard' icon="view-dashboard" onPress={() => props.navigation.navigate("Dashboard")} />
      <List.Section>
        <List.Accordion theme={{ colors: { primary: "white", onSurfaceVariant: "white", background: "#282C34", onSurface: "white", secondaryContainer: "transparent", onSecondaryContainer: "#8a85ff" } }} title="Maintenance Management" left={(props) => <List.Icon {...props} icon="tray" />}>
          <List.Section>
            <List.Accordion theme={{ colors: { primary: "white", onSurfaceVariant: "white", background: "#282C34", onSurface: "white", secondaryContainer: "transparent", onSecondaryContainer: "#8a85ff" } }} style={{ backgroundColor: "#282C34" }} title="Transactions" left={(props) => <List.Icon {...props} icon="folder" />}>
              <Drawer.Item style={{ right: 10 }} active={currentScreen === "Work Orders"} theme={{ colors: { primary: "#8a85ff", onSurfaceVariant: "white", background: "#282C34", onSurface: "white" } }} label='Work Orders' onPress={() => props.navigation.navigate("Work Orders")} />
              <Drawer.Item style={{ right: 10 }} active={currentScreen === "Technician Services"} theme={{ colors: { primary: "#8a85ff", onSurfaceVariant: "white", background: "#282C34", onSurface: "white" } }} label='Technician Services' onPress={() => props.navigation.navigate("Technician Services")} />
            </List.Accordion>
          </List.Section>
        </List.Accordion>
      </List.Section>
    </DrawerContentScrollView>
  )
}
