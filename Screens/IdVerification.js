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
  Alert,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {Picker} from '@react-native-picker/picker';
import {launchImageLibrary} from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

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

export default function IdVerification() {
  const navigation = useNavigation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [buttonLabel, setButtonLabel] = useState('Return to Dashboard');
  const [selectedId, setSelectedId] = useState('passport');

  const {control, setValue, handleSubmit, watch} = useForm();
  const {orderId} = useCartStore();

  console.log(orderId, 'checking top order id');

  const {imageUploaded, setImageUploaded} = useImageUploadStore();
  const {idVerificationUpload, setIdVerificationUpload} =
    useIdVerificationUploadStore();

  const frontPhoto = watch('frontPhoto');
  const sidePhoto = watch('sidePhoto');

  const idImages = {
    passport: require('../assets/images/passport.png'),
    driving_license: require('../assets/images/driving.png'),
    pass_card: require('../assets/images/passcard.png'),
    id_card: require('../assets/images/passcard.png'),
  };

  // pick image
  const handleUpload = async type => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
    });

    if (!result.didCancel && result.assets && result.assets.length > 0) {
      const file = result.assets[0];
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
    console.log('================== Console From Top ===============');

    try {
      if (!data.frontPhoto) {
        Alert.alert('Error', 'Please upload a front image.');
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
        console.log('================== Console Between ===============');

        setOpen(true); // ✅ only here
        setButtonLabel(
          !imageUploaded ? 'Upload full body photo' : 'Return to Dashboard',
        );
      } else {
        Alert.alert('Error', 'Failed to upload ID. Please try again.');
      }
    } catch (error) {
      console.log('Upload Error', error?.response?.data);
      if (error?.response?.data?.message === 'Unauthenticated.') {
        Alert.alert('Error', 'Failed to upload images. Please login again.');
        navigation.replace('Login');
      }
      if (error?.response?.data?.errors?.Order === 'Order not found') {
        Alert.alert('Error', error?.response?.data?.errors?.Order);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRedirect = () => {
    console.log(imageUploaded, '======== is Image uploaded');
    console.log(orderId, '======== is order id');
    if (!imageUploaded) {
      setOpen(false);
      navigation.navigate('photo-upload');
    } else {
      setOpen(false);
      navigation.navigate('dashboard');
    }
  };

  const renderUploadBox = (label, photo, type, suggestion) => (
    <View style={styles.uploadBox}>
      <Text style={styles.uploadLabel}>
        {label.includes('*') ? (
          <>
            {label.replace('*', '')}
            <Text style={{color: 'red'}}>*</Text>
          </>
        ) : (
          label
        )}
      </Text>
      <TouchableOpacity
        style={styles.uploadArea}
        onPress={() => handleUpload(type)}>
        {!photo ? (
          <View style={{alignItems: 'center'}}>
            <Ionicons name="cloud-upload-outline" size={40} color="#6D28D9" />
            <Text style={styles.uploadText}>Tap to upload</Text>
          </View>
        ) : (
          <View style={{alignItems: 'center'}}>
            <Image
              source={{uri: photo.uri}}
              style={{width: 120, height: 120, borderRadius: 8}}
              resizeMode="contain"
            />
            <Ionicons
              name="checkmark-circle"
              size={22}
              color="green"
              style={styles.checkIcon}
            />
          </View>
        )}
      </TouchableOpacity>
      <Text style={styles.helperText}>{suggestion}</Text>
    </View>
  );

  return (
    <>
      <Header />

      {/* Success Modal */}
      <Modal visible={open} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Ionicons
              name="checkmark-circle"
              size={80}
              color="#6D28D9"
              style={{alignSelf: 'center', marginBottom: 10}}
            />
            <Text style={styles.modalTitle}>ID successfully uploaded</Text>
            <Text style={styles.modalText}>
              {!imageUploaded
                ? 'Your ID Verification photo has been uploaded and is under review. Please upload your full body photo to proceed.'
                : 'Your ID has been uploaded and is now under review. We’ll approve your order once the review is complete.'}
            </Text>
            <NextButton label={buttonLabel} onPress={handleRedirect} />
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>ID verification required</Text>
        <Text style={styles.subtext}>
          As an online healthcare provider, we are required by law to confirm
          that all patients are at least 18 years of age. Normally, these checks
          are completed automatically using the information you provide.
        </Text>

        <Text style={[styles.subtext, {marginTop: 20}]}>
          How would you like to verify your identity?
        </Text>

        {/* Dropdown */}
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedId}
            style={{color: '#000'}}
            onValueChange={itemValue => setSelectedId(itemValue)}>
            <Picker.Item label="Passport" value="passport" />
            <Picker.Item label="Driving License" value="driving_license" />
            <Picker.Item
              label="Proof of age card (e.g. PASS card)"
              value="pass_card"
            />
            <Picker.Item label="Government-issued ID card" value="id_card" />
          </Picker>
        </View>

        {/* Preview of selected ID */}
        <View style={styles.exampleRow}>
          <Image source={idImages[selectedId]} style={styles.exampleImage} />
        </View>

        <Controller
          name="frontPhoto"
          control={control}
          defaultValue={null}
          render={() =>
            renderUploadBox(
              'Front*',
              frontPhoto,
              'frontPhoto',
              'Upload the front of your ID',
            )
          }
        />

        <Controller
          name="sidePhoto"
          control={control}
          defaultValue={null}
          render={() =>
            renderUploadBox(
              'Back (optional)',
              sidePhoto,
              'sidePhoto',
              'Upload the back of your ID',
            )
          }
        />

        <TouchableOpacity
          style={[
            styles.submitBtn,
            (loading || !frontPhoto) && styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading || !frontPhoto}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Upload</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f7f4ff',
    flexGrow: 1,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginVertical: 10,
  },
  exampleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  exampleImage: {
    width: 160,
    height: 120,
    borderRadius: 8,
  },
  uploadBox: {
    marginVertical: 12,
  },
  uploadLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  uploadArea: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#6D28D9',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
    backgroundColor: '#fff',
  },
  uploadText: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
  },
  checkIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: '#47317c',
    padding: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnDisabled: {
    backgroundColor: '#ccc',
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000',
  },
  modalText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
  },
});
