import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';

import NextButton from '../Components/NextButton';
import {Fonts} from '../utils/fonts';

const PRIMARY = '#47317c';

const PaymentFailed = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleGoBack = () => {
    navigation.navigate('dashboard');
  };

  return (
    <View
      style={[
        styles.container,
        {paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16},
      ]}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.decorCircleTop} />
          <View style={styles.decorCircleBottom} />

          <View style={styles.iconWrap}>
            <View style={styles.cardIcon}>
              <Feather name="credit-card" size={40} color={PRIMARY} />
              <View style={styles.alertBadge}>
                <Feather name="alert-triangle" size={15} color="#fff" />
              </View>
            </View>
          </View>

          <Text style={styles.title}>Payment Failed</Text>
          <Text style={styles.description}>
            It looks like your payment wasn't completed. You can try again or
            contact us if you need help.
          </Text>
        </View>

        {/* Action */}
        <View style={styles.body}>
          <NextButton
            onPress={handleGoBack}
            label="Visit patient dashboard"
            style={styles.button}
          />
        </View>
      </View>
    </View>
  );
};

export default PaymentFailed;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFBFD',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.1)',
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: 'rgba(71, 49, 124, 0.14)',
    shadowOffset: {width: 0, height: 14},
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 4,
  },

  header: {
    backgroundColor: '#f5f2fc',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(71, 49, 124, 0.08)',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 34,
    overflow: 'hidden',
  },
  decorCircleTop: {
    position: 'absolute',
    top: -60,
    right: -48,
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 22,
    borderColor: 'rgba(71, 49, 124, 0.035)',
  },
  decorCircleBottom: {
    position: 'absolute',
    bottom: -60,
    left: -48,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(71, 49, 124, 0.035)',
  },
  iconWrap: {
    marginBottom: 22,
  },
  cardIcon: {
    width: 108,
    height: 80,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.15)',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(71, 49, 124, 0.16)',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },
  alertBadge: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: 34,
    height: 34,
    borderRadius: 11,
    borderWidth: 4,
    borderColor: '#f5f2fc',
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: '#0f172a',
    textAlign: 'center',
  },
  description: {
    fontSize: 13.5,
    fontFamily: Fonts.regular,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
    paddingHorizontal: 6,
  },

  body: {
    paddingHorizontal: 24,
    paddingVertical: 22,
  },
  button: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    minHeight: 48,
  },
});
