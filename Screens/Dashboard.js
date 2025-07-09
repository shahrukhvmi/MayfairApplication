import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import DashboardHome from './DashboardHome';
import OrdersScreen from './OrdersScreen';
import AddressBookScreen from './AddressBookScreen';
import ChangePasswordScreen from './ChangePasswordScreen';

const Tab = createBottomTabNavigator();

const Dashboard = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: '#4B0082',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingTop: 10,
          paddingBottom: 10,
          height: 60,
        },
        // tabBarLabelStyle: {fontSize: 12},
        tabBarShowLabel: false, // Hide labels
        tabBarIcon: ({color, size}) => {
          let iconName;
          switch (route.name) {
            case 'Dashboard':
              iconName = 'home-outline';
              break;
            case 'Orders':
              iconName = 'list-outline';
              break;
            case 'Address Book':
              iconName = 'location-outline';
              break;
            case 'Change Password':
              iconName = 'key-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }
          return <Ionicons name={iconName} size={30} color={color} />;
        },
      })}>
      <Tab.Screen name="Dashboard" component={DashboardHome} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Address Book" component={AddressBookScreen} />
      <Tab.Screen name="Change Password" component={ChangePasswordScreen} />
    </Tab.Navigator>
  );
};

export default Dashboard;
