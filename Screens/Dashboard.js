import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useIsFocused, useRoute} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {Fonts} from '../utils/fonts';
import DashboardHome from './DashboardHome';
import OrdersScreen from './OrdersScreen';
import AddressBookScreen from './AddressBookScreen';
import ChangePasswordScreen from './ChangePasswordScreen';
import WeightLossJourneyScreen from './WeightLossJourneyScreen';

// All screens stay mounted so the header dropdown can still deep-link into
// Address Book (index 2) and Change Password (index 4) via {tab: n}.
const SCREENS = [
  DashboardHome,
  OrdersScreen,
  AddressBookScreen,
  WeightLossJourneyScreen,
  ChangePasswordScreen,
];

const SCREEN_LABELS = [
  'Dashboard',
  'Orders',
  'Address Book',
  'Weight Loss Journey',
  'Change Password',
];

// Only these appear in the bottom bar (Address Book + Change Password removed).
const NAV_TABS = [
  {
    screenIndex: 0,
    icon: 'home-outline',
    activeIcon: 'home',
    label: 'Dashboard',
    short: 'Dashboard',
  },
  {
    screenIndex: 1,
    icon: 'list-outline',
    activeIcon: 'list',
    label: 'Orders',
    short: 'Orders',
  },
  {
    screenIndex: 3,
    icon: 'trending-up-outline',
    activeIcon: 'trending-up',
    label: 'Weight Loss Journey',
    short: 'Journey',
  },
];

const TAB_BAR_MARGIN = 12;
const TAB_BAR_HEIGHT = 68;
const ACTIVE_CIRCLE_SIZE = 40;
const ICON_SLOT_TOP = 8;

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
  const tabWidth = tabBarWidth / NAV_TABS.length;

  const slotForScreen = screenIndex =>
    NAV_TABS.findIndex(t => t.screenIndex === screenIndex);

  const goToScreen = (screenIndex, animate = true) => {
    activeIndexRef.current = screenIndex;
    setActiveIndex(screenIndex);

    const slot = slotForScreen(screenIndex);

    if (animate) {
      Animated.parallel([
        Animated.timing(screenTranslateX, {
          toValue: -width * screenIndex,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.spring(sliderTranslateX, {
          toValue: tabWidth * (slot >= 0 ? slot : 0),
          speed: 18,
          bounciness: 5,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      screenTranslateX.setValue(-width * screenIndex);
      sliderTranslateX.setValue(tabWidth * (slot >= 0 ? slot : 0));
    }
  };

  const handleTabPress = screenIndex => {
    if (screenIndex === activeIndexRef.current) return;
    goToScreen(screenIndex, true);
  };

  /*
   * Keep the selected screen and slider aligned when the screen
   * width changes, for example after device rotation.
   */
  useEffect(() => {
    goToScreen(activeIndexRef.current, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, tabWidth]);

  /*
   * Allow other screens (e.g. the header dropdown) to deep-link into a
   * specific tab via navigation.navigate('dashboard', {tab: n}).
   */
  useEffect(() => {
    if (!isFocused) return;

    const requestedTab = route?.params?.tab;
    if (requestedTab === undefined || requestedTab === null) return;
    if (requestedTab === activeIndexRef.current) return;

    goToScreen(requestedTab, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, route?.params?.tab, width, tabWidth]);

  const activeSlot = slotForScreen(activeIndex);

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
              key={SCREEN_LABELS[index]}
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
          {/* Animated active circle — hidden when the active screen isn't a
              bottom-bar tab (e.g. Address Book / Change Password via dropdown) */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.activeSlider,
              {
                left: (tabWidth - ACTIVE_CIRCLE_SIZE) / 2,
                opacity: activeSlot >= 0 ? 1 : 0,
                transform: [{translateX: sliderTranslateX}],
              },
            ]}
          />

          {NAV_TABS.map(item => {
            const isActive = activeIndex === item.screenIndex;

            return (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                accessibilityState={{selected: isActive}}
                onPress={() => handleTabPress(item.screenIndex)}
                style={styles.tab}>
                <View style={styles.iconSlot}>
                  <Ionicons
                    name={isActive ? item.activeIcon : item.icon}
                    size={isActive ? 22 : 21}
                    color={isActive ? '#FFFFFF' : '#5B347D'}
                  />
                </View>
                <Text
                  style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                  numberOfLines={1}>
                  {item.short}
                </Text>
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
    justifyContent: 'flex-start',
    paddingTop: ICON_SLOT_TOP,
  },
  iconSlot: {
    height: ACTIVE_CIRCLE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    marginTop: 2,
    fontSize: 10.5,
    fontFamily: Fonts.medium,
    color: '#5B347D',
  },
  tabLabelActive: {
    color: '#4B006E',
    fontFamily: Fonts.semiBold,
  },

  activeSlider: {
    position: 'absolute',
    top: ICON_SLOT_TOP,
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
