import { useNavigation } from '@react-navigation/native';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SplashScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/logo.png')} style={styles.image} />

      <Text style={styles.subtitle}>
        Welcome to your online consultation
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          console.log('Get Started pressed');
          navigation.navigate('Initial');
        }}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2EEFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  image: {
    width: 300,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  subtitle: {
    color: '#000',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 30,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#6A0DAD',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
