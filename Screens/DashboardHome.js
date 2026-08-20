import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, StyleSheet, RefreshControl} from 'react-native';
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

const DashboardHome = () => {
  const insets = useSafeAreaInsets();
  /* ───────────────────────────────────────── state */
  const [productData, setProductData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const {reorder} = useReorder();
  const {imageUploaded, setImageUploaded} = useImageUploadStore();
  const {idVerificationUpload, setIdVerificationUpload} =
    useIdVerificationUploadStore();

  /* ───────────────────────────────────────── API */
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

  /* ───────────────────────────────────────── render */
  const renderLoaderSkeleton = () => (
    <View style={styles.loaderWrapper}>
      {[...Array(6)].map((_, i) => (
        <View key={i} style={styles.loaderCard} />
      ))}
    </View>
  );

  const renderProductCard = ({item, index}) => (
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
      {(!imageUploaded || !idVerificationUpload) && <UploadTopPrompt />}

      {productData?.reorder ? (
        <View style={styles.section}>
          <Text style={styles.heading}>Reorder Treatment</Text>
          <View style={styles.grid}>
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
          <Text style={styles.heading}>Available Treatments</Text>
          <Text style={styles.paragraph}>
            We offer the following weight-loss injection treatments to support
            your journey.
          </Text>
        </View>
      )}
    </>
  );

  /* ───────────────────────────────────────── UI */
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
        contentContainerStyle={[styles.container, {paddingBottom: insets.bottom + 16}]}
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

/* ───────────────────────────────────────── styles */
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    backgroundColor: '#ffffff',
  },
  section: {
    marginBottom: 12,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 16,
    color: '#1C1C29',
  },
  paragraph: {
    fontSize: 14,
    marginBottom: 16,
    color: '#4B5563',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#888',
    marginTop: 40,
  },

  /* loader skeleton */
  loaderWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 16,
  },
  loaderCard: {
    width: '48%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    opacity: 0.3,
    marginBottom: 12,
  },
});

export default DashboardHome;
