// Header.jsx
import React, {useState} from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import useLoginModalStore from '../store/useLoginModalStore';
import useSignupStore from '../store/signupStore';
import useAuthStore from '../store/authStore'; // ✅ get token
import Dropdown from '../Components/Dropdown';

const Header = () => {
  const navigation = useNavigation();

  const {token, clearToken} = useAuthStore();
  const {
    firstName: userFirstName,
    clearFirstName,
    clearLastName,
    clearEmail,
  } = useSignupStore();

  const handleLogout = () => {
    clearToken();
    clearFirstName();
    clearLastName();
    clearEmail();
    navigation.navigate('Login');
  };

  return (
    <>
      <SafeAreaView style={{backgroundColor: '#fff', zIndex: 999}}>
        <View style={styles.header}>
          {/* Logo */}
          <TouchableOpacity onPress={() => navigation.navigate('dashboard')}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
            />
          </TouchableOpacity>

          {/* Right side — login or profile */}
          <Dropdown
            token={token}
            userFirstName={userFirstName}
            handleLogout={handleLogout}
            // openLoginModal={openLoginModal}
          />
        </View>

        {/* Login Modal */}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logo: {
    width: 120,
    height: 50,
    resizeMode: 'contain',
  },
  loginText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#4B0082',
  },
  profileWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 50,
    marginRight: 8,
  },
  profileText: {
    fontWeight: '600',
    fontSize: 15,
    color: '#4B0082',
  },
});

export default Header;
