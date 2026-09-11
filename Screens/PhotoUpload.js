import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {launchImageLibrary} from 'react-native-image-picker';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import useCartStore from '../store/useCartStore';
import useImageUploadStore from '../store/useImageUploadStore';
import useIdVerificationUploadStore from '../store/useIdVerificationUploadStore';

import GetImageIsUplaod from '../api/GetImageIsUplaod';
import {GetIdVerification} from '../api/IdVerificationApi';
import {ImageUplaodApi} from '../api/ImageUploadApi';
import NextButton from '../Components/NextButton';
import Header from '../Layout/header';
import {Fonts} from '../utils/fonts';

import FullBody from '../assets/images/full-body-ok.png';
import FaceX from '../assets/images/face-x.png';
import HalfBodyX from '../assets/images/half-body-x.png';

const PRIMARY = '#47317c';
const MAX_SIZE_MB = 30;

export default function PhotoUpload() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [buttonLabel, setButtonLabel] = useState('Return to Dashboard');

  const {control, setValue, handleSubmit, watch} = useForm();
  const {orderId} = useCartStore();

  const {imageUploaded, setImageUploaded} = useImageUploadStore();
  const {idVerificationUpload, setIdVerificationUpload} =
    useIdVerificationUploadStore();

  const frontPhoto = watch('frontPhoto');

  useEffect(() => {
    const askPermissions = async () => {
      if (Platform.OS === 'android') {
        try {
          await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          ]);
        } catch (err) {
          console.warn('Permission error:', err);
        }
      }
    };
    askPermissions();
  }, []);

  const handleUpload = async type => {
    launchImageLibrary({mediaType: 'photo', quality: 0.8}, response => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        return;
      }
      if (response.assets && response.assets.length > 0) {
        const file = response.assets[0];
        if (file.fileSize && file.fileSize > MAX_SIZE_MB * 1024 * 1024) {
          Toast.show({
            type: 'error',
            text1: `File too large. Maximum allowed size is ${MAX_SIZE_MB} MB.`,
          });
          return;
        }
        setValue(type, file);
      }
    });
  };

  useEffect(() => {
    const fetchImageStatus = async () => {
      try {
        const res = await GetImageIsUplaod({order_id: orderId});
        setImageUploaded(res?.data?.status);
        setButtonLabel(
          !idVerificationUpload
            ? 'Upload ID verification photo'
            : 'Return to Dashboard',
        );
      } catch (error) {
        console.error('Failed to fetch image status:', error);
      }
    };
    if (orderId) fetchImageStatus();
  }, [orderId]);

  useEffect(() => {
    const fetchIdStatus = async () => {
      try {
        const res = await GetIdVerification({order_id: orderId});
        setIdVerificationUpload(res?.data?.status);
      } catch (error) {
        console.error('Failed to fetch ID verification:', error);
      }
    };
    if (orderId) fetchIdStatus();
  }, [orderId]);

  const onSubmit = async data => {
    try {
      if (!data.frontPhoto) {
        Toast.show({type: 'error', text1: 'Please upload a full body image.'});
        return;
      }
      setLoading(true);

      const formData = new FormData();
      formData.append('front', {
        uri: data.frontPhoto.uri,
        type: data.frontPhoto.type || 'image/jpeg',
        name: data.frontPhoto.fileName || 'front.jpg',
      });
      formData.append('order_id', orderId);

      const res = await ImageUplaodApi(formData);

      if (res?.status === 200) {
        setOpen(true);
        setButtonLabel(
          !idVerificationUpload
            ? 'Upload ID verification photo'
            : 'Return to Dashboard',
        );
      }
    } catch (error) {
      console.log('Upload error', error?.response?.data || error);
      const frontError = error?.response?.data?.errors?.front;
      const orderError = error?.response?.data?.errors?.Order;
      const pick = e => (Array.isArray(e) ? e[0] : e);

      if (error?.response?.data?.message === 'Unauthenticated.') {
        Toast.show({
          type: 'error',
          text1: 'Failed to upload images. Please login again.',
        });
        navigation.replace('Login');
      } else if (frontError) {
        Toast.show({type: 'error', text1: pick(frontError)});
      } else if (orderError) {
        Toast.show({type: 'error', text1: pick(orderError)});
      } else {
        Toast.show({
          type: 'error',
          text1: 'Something went wrong. Please try again.',
        });
      }
      setValue('frontPhoto', null);
    } finally {
      setLoading(false);
    }
  };

  const handleRedirect = () => {
    setOpen(false);
    if (!idVerificationUpload) {
      navigation.navigate('id-verification');
    } else {
      navigation.navigate('dashboard');
    }
  };

  return (
    <>
      <Header />

      {/* Success Modal */}
      <Modal visible={open} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalIconCircle}>
              <Feather name="check" size={34} color="#fff" />
            </View>
            <Text style={styles.modalTitle}>Image successfully uploaded</Text>
            <Text style={styles.modalText}>
              {!idVerificationUpload
                ? 'Your full body photo has been uploaded and is now under review. You need to complete ID verification to proceed.'
                : "Your full body photo has been uploaded and is under review. We'll approve your order once the review is complete."}
            </Text>
            <NextButton
              label={buttonLabel}
              onPress={handleRedirect}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>

      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.container,
          {paddingBottom: insets.bottom + 24},
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {/* Heading */}
          <Text style={styles.heading}>
            Submit your photo for prescriber review
          </Text>
          <Text style={styles.subtext}>
            Please upload a <Text style={styles.bold}>full body</Text> picture
            of yourself.
          </Text>

          {/* Why we need this */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Why we need this</Text>
            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                We will only ask for this once.
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>
                We realise it's inconvenient, but this is a regulatory
                requirement designed for your safety and to prevent
                inappropriate use.
              </Text>
            </View>
          </View>

          {/* Photo guidance */}
          <Text style={styles.guidanceTitle}>Photo guidance</Text>
          <View style={styles.examples}>
            <View style={[styles.exampleItem, styles.exampleGood]}>
              <Image source={FullBody} style={styles.exampleImg} />
              <View style={[styles.exampleBadge, styles.exampleBadgeGood]}>
                <Feather name="check" size={9} color="#047857" />
                <Text style={styles.exampleBadgeGoodText}>Good</Text>
              </View>
            </View>
            <View style={styles.exampleItem}>
              <Image source={FaceX} style={styles.exampleImg} />
            </View>
            <View style={styles.exampleItem}>
              <Image source={HalfBodyX} style={styles.exampleImg} />
              <View style={[styles.exampleBadge, styles.exampleBadgeBad]}>
                <Feather name="x" size={9} color="#dc2626" />
                <Text style={styles.exampleBadgeBadText}>Avoid</Text>
              </View>
            </View>
          </View>

          {/* Upload box */}
          <Controller
            name="frontPhoto"
            control={control}
            defaultValue={null}
            render={() => (
              <View style={styles.uploadWrap}>
                <TouchableOpacity
                  style={styles.uploadArea}
                  activeOpacity={0.8}
                  onPress={() => handleUpload('frontPhoto')}>
                  {!frontPhoto ? (
                    <View style={styles.uploadEmpty}>
                      <View style={styles.uploadIconCircle}>
                        <Feather name="upload" size={20} color={PRIMARY} />
                      </View>
                      <Text style={styles.uploadTitle}>
                        Choose a full-body photo
                      </Text>
                      <Text style={styles.uploadSub}>
                        Tap to browse files from your device
                      </Text>
                    </View>
                  ) : (
                    <Image
                      source={{uri: frontPhoto.uri}}
                      style={styles.preview}
                      resizeMode="contain"
                    />
                  )}
                </TouchableOpacity>

                {frontPhoto && (
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => setValue('frontPhoto', null)}
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                    <Feather name="x" size={16} color="#dc2626" />
                  </TouchableOpacity>
                )}
                <Text style={styles.uploadHint}>
                  JPEG, PNG, WEBP, HEIC or PDF · Maximum 30 MB
                </Text>
              </View>
            )}
          />

          {/* Submit */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              (loading || !frontPhoto) && styles.submitBtnDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading || !frontPhoto}
            activeOpacity={0.85}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={[
                  styles.submitText,
                  (loading || !frontPhoto) && styles.submitTextDisabled,
                ]}>
                Upload
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#FBFBFD',
  },
  container: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.1)',
    padding: 18,
    shadowColor: 'rgba(71, 49, 124, 0.1)',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 3,
  },

  heading: {
    fontSize: 20,
    fontFamily: Fonts.semiBold,
    color: '#0f172a',
    lineHeight: 27,
  },
  subtext: {
    fontSize: 13.5,
    fontFamily: Fonts.regular,
    color: '#64748b',
    marginTop: 8,
    lineHeight: 21,
  },
  bold: {
    fontFamily: Fonts.semiBold,
    color: '#0f172a',
  },

  // Info box
  infoBox: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.1)',
    backgroundColor: '#f8f6fc',
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  infoTitle: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: '#1e293b',
    marginBottom: 2,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: PRIMARY,
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#475569',
    lineHeight: 18,
  },

  // Guidance
  guidanceTitle: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: '#1e293b',
    marginTop: 20,
    marginBottom: 12,
  },
  examples: {
    flexDirection: 'row',
    gap: 8,
  },
  exampleItem: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  exampleGood: {
    borderWidth: 2,
    borderColor: '#34d399',
  },
  exampleImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  exampleBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  exampleBadgeGood: {},
  exampleBadgeGoodText: {
    fontSize: 9.5,
    fontFamily: Fonts.semiBold,
    color: '#047857',
  },
  exampleBadgeBad: {},
  exampleBadgeBadText: {
    fontSize: 9.5,
    fontFamily: Fonts.semiBold,
    color: '#dc2626',
  },

  // Upload box
  uploadWrap: {
    marginTop: 20,
  },
  uploadArea: {
    minHeight: 164,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#9b87c8',
    borderRadius: 14,
    backgroundColor: '#f8f6fc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  uploadEmpty: {
    alignItems: 'center',
  },
  uploadIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.1)',
  },
  uploadTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: '#1e293b',
  },
  uploadSub: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: '#64748b',
    marginTop: 3,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  removeBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 3,
  },
  uploadHint: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 12,
  },

  // Submit
  submitBtn: {
    marginTop: 20,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#e2e8f0',
  },
  submitText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: Fonts.semiBold,
  },
  submitTextDisabled: {
    color: '#94a3b8',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 26,
    width: '100%',
    maxWidth: 380,
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.1)',
  },
  modalIconCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 19,
    fontFamily: Fonts.semiBold,
    textAlign: 'center',
    color: '#0f172a',
  },
  modalText: {
    fontSize: 13.5,
    fontFamily: Fonts.regular,
    textAlign: 'center',
    color: '#475569',
    marginTop: 10,
    marginBottom: 22,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    minHeight: 48,
  },
});
