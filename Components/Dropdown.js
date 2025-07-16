import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Easing,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

const Dropdown = ({token, userFirstName, handleLogout}) => {
  const navigation = useNavigation();
  const [anchorVisible, setAnchorVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const toggleDropdown = () => {
    setAnchorVisible(!anchorVisible);
    Animated.timing(fadeAnim, {
      toValue: anchorVisible ? 0 : 1,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handleNavigationDashboard = () => {
    navigation.navigate('dashboard');
  };

  return (
    <>
      {token ? (
        <View style={{position: 'relative'}}>
          <TouchableOpacity onPress={toggleDropdown} style={styles.userRow}>
            <Ionicons name="person-circle-outline" size={28} color="#4B0082" />
            <Text style={styles.userName}>{userFirstName || 'Profile'}</Text>
            <Ionicons
              name={anchorVisible ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#4B0082"
              style={{marginLeft: 4}}
            />
          </TouchableOpacity>

          {anchorVisible && (
            <Animated.View style={[styles.dropdown, {opacity: fadeAnim}]}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setAnchorVisible(false);
                  navigation.navigate('dashboard');
                }}>
                <Text style={styles.menuText}>Dashboard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setAnchorVisible(false);
                  handleLogout();
                }}>
                <Text style={styles.menuText}>Logout</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      ) : (
        <TouchableOpacity onPress={handleNavigationDashboard}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
      )}
    </>
  );
};

export default Dropdown;

const styles = StyleSheet.create({
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 24,
    // borderWidth: 1,
    // borderColor: '#E5E7EB',
  },
  userName: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  dropdown: {
    position: 'absolute',
    top: 48,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    paddingVertical: 8,
    width: 160,
    zIndex: 999,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 14,
    color: '#4B0082',
    fontWeight: '500',
  },
  loginText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B0082',
    padding: 8,
  },
});
