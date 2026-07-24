import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';

import useIdVerificationUploadStore from '../store/useIdVerificationUploadStore';
import useImageUploadStore from '../store/useImageUploadStore';

const UploadTopPrompt = () => {
  const navigation = useNavigation();
  const {imageUploaded} = useImageUploadStore();
  const {idVerificationUpload} = useIdVerificationUploadStore();

  // Build dynamic message
  let missingItems = [];
  if (!imageUploaded) missingItems.push('photo');
  if (!idVerificationUpload) missingItems.push('ID verification');

  const message = missingItems.length
    ? `Please upload your ${missingItems.join(' and ')} to complete your order.`
    : '';

  if (!message) return null; // ✅ nothing missing → don't show prompt

  // Redirect logic
  let redirectTo = 'photo-upload'; // screen name in your navigator
  if (imageUploaded && !idVerificationUpload) {
    redirectTo = 'id-verification';
  }

  return (
    <View style={styles.container}>
      <View style={styles.innerRow}>
        {/* Icon */}
        <View style={styles.iconWrapper}>
          <Feather name="upload" size={18} color="#fff" />
        </View>

        {/* Message + Button */}
        <Text style={styles.message}>
          {message}{' '}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate(redirectTo)}>
            Click here to upload
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default UploadTopPrompt;

const styles = StyleSheet.create({
  container: {
    // position: 'absolute',
    // top: 16,
    alignSelf: 'center',
    backgroundColor: '#f59e0b', // amber-500
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 6,
    elevation: 5,
    zIndex: 50,
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrapper: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 6,
    borderRadius: 50,
  },
  message: {
    fontSize: 14,
    color: '#fff',
    flexShrink: 1,
  },
  link: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
