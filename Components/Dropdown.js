import React, {useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {Fonts} from '../utils/fonts';

const PRIMARY = '#47317c';
const {width: SCREEN_WIDTH} = Dimensions.get('window');
const PANEL_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 320);

const MENU_ITEMS = [
  {label: 'Dashboard', icon: 'grid', tab: 0},
  {label: 'My Orders', icon: 'shopping-bag', tab: 1},
  {label: 'Address Book', icon: 'map-pin', tab: 2},
  {label: 'Weight Loss Journey', icon: 'trending-up', tab: 3},
  {label: 'Change Password', icon: 'key', tab: 4},
];

const Dropdown = ({token, userFirstName, email, handleLogout}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  // useSafeAreaInsets can return 0 inside a Modal (separate view hierarchy),
  // so fall back to sensible platform defaults for the status bar / notch.
  const topInset =
    insets.top || (Platform.OS === 'ios' ? 47 : StatusBar.currentHeight || 24);
  const bottomInset = insets.bottom || (Platform.OS === 'ios' ? 24 : 12);

  const [visible, setVisible] = useState(false);
  const translateX = useRef(new Animated.Value(-PANEL_WIDTH)).current;

  const handleNavigationDashboard = () => {
    navigation.navigate('dashboard');
  };

  const openDrawer = () => {
    setVisible(true);
  };

  // Runs after the Modal is fully presented so the panel slide reliably plays.
  const runOpenAnimation = () => {
    translateX.setValue(-PANEL_WIDTH);
    Animated.timing(translateX, {
      toValue: 0,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = onDone => {
    // Slide the panel out; the static overlay stays over the whole app for the
    // whole slide and only disappears once the Modal unmounts — so it lingers
    // for a moment after the sidebar has gone, like a modal dismiss.
    Animated.timing(translateX, {
      toValue: -PANEL_WIDTH,
      duration: 240,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      if (onDone) onDone();
    });
  };

  const goTo = tab => {
    closeDrawer(() => navigation.navigate('dashboard', {tab}));
  };

  const initial = (userFirstName || 'P').trim().charAt(0).toUpperCase();

  if (!token) {
    return (
      <TouchableOpacity onPress={handleNavigationDashboard}>
        <View style={styles.avatar}>
          <Feather name="user" size={16} color="#fff" />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <>
      <TouchableOpacity activeOpacity={0.8} onPress={openDrawer}>
        <View style={styles.avatar}>
          <Feather name="user" size={16} color="#fff" />
        </View>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="none"
        onShow={runOpenAnimation}
        onRequestClose={() => closeDrawer()}>
        {/* Full-screen overlay across the whole app; tap anywhere to close */}
        <Pressable style={styles.backdrop} onPress={() => closeDrawer()}>
          {/* Stop taps on the panel from bubbling up to the backdrop */}
          <Pressable style={styles.panelHolder} onPress={() => {}}>
            <Animated.View
              style={[
                styles.panel,
                {
                  width: PANEL_WIDTH,
                  height: '100%',
                  transform: [{translateX}],
                },
              ]}>
              {/* Profile header */}
              <View
                style={[styles.profileHeader, {paddingTop: topInset + 12}]}>
                <TouchableOpacity
                  style={[styles.closeBtn, {top: topInset + 12}]}
                  onPress={() => closeDrawer()}
                  hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
                  <Feather name="x" size={22} color="#64748b" />
                </TouchableOpacity>

                <View style={styles.initialCircle}>
                  <Text style={styles.initialText}>{initial}</Text>
                </View>
                <Text style={styles.profileName} numberOfLines={1}>
                  {userFirstName || 'Patient'}
                </Text>
                {!!email && (
                  <Text style={styles.profileEmail} numberOfLines={1}>
                    {email}
                  </Text>
                )}
              </View>

              <View style={styles.separator} />

              {/* Menu items — mirrors dashboard bottom navigation */}
              <View style={styles.menuItems}>
                {MENU_ITEMS.map(item => (
                  <TouchableOpacity
                    key={item.label}
                    style={styles.menuItem}
                    activeOpacity={0.7}
                    onPress={() => goTo(item.tab)}>
                    <View style={styles.menuIconCircle}>
                      <Feather name={item.icon} size={16} color={PRIMARY} />
                    </View>
                    <Text style={styles.menuText}>{item.label}</Text>
                    <Feather name="chevron-right" size={16} color="#c4c4d0" />
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.spacer} />

              <View
                style={[styles.footer, {paddingBottom: bottomInset + 16}]}>
                <TouchableOpacity
                  style={styles.logoutButton}
                  activeOpacity={0.8}
                  onPress={() => closeDrawer(handleLogout)}>
                  <Feather name="log-out" size={16} color="#ef4444" />
                  <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default Dropdown;

const styles = StyleSheet.create({
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  panelHolder: {
    height: '100%',
    width: PANEL_WIDTH,
  },
  panel: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 2, height: 0},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },

  profileHeader: {
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#faf9fc',
  },
  closeBtn: {
    position: 'absolute',
    right: 14,
    zIndex: 2,
  },
  initialCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  initialText: {
    color: '#fff',
    fontSize: 26,
    fontFamily: Fonts.bold,
  },
  profileName: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: '#0f172a',
    textTransform: 'capitalize',
  },
  profileEmail: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#64748b',
    marginTop: 3,
  },

  separator: {
    height: 1,
    backgroundColor: 'rgba(71, 49, 124, 0.09)',
  },

  menuItems: {
    paddingTop: 10,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  menuIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(71, 49, 124, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: '#334155',
  },

  spacer: {
    flex: 1,
  },

  footer: {
    paddingTop: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(71, 49, 124, 0.07)',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  logoutText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: '#ef4444',
  },
});
