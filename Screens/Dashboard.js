import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useIsFocused, useRoute} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import DashboardHome from './DashboardHome';
import OrdersScreen from './OrdersScreen';
import AddressBookScreen from './AddressBookScreen';
import ChangePasswordScreen from './ChangePasswordScreen';
import WeightLossJourneyScreen from './WeightLossJourneyScreen';

const TABS = [
  {
    icon: 'home-outline',
    activeIcon: 'home',
    label: 'Dashboard',
  },
  {
    icon: 'list-outline',
    activeIcon: 'list',
    label: 'Orders',
  },
  {
    icon: 'location-outline',
    activeIcon: 'location',
    label: 'Address Book',
  },
  {
    icon: 'trending-up-outline',
    activeIcon: 'trending-up',
    label: 'Weight Loss Journey',
  },
  {
    icon: 'key-outline',
    activeIcon: 'key',
    label: 'Change Password',
  },
];

const SCREENS = [
  DashboardHome,
  OrdersScreen,
  AddressBookScreen,
  WeightLossJourneyScreen,
  ChangePasswordScreen,
];

const TAB_BAR_MARGIN = 12;
const TAB_BAR_HEIGHT = 62;
const ACTIVE_CIRCLE_SIZE = 48;

const Dashboard = () => {
  const {width} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const isFocused = useIsFocused();

  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  const screenTranslateX = useRef(new Animated.Value(0)).current;
  const sliderTranslateX = useRef(new Animated.Value(0)).current;

  /*
   * The tab width must be calculated from the actual tab-bar width,
   * not from the complete screen width.
   */
  const tabBarWidth = Math.max(width - TAB_BAR_MARGIN * 2, 0);
  const tabWidth = tabBarWidth / TABS.length;

  const handleTabPress = index => {
    if (index === activeIndexRef.current) {
      return;
    }

    activeIndexRef.current = index;
    setActiveIndex(index);

    Animated.parallel([
      Animated.timing(screenTranslateX, {
        toValue: -width * index,
        duration: 280,
        useNativeDriver: true,
      }),

      Animated.spring(sliderTranslateX, {
        toValue: tabWidth * index,
        speed: 18,
        bounciness: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /*
   * Keep the selected screen and slider aligned when the screen
   * width changes, for example after device rotation.
   */
  useEffect(() => {
    const currentIndex = activeIndexRef.current;

    screenTranslateX.setValue(-width * currentIndex);
    sliderTranslateX.setValue(tabWidth * currentIndex);
  }, [width, tabWidth, screenTranslateX, sliderTranslateX]);

  /*
   * Allow other screens (e.g. the header dropdown) to deep-link into a
   * specific tab via navigation.navigate('dashboard', {tab: 1}).
   */
  useEffect(() => {
    if (!isFocused) return;

    const requestedTab = route?.params?.tab;
    if (requestedTab === undefined || requestedTab === null) return;
    if (requestedTab === activeIndexRef.current) return;

    activeIndexRef.current = requestedTab;
    setActiveIndex(requestedTab);
    screenTranslateX.setValue(-width * requestedTab);
    sliderTranslateX.setValue(tabWidth * requestedTab);
  }, [isFocused, route?.params?.tab, width, tabWidth, screenTranslateX, sliderTranslateX]);

  return (
    <View style={styles.container}>
      {/* Screens container */}
      <View style={styles.screensViewport}>
        <Animated.View
          style={[
            styles.screensRow,
            {
              width: width * SCREENS.length,
              transform: [{translateX: screenTranslateX}],
            },
          ]}>
          {SCREENS.map((Component, index) => (
            <View
              key={TABS[index].label}
              style={[
                styles.screen,
                {
                  width,
                },
              ]}>
              <Component />
            </View>
          ))}
        </Animated.View>
      </View>

      {/* Bottom navigation safe area */}
      <View
        style={[
          styles.bottomNavigationArea,
          {
            paddingBottom: Math.max(insets.bottom, 10),
          },
        ]}>
        <View
          style={[
            styles.tabBar,
            {
              width: tabBarWidth,
            },
          ]}>
          {/* Animated active circle */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.activeSlider,
              {
                left: (tabWidth - ACTIVE_CIRCLE_SIZE) / 2,
                transform: [{translateX: sliderTranslateX}],
              },
            ]}
          />

          {TABS.map((item, index) => {
            const isActive = activeIndex === index;

            return (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                accessibilityState={{selected: isActive}}
                onPress={() => handleTabPress(index)}
                style={styles.tab}>
                <Ionicons
                  name={isActive ? item.activeIcon : item.icon}
                  size={isActive ? 23 : 22}
                  color={isActive ? '#FFFFFF' : '#5B347D'}
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
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  screensViewport: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },

  screensRow: {
    flex: 1,
    flexDirection: 'row',
  },

  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  bottomNavigationArea: {
    paddingTop: 10,
    paddingHorizontal: TAB_BAR_MARGIN,
    backgroundColor: '#FFFFFF',
  },

  tabBar: {
    alignSelf: 'center',
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    position: 'relative',
    overflow: 'hidden',

    backgroundColor: '#FFFFFF',
    borderRadius: 22,
  },

  tab: {
    flex: 1,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeSlider: {
    position: 'absolute',
    top: (TAB_BAR_HEIGHT - ACTIVE_CIRCLE_SIZE) / 2,
    width: ACTIVE_CIRCLE_SIZE,
    height: ACTIVE_CIRCLE_SIZE,
    zIndex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: ACTIVE_CIRCLE_SIZE / 2,
    backgroundColor: '#4B006E',
  },
});

export default Dashboard;
