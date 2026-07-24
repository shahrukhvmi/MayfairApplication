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
  Alert,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {launchImageLibrary} from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

import useCartStore from '../store/useCartStore';
import useImageUploadStore from '../store/useImageUploadStore';
import useIdVerificationUploadStore from '../store/useIdVerificationUploadStore';

import GetImageIsUplaod from '../api/GetImageIsUplaod';
import {GetIdVerification} from '../api/IdVerificationApi';
import {ImageUplaodApi} from '../api/ImageUploadApi';
import NextButton from '../Components/NextButton';

// Reference images
import FullBody from '../assets/images/full-body-ok.png';
import FaceX from '../assets/images/face-x.png';
import HalfBodyX from '../assets/images/half-body-x.png';
import Header from '../Layout/header';

export default function PhotoUpload() {
  const navigation = useNavigation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [buttonLabel, setButtonLabel] = useState('Return to Dashboard');

  const {control, setValue, handleSubmit, watch} = useForm();
  const {orderId} = useCartStore();

  console.log(orderId, 'checking bmi photo order id');

  const {imageUploaded, setImageUploaded} = useImageUploadStore();
  const {idVerificationUpload, setIdVerificationUpload} =
    useIdVerificationUploadStore();

  const frontPhoto = watch('frontPhoto');

  // ✅ Ask runtime permissions once on mount
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

  // pick image from gallery
  const handleUpload = async type => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: true,
        quality: 0.8,
      },
      response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const file = response.assets[0];
          setValue(type, file);
        }
      },
    );
  };

  // fetch body photo status
  useEffect(() => {
    const fetchImageStatus = async () => {
      try {
        const res = await GetImageIsUplaod({order_id: orderId});
        setImageUploaded(res?.data?.status);

        if (!idVerificationUpload) {
          setButtonLabel('Upload ID verification photo');
        } else {
          setButtonLabel('Return to Dashboard');
        }
      } catch (error) {
        console.error('Failed to fetch image status:', error);
      }
    };
    if (orderId) fetchImageStatus();
  }, [orderId]);

  // fetch id verification status
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
        Alert.alert('Upload Required', 'Please upload a full body image.');
        return;
      }
      setLoading(true);

      const payload = {
        front: data.frontPhoto.base64, // ✅ send base64
        order_id: orderId,
      };

      const res = await ImageUplaodApi(payload);

      if (res?.status === 200) {
        setOpen(true);
        if (!idVerificationUpload) {
          setButtonLabel('Upload ID verification photo');
        } else {
          setButtonLabel('Return to Dashboard');
        }
      }
    } catch (error) {
      console.log('Upload error', error);
      if (error?.response?.data?.message === 'Unauthenticated.') {
        Alert.alert('Session Expired', 'Please login again to upload images.', [
          {text: 'OK', onPress: () => navigation.replace('Login')},
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRedirect = () => {
    if (!idVerificationUpload) {
      setOpen(false);
      navigation.navigate('id-verification');
    } else {
      setOpen(false);
      navigation.navigate('dashboard');
    }
  };

  const renderUploadBox = (label, photo, type, suggestion) => (
    <View style={styles.uploadBox}>
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
              style={{width: 80, height: 120, borderRadius: 8}}
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
            <Text style={styles.modalTitle}>Image successfully uploaded</Text>
            <Text style={styles.modalText}>
              {!idVerificationUpload
                ? 'Your full body photo has been uploaded and is now under review. You need to complete ID verification to proceed.'
                : 'Your full body photo has been uploaded and is under review. We’ll approve your order once the review is complete.'}
            </Text>
            <NextButton label={buttonLabel} onPress={handleRedirect} />
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>
          Submit your photo for prescriber review
        </Text>
        <Text style={styles.subtext}>
          Please upload a <Text style={styles.bold}>full body</Text> picture of
          yourself.
        </Text>

        {/* Info bullets */}
        <View style={{marginVertical: 10}}>
          <Text style={styles.bullet}>• We will only ask for this once.</Text>
          <Text style={styles.bullet}>
            • This is a regulatory requirement for your safety and to prevent
            inappropriate use.
          </Text>
        </View>

        {/* Example Images */}
        <View style={styles.examples}>
          <Image source={FullBody} style={styles.exampleImg} />
          <Image source={FaceX} style={styles.exampleImg} />
          <Image source={HalfBodyX} style={styles.exampleImg} />
        </View>

        {/* Upload box */}
        <Controller
          name="frontPhoto"
          control={control}
          defaultValue={null}
          render={() =>
            renderUploadBox(
              'Front Photo',
              frontPhoto,
              'frontPhoto',
              'Stand straight with your full body visible.',
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
    marginBottom: 15,
  },
  bold: {
    fontWeight: 'bold',
  },
  bullet: {
    fontSize: 13,
    color: '#444',
    marginVertical: 2,
  },
  examples: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  exampleImg: {
    width: 80,
    height: 120,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  uploadBox: {
    alignItems: 'center',
    marginVertical: 12,
  },
  uploadArea: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#6D28D9',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
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
