import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Image,
  ImageBackground,
} from 'react-native';
import {useMutation} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import GetProductsApi from '../api/getProductsApi';
import ProductCard from '../Components/ProductCard';
import Header from '../Layout/header';
import GetImageIsUplaod from '../api/GetImageIsUplaod';
import {GetIdVerification} from '../api/IdVerificationApi';
import useReorder from '../store/useReorderStore';
import useImageUploadStore from '../store/useImageUploadStore';
import useIdVerificationUploadStore from '../store/useIdVerificationUploadStore';
import UploadTopPrompt from '../Components/UploadTopPrompt';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Fonts} from '../utils/fonts';
import useSignupStore from '../store/signupStore';

const DashboardHome = () => {
  const insets = useSafeAreaInsets();
  const {firstName} = useSignupStore();
  const [productData, setProductData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const {reorder} = useReorder();
  const {imageUploaded, setImageUploaded} = useImageUploadStore();
  const {idVerificationUpload, setIdVerificationUpload} =
    useIdVerificationUploadStore();

  const getProducts = useMutation({
    mutationFn: GetProductsApi,
    onSuccess: res => {
      setProductData(res?.data?.data || {});
      setIsLoading(false);
      setRefreshing(false);
    },
    onError: err => {
      Toast.show({
        type: 'error',
        text1:
          typeof err?.response?.data?.errors === 'string'
            ? err?.response?.data?.errors
            : 'Something went wrong',
      });
      setIsLoading(false);
      setRefreshing(false);
    },
  });

  const fetchData = () => {
    setIsLoading(true);
    getProducts.mutate({data: {}});
  };

  const onRefresh = () => {
    setRefreshing(true);
    getProducts.mutate({data: {}});
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchImageStatus = async () => {
      try {
        const res = await GetImageIsUplaod({reorder});
        console.log('Image Upload Response', res);
        setImageUploaded(res?.data?.status);
      } catch (error) {
        console.error('Failed to fetch image status:', error);
      }
    };

    fetchImageStatus();
  }, [reorder]);

  useEffect(() => {
    const fetchImageStatus = async () => {
      try {
        const res = await GetIdVerification({reorder});
        console.log('Verification Image Status', res);
        setIdVerificationUpload(res?.data?.status);
      } catch (error) {
        console.error('Failed to fetch image status:', error);
      }
    };

    fetchImageStatus();
  }, [reorder]);

  const renderLoaderSkeleton = () => (
    <View style={styles.loaderScreen}>
      {/* Welcome banner skeleton */}
      <View style={styles.skeletonBanner} />

      {/* Reorder / section heading skeleton */}
      <View style={styles.skeletonHeading} />

      {/* Product row skeletons */}
      {[...Array(4)].map((_, i) => (
        <View key={i} style={styles.skeletonRow}>
          <View style={styles.skeletonThumb} />
          <View style={{flex: 1, gap: 8}}>
            <View style={styles.skeletonLineWide} />
            <View style={styles.skeletonLineNarrow} />
          </View>
          <View style={styles.skeletonButton} />
        </View>
      ))}
    </View>
  );

  const renderProductCard = ({item}) => (
    <ProductCard
      id={item.id}
      title={item.name}
      image={item.img}
      price={item.price || 'N/A'}
      status={item.inventories?.[0]?.status}
      buttonText="Start Consultation"
      reorder={false}
    />
  );

  const products = productData?.products ?? [];

  const renderHeader = () => (
    <>
      {/* Welcome Banner */}
      <ImageBackground
        source={require('../assets/images/dashboard-hero.png')}
        style={styles.welcomeHeader}
        imageStyle={styles.welcomeHeaderImage}>
        <View style={styles.welcomeOverlay} />

        <Text style={styles.welcomeHeading}>
          Welcome back{firstName ? `,\n${firstName}` : ''}
        </Text>
        <Text style={styles.welcomeSubtitle}>
          Your weight loss journey continues here.
        </Text>
      </ImageBackground>

      {(!imageUploaded || !idVerificationUpload) && <UploadTopPrompt />}

      {productData?.reorder ? (
        <View style={styles.section}>
          <Text style={styles.headingNoPad}>Reorder Treatment</Text>
          <View style={styles.reorderList}>
            {(Array.isArray(productData.reorder)
              ? productData.reorder
              : [productData.reorder]
            ).map((item, idx) => (
              <ProductCard
                key={item.id ?? idx}
                id={item.id}
                title={item.name}
                image={item.img}
                price={item.price || 'N/A'}
                status={item.inventories?.[0]?.status}
                lastOrderDate={item.lastOrderDate}
                buttonText="Reorder Treatment"
                reorder
              />
            ))}
          </View>
        </View>
      ) : null}

      {products.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.headingNoPad}>Available Treatments</Text>
          <Text style={styles.paragraph}>
            We offer the following weight-loss injection treatments to support
            your journey.
          </Text>
        </View>
      )}
    </>
  );

  if (isLoading && !refreshing) {
    return (
      <>
        <Header />
        {renderLoaderSkeleton()}
      </>
    );
  }

  return (
    <>
      <Header />
      <FlatList
        style={styles.list}
        data={[...products].sort(
          (a, b) => (a.sequence || 0) - (b.sequence || 0),
        )}
        renderItem={renderProductCard}
        keyExtractor={item => `${item.id}`}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No available treatments at the moment.
          </Text>
        }
        contentContainerStyle={[
          styles.container,
          {paddingBottom: insets.bottom + 16},
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#47317c']}
            progressBackgroundColor="#f2f2f2"
          />
        }
      />

      <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  list: {
    backgroundColor: '#FBFBFD',
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    backgroundColor: '#FBFBFD',
  },

  // Welcome Banner
  welcomeHeader: {
    marginHorizontal: -16,
    paddingHorizontal: 20,
    paddingVertical: 36,
    marginBottom: 12,
    minHeight: 200,
    justifyContent: 'center',
    backgroundColor: '#3d2a68',
    overflow: 'hidden',
  },
  welcomeHeaderImage: {
    resizeMode: 'cover',
  },
  welcomeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#231644',
    opacity: 0.75,
  },
  welcomeHeading: {
    fontSize: 26,
    lineHeight: 32,
    color: '#ffffff',
    fontFamily: Fonts.bold,
    marginBottom: 6,
    zIndex: 1,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: Fonts.regular,
    lineHeight: 19,
    marginBottom: 0,
    zIndex: 1,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 4,
  },

  // Sections
  section: {
    marginBottom: 8,
  },
  heading: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    marginTop: 16,
    marginBottom: 12,
    color: '#0f172a',
  },
  headingNoPad: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    marginTop: 16,
    marginBottom: 12,
    color: '#0f172a',
  },
  paragraph: {
    fontSize: 13,
    marginBottom: 12,
    color: '#64748b',
    fontFamily: Fonts.regular,
    lineHeight: 18,
  },
  reorderList: {
    gap: 12,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 40,
    fontFamily: Fonts.regular,
  },

  // Loader skeleton
  loaderScreen: {
    flex: 1,
    backgroundColor: '#FBFBFD',
    padding: 16,
  },
  skeletonBanner: {
    height: 200,
    borderRadius: 18,
    backgroundColor: '#e2d9f3',
    opacity: 0.6,
    marginBottom: 20,
  },
  skeletonHeading: {
    width: '55%',
    height: 20,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
    opacity: 0.7,
    marginBottom: 16,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 12,
  },
  skeletonThumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    opacity: 0.7,
  },
  skeletonLineWide: {
    width: '75%',
    height: 14,
    borderRadius: 5,
    backgroundColor: '#e2e8f0',
    opacity: 0.7,
  },
  skeletonLineNarrow: {
    width: '45%',
    height: 12,
    borderRadius: 5,
    backgroundColor: '#e2e8f0',
    opacity: 0.5,
  },
  skeletonButton: {
    width: 88,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#e2d9f3',
    opacity: 0.7,
  },
});

export default DashboardHome;
