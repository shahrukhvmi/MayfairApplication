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

import {
  IdVerificationUpload,
  GetIdVerification,
} from '../api/IdVerificationApi';
import GetImageIsUplaod from '../api/GetImageIsUplaod';
import NextButton from '../Components/NextButton';
import Header from '../Layout/header';
import {logApiSuccess} from '../utils/logApiDebug';
import {Fonts} from '../utils/fonts';

const PRIMARY = '#47317c';
const VIOLET = '#6d28d9';
const MAX_SIZE_MB = 30;

const ID_OPTIONS = [
  {label: 'Passport', value: 'passport'},
  {label: 'Driving License', value: 'driving_license'},
  {label: 'Proof of age card (e.g. PASS card)', value: 'pass_card'},
  {label: 'Government-issued ID card', value: 'id_card'},
];

export default function IdVerification() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [buttonLabel, setButtonLabel] = useState('Return to Dashboard');
  const [selectedId, setSelectedId] = useState('passport');
  const [showIdDropdown, setShowIdDropdown] = useState(false);

  const {control, setValue, handleSubmit, watch} = useForm();
  const {orderId} = useCartStore();

  const {imageUploaded, setImageUploaded} = useImageUploadStore();
  const {idVerificationUpload, setIdVerificationUpload} =
    useIdVerificationUploadStore();

  const frontPhoto = watch('frontPhoto');
  const sidePhoto = watch('sidePhoto');

  const handleUpload = async type => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
    });

    if (!result.didCancel && result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      if (file.fileSize && file.fileSize > MAX_SIZE_MB * 1024 * 1024) {
        Toast.show({
          type: 'error',
          text1: `File too large. Maximum allowed size is ${MAX_SIZE_MB} MB.`,
        });
        return;
      }
      setValue(type, file);
    }
  };

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

  useEffect(() => {
    const fetchImageStatus = async () => {
      try {
        const res = await GetImageIsUplaod({order_id: orderId});
        setImageUploaded(res?.data?.status);
      } catch (error) {
        console.error('Failed to fetch image status:', error);
      }
    };
    if (orderId) fetchImageStatus();
  }, [orderId]);

  const onSubmit = async data => {
    try {
      if (!data.frontPhoto) {
        Toast.show({type: 'error', text1: 'Please upload a front image.'});
        return;
      }

      setLoading(true);

      let payload = {
        front: data.frontPhoto.base64 || data.frontPhoto.uri,
        order_id: orderId,
        type: selectedId,
      };

      if (data.sidePhoto) {
        payload.side = data.sidePhoto.base64 || data.sidePhoto.uri;
      }

      const res = await IdVerificationUpload(payload);

      if (res?.status === 200) {
        logApiSuccess(res);
        setOpen(true);
        setButtonLabel(
          !imageUploaded ? 'Upload full body photo' : 'Return to Dashboard',
        );
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to upload ID. Please try again.',
        });
      }
    } catch (error) {
      console.log('Upload Error', error?.response?.data);
      const errs = error?.response?.data?.errors;
      const pick = e => (Array.isArray(e) ? e[0] : e);

      if (error?.response?.data?.message === 'Unauthenticated.') {
        Toast.show({
          type: 'error',
          text1: 'Failed to upload images. Please login again.',
        });
        navigation.replace('Login');
      } else if (errs?.front) {
        Toast.show({type: 'error', text1: pick(errs.front)});
      } else if (errs?.side) {
        Toast.show({type: 'error', text1: pick(errs.side)});
      } else if (errs?.Order) {
        Toast.show({type: 'error', text1: pick(errs.Order)});
      } else {
        Toast.show({
          type: 'error',
          text1: 'Something went wrong. Please try again.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRedirect = () => {
    setOpen(false);
    if (!imageUploaded) {
      navigation.navigate('photo-upload');
    } else {
      navigation.navigate('dashboard');
    }
  };

  const renderUploadBox = (label, photo, type, required) => (
    <View style={styles.uploadCol}>
      <Text style={styles.uploadLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TouchableOpacity
        style={styles.uploadArea}
        activeOpacity={0.8}
        onPress={() => handleUpload(type)}>
        {!photo ? (
          <View style={styles.uploadEmpty}>
            <Feather name="upload" size={24} color={VIOLET} />
            <Text style={styles.uploadText}>Click here</Text>
            <Text style={styles.uploadSubText}>or tap to upload image</Text>
          </View>
        ) : (
          <View style={styles.previewWrap}>
            <Image
              source={{uri: photo.uri}}
              style={styles.preview}
              resizeMode="contain"
            />
            <View style={styles.previewCheck}>
              <Feather name="check-circle" size={20} color="#1F9E8C" />
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

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
            <Text style={styles.modalTitle}>ID successfully uploaded</Text>
            <Text style={styles.modalText}>
              {!imageUploaded
                ? 'Your ID verification photo has been uploaded and is under review. Please upload your full body photo to proceed.'
                : "Your ID has been uploaded and is now under review. We'll approve your order once the review is complete."}
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
          <Text style={styles.heading}>ID verification required</Text>
          <View style={styles.headingRule} />

          <Text style={styles.subtext}>
            As an online healthcare provider, we are required by law to confirm
            that all patients are at least 18 years of age. Normally, these
            checks are completed automatically against national identity
            registers using the information you provide.
          </Text>

          <Text style={styles.question}>
            How would you like to verify your identity?
          </Text>

          {/* Dropdown */}
          <TouchableOpacity
            style={styles.dropdown}
            activeOpacity={0.7}
            onPress={() => setShowIdDropdown(true)}>
            <Text style={styles.dropdownText}>
              {ID_OPTIONS.find(o => o.value === selectedId)?.label ||
                'Select ID type'}
            </Text>
            <Feather name="chevron-down" size={20} color="#555" />
          </TouchableOpacity>

          {/* Upload boxes side by side */}
          <View style={styles.uploadRow}>
            <Controller
              name="frontPhoto"
              control={control}
              defaultValue={null}
              render={() =>
                renderUploadBox('Front', frontPhoto, 'frontPhoto', true)
              }
            />
            <Controller
              name="sidePhoto"
              control={control}
              defaultValue={null}
              render={() =>
                renderUploadBox('Back (optional)', sidePhoto, 'sidePhoto', false)
              }
            />
          </View>

          {/* Submit */}
          <View style={styles.submitWrap}>
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
        </View>
      </ScrollView>

      {/* Dropdown options */}
      <Modal
        visible={showIdDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowIdDropdown(false)}>
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setShowIdDropdown(false)}>
          <View style={styles.dropdownSheet}>
            {ID_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={styles.dropdownOption}
                onPress={() => {
                  setSelectedId(opt.value);
                  setShowIdDropdown(false);
                }}>
                <Text
                  style={[
                    styles.dropdownOptionText,
                    selectedId === opt.value && styles.dropdownOptionTextActive,
                  ]}>
                  {opt.label}
                </Text>
                {selectedId === opt.value && (
                  <Feather name="check" size={18} color={PRIMARY} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.08,
    shadowRadius: 26,
    elevation: 3,
  },

  heading: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: '#000',
  },
  headingRule: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginTop: 12,
    marginBottom: 14,
  },
  subtext: {
    fontSize: 13.5,
    fontFamily: Fonts.regular,
    color: '#475569',
    lineHeight: 21,
  },
  question: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#374151',
    marginTop: 22,
    marginBottom: 10,
  },

  // Dropdown
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dropdownText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: '#111',
    flex: 1,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  dropdownSheet: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 6,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownOptionText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: '#333',
    flex: 1,
  },
  dropdownOptionTextActive: {
    color: PRIMARY,
    fontFamily: Fonts.semiBold,
  },

  // Upload
  uploadRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  uploadCol: {
    flex: 1,
  },
  uploadLabel: {
    fontSize: 13.5,
    fontFamily: Fonts.medium,
    color: '#1e293b',
    marginBottom: 6,
  },
  required: {
    color: '#ef4444',
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: VIOLET,
    borderRadius: 16,
    minHeight: 140,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  uploadEmpty: {
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: '#374151',
    marginTop: 8,
  },
  uploadSubText: {
    fontSize: 10.5,
    fontFamily: Fonts.regular,
    color: '#9ca3af',
    marginTop: 2,
    textAlign: 'center',
  },
  previewWrap: {
    width: '100%',
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  previewCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
  },

  // Submit
  submitWrap: {
    alignItems: 'center',
    marginTop: 24,
  },
  submitBtn: {
    minHeight: 48,
    paddingHorizontal: 40,
    borderRadius: 25,
    backgroundColor: PRIMARY,
    borderWidth: 2,
    borderColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#d1d5db',
    borderColor: '#d1d5db',
  },
  submitText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Fonts.semiBold,
  },
  submitTextDisabled: {
    color: '#fff',
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
