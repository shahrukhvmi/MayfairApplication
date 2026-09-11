import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';

import useIdVerificationUploadStore from '../store/useIdVerificationUploadStore';
import useImageUploadStore from '../store/useImageUploadStore';
import {Fonts} from '../utils/fonts';

const UploadTopPrompt = () => {
  const navigation = useNavigation();
  const {imageUploaded} = useImageUploadStore();
  const {idVerificationUpload} = useIdVerificationUploadStore();

  let title = '';
  let description = '';
  let buttonText = '';
  let redirectTo = 'photo-upload';

  if (!imageUploaded) {
    title = 'Upload your photo';
    description = 'Please upload your photo to complete your order.';
    buttonText = 'Upload Photo';
    redirectTo = 'photo-upload';
  } else if (!idVerificationUpload) {
    title = 'Upload your ID';
    description = 'Please upload your ID verification to complete your order.';
    buttonText = 'Upload ID';
    redirectTo = 'id-verification';
  }

  if (!title) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconBox}>
          <Feather name="camera" size={18} color="#d97706" />
        </View>

        {/* Text */}
        <View style={styles.textWrap}>
          <View style={styles.badgeRow}>
            <Text style={styles.badge}>ACTION REQUIRED</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>

      {/* Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate(redirectTo)}
        activeOpacity={0.8}>
        <Feather name="upload-cloud" size={14} color="#d97706" />
        <Text style={styles.buttonText}>{buttonText}</Text>
        <Feather name="chevron-right" size={13} color="#d97706" />
      </TouchableOpacity>
    </View>
  );
};

export default UploadTopPrompt;

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.5)',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 251, 235, 0.5)',
    padding: 16,
    gap: 14,
    shadowColor: 'rgba(180, 83, 9, 0.06)',
    shadowOpacity: 1,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fffbeb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  badge: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: '#d97706',
    textTransform: 'uppercase',
    letterSpacing: 1,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  title: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: '#0f172a',
    marginBottom: 2,
  },
  description: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#64748b',
    lineHeight: 17,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 38,
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 12,
    backgroundColor: '#fffbeb',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 12.5,
    fontFamily: Fonts.medium,
    color: '#d97706',
  },
});
