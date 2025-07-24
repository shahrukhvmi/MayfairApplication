import React, { useRef, useState } from 'react';
import {
  View,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import DashboardHome from './DashboardHome';
import OrdersScreen from './OrdersScreen';
import AddressBookScreen from './AddressBookScreen';
import ChangePasswordScreen from './ChangePasswordScreen';

const TABS = [
  { icon: 'home-outline', label: 'Dashboard' },
  { icon: 'list-outline', label: 'Orders' },
  { icon: 'location-outline', label: 'Address Book' },
  { icon: 'key-outline', label: 'Change Password' },
];

const SCREENS = [
  DashboardHome,
  OrdersScreen,
  AddressBookScreen,
  ChangePasswordScreen,
];

const WIDTH = Dimensions.get('window').width;

const Dashboard = () => {
  const translateX = useRef(new Animated.Value(0)).current;
  const sliderX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);
  const { width } = useWindowDimensions();
  const tabWidth = width / TABS.length;

  const handleTabPress = (index) => {
    setActiveIndex(index);
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -WIDTH * index,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(sliderX, {
        toValue: tabWidth * index,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
      {/* Swipeable Screens */}
      <Animated.View
        style={{
          flexDirection: 'row',
          width: WIDTH * SCREENS.length,
          flex: 1,
          transform: [{ translateX }],
        }}>
        {SCREENS.map((Component, index) => (
          <View key={index} style={{ width: WIDTH }}>
            <Component />
          </View>
        ))}
      </Animated.View>

      {/* Rounded Modern Tab Bar */}
      <View style={styles.tabBarWrapper}>
        <View style={[styles.tabBar, { width: width - 16 }]}>
          {/* Animated Sliding Pill */}
          <Animated.View
            style={[
              styles.slider,
              {
                transform: [{ translateX: sliderX }],
                left: (tabWidth - 44) / 2, // perfectly center inside tab
              },
            ]}
          />

          {TABS.map((item, index) => {
            const isActive = activeIndex === index;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleTabPress(index)}
                style={[styles.tab, { width: tabWidth }]}>
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={isActive ? '#fff' : '#4B0082'}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarWrapper: {
    padding: 12,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    height: 50,
    backgroundColor: 'transparent',
    borderRadius: 30,
    position: 'relative',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 3 },
  },
  tab: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  activeCircle: {
    backgroundColor: '#dcdcdc',
    padding: 10,
    borderRadius: 100,
  },
slider: {
  position: 'absolute',
  height: 44,
  width: 44, // make it square for perfect circle
  backgroundColor: '#4B0082',
  borderRadius: 999,
  top: 4, // center it vertically inside 56 height
  zIndex: 1,
  shadowColor: '#4B0082',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 5,
  elevation: 4,
},


});

export default Dashboard;
