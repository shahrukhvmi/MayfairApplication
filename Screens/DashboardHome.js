import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import ProductCard from '../Components/ProductCard'; // ✅ Your custom RN ProductCard
import GetProductsApi from '../api/getProductsApi';
import Header from '../Layout/header';

const DashboardHome = () => {
  const [productData, setProductData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearCart = () => {
    console.log("Cart cleared");
  };

  const getProducts = useMutation({
    mutationFn: GetProductsApi,
    onSuccess: (res) => {

      console.log(res, " GetProductsApi response");
      const product = res?.data?.data || {};
      setProductData(product);
      clearCart();
      setIsLoading(false);
    },
    onError: (err) => {
      console.log(err, "GetProductsApi");
      Toast.show({ type: 'error', text1: err?.response?.data?.errors || 'Something went wrong' });
      setIsLoading(false);
    },
  });

  useEffect(() => {
    getProducts.mutate({ data: {} });
  }, []);

  const renderSkeletons = () => (
    <View style={styles.grid}>
      {[1, 2, 3].map((_, i) => (
        <View key={i} style={styles.skeletonCard}>
          <ActivityIndicator size="large" color="#ccc" />
        </View>
      ))}
    </View>
  );

  return (<>
    <Header />

    <ScrollView contentContainerStyle={styles.container}>
      {/* Reorder Treatments */}
      {isLoading ? (
        renderSkeletons()
      ) : productData?.reorder ? (
        <View>
          <Text style={styles.heading}>Reorder Treatment</Text>
          <View style={styles.grid}>
            {Array.isArray(productData.reorder) ? (
              productData.reorder.map((item, index) => (
                <ProductCard
                  key={item?.id || index}
                  id={item?.id}
                  title={item?.name}
                  image={item?.img}
                  price={item?.price || 'N/A'}
                  status={item?.inventories?.[0]?.status}
                  lastOrderDate={item?.lastOrderDate}
                  buttonText="Reorder Treatment"
                  reorder={true}
                />
              ))
            ) : (
              <ProductCard
                id={productData.reorder?.id}
                title={productData.reorder?.name}
                image={productData.reorder?.img}
                price={productData.reorder?.price || 'N/A'}
                status={productData.reorder?.inventories?.[0]?.status}
                lastOrderDate={productData.reorder?.lastOrderDate}
                buttonText="Reorder Treatment"
                reorder={true}
              />
            )}
          </View>
        </View>
      ) : null}

      {/* Available Treatments */}
      {isLoading ? (
        renderSkeletons()
      ) : productData?.products?.length > 0 ? (
        <View>
          <Text style={styles.heading}>Available Treatments</Text>
          <Text style={styles.paragraph}>
            We offer the following weight loss injections treatment options to help you in your weight loss journey...
          </Text>

          <View style={styles.grid}>
            {productData.products
              .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
              .map((product) => (
                <ProductCard
                  key={product?.id}
                  id={product?.id}
                  title={product?.name}
                  image={product?.img}
                  price={product?.price || 'N/A'}
                  status={product?.inventories?.[0]?.status}
                  buttonText="Start Consultation"
                  reorder={false}
                />
              ))}
          </View>
        </View>
      ) : (
        <Text style={styles.emptyText}>No available treatments at the moment.</Text>
      )}

      <Toast />
    </ScrollView>
  </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FAFAFA',
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 16,
  },
  paragraph: {
    fontSize: 14,
    marginBottom: 16,
  },
  grid: {
    gap: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  skeletonCard: {
    height: 150,
    backgroundColor: '#eaeaea',
    borderRadius: 8,
    flexBasis: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    marginTop: 20,
  },
});

export default DashboardHome;
