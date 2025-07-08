import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import GetProductsApi from '../api/getProductsApi';
import ProductCard from '../Components/ProductCard';
import Header from '../Layout/header';

const DashboardHome = () => {
  /* ───────────────────────────────────────── state */
  const [productData, setProductData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* ───────────────────────────────────────── API */
  const getProducts = useMutation({
    mutationFn: GetProductsApi,
    onSuccess: (res) => {
      setProductData(res?.data?.data || {});
      setIsLoading(false);
      setRefreshing(false);
    },
    onError: (err) => {
      Toast.show({
        type: 'error',
        text1: err?.response?.data?.errors || 'Something went wrong',
      });
      setIsLoading(false);
      setRefreshing(false);
    },
  });

  const fetchData = () => {
    setIsLoading(true);
    getProducts.mutate({ data: {} });
  };

  const onRefresh = () => {
    setRefreshing(true);
    getProducts.mutate({ data: {} });
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ───────────────────────────────────────── render */
  const renderLoaderSkeleton = () => (
    <View style={styles.loaderWrapper}>
      {[...Array(6)].map((_, i) => (
        <View key={i} style={styles.loaderCard} />
      ))}
    </View>
  );

  const renderProductCard = ({ item, index }) => (

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
      <Header />

      {productData?.reorder ? (
        <View style={styles.section}>
          <Text style={styles.heading}>Reorder Treatment</Text>
          <View style={styles.grid}>
            {(Array.isArray(productData.reorder)
              ? productData.reorder
              : [productData.reorder]
            ).map((item, idx) => (
       
                <ProductCard
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
      <FlatList
        data={products.sort((a, b) => (a.sequence || 0) - (b.sequence || 0))}
        renderItem={renderProductCard}
        keyExtractor={(item) => `${item.id}`}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No available treatments at the moment.
          </Text>
        }
        contentContainerStyle={styles.container}
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
