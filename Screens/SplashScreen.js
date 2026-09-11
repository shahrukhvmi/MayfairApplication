import {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import useAuthStore from '../store/authStore';
import useAbandonCardStore from '../store/useAbandonCardStore';
import useReviewStore from '../store/useReviewStore';
import {Fonts} from '../utils/fonts';

const PRIMARY = '#47317c';

export default function SplashScreen() {
  const navigation = useNavigation();
  const {token} = useAuthStore();
  const {abandonCard} = useAbandonCardStore();
  const {review} = useReviewStore();

  useEffect(() => {
    if (abandonCard?.type === 'abandoned-cart' || review) {
      navigation.navigate('Login');
    }
  }, [abandonCard?.type, review]);

  const handlePress = () => {
    if (token) {
      navigation.navigate('dashboard');
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.image}
        />
      </View>

      <Text style={styles.subtitle}>
        Welcome to your online consultation
      </Text>

      <View style={styles.badgeRow}>
        <View style={styles.badgeItem}>
          <View style={styles.badgeIconCircle}>
            <Feather name="shield" size={14} color={PRIMARY} />
          </View>
          <Text style={styles.badgeText}>Safe & Trusted</Text>
        </View>
        <View style={styles.badgeItem}>
          <View style={styles.badgeIconCircle}>
            <Feather name="users" size={14} color={PRIMARY} />
          </View>
          <Text style={styles.badgeText}>Expert Support</Text>
        </View>
        <View style={styles.badgeItem}>
          <View style={styles.badgeIconCircle}>
            <Feather name="truck" size={14} color={PRIMARY} />
          </View>
          <Text style={styles.badgeText}>Discreet Delivery</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.85}
        onPress={handlePress}>
        <Text style={styles.buttonText}>Get Started</Text>
        <Feather name="arrow-right" size={16} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFBFD',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoBox: {
    marginBottom: 6,
  },
  image: {
    width: 220,
    height: 110,
    resizeMode: 'contain',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: {width: 0, height: 6},
    shadowRadius: 10,
    elevation: 6,
  },
  subtitle: {
    color: '#334155',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: Fonts.regular,
    marginBottom: 28,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 22,
    marginBottom: 36,
  },
  badgeItem: {
    alignItems: 'center',
    width: 84,
  },
  badgeIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.15)',
    backgroundColor: 'rgba(71, 49, 124, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: '#334155',
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PRIMARY,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 14,
    width: '100%',
    shadowColor: 'rgba(71, 49, 124, 0.3)',
    shadowOpacity: 1,
    shadowOffset: {width: 0, height: 8},
    shadowRadius: 16,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontFamily: Fonts.semiBold,
    fontSize: 15,
  },
});
