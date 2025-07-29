import {View, Text, StyleSheet} from 'react-native';
import React from 'react';

export default function PaymentFailed() {
  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <View>
        <Text style={styles.thankYouText}>Payment Failed</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3eeff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thankYouText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#4B0082', // Optional: deep purple for better contrast
  },
});
