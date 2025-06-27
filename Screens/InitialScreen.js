import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../Layout/header';
import { useNavigation } from '@react-navigation/native';

export default function StartConsultationIntro() {
    const navigation = useNavigation();

    const handleContinue = () => {
        navigation.navigate('Acknowledgment'); // ✅ use name, no slash!
    };

    return (
        <>
            <Header />
            <ScrollView contentContainerStyle={styles.container}>
                <Image
                    source={require('../assets/images/intro.png')} // Replace with your image
                    style={styles.image}
                />

                <Text style={styles.heading}>
                    Let’s get you started on your weight loss journey.
                </Text>

                <Text style={styles.description}>
                    We’ll now ask a few questions about you and your health.
                </Text>

                <Text style={styles.subheading}>Good to know:</Text>
                <View style={styles.bullets}>
                    <Text style={styles.bullet}>• Your consultation will take about five minutes to complete.</Text>
                    <Text style={styles.bullet}>• All your responses are confidential and securely stored.</Text>
                    <Text style={styles.bullet}>• We’ll show suitable treatment options based on the information you provide.</Text>
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={handleContinue}>
                    <Text style={styles.primaryText}>Accept and continue</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.outlineBtn} onPress={handleContinue}>
                    <Text style={styles.outlineText}>Accept and re-order</Text>
                </TouchableOpacity>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        backgroundColor: '#F9F7FD',
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 60,
    },
    image: {
        width: 150,
        height: 150,
        marginBottom: 30,
        resizeMode: 'cover',
    },
    heading: {
        fontSize: 18,
        color: '#222',
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: '600',
    },
    description: {
        textAlign: 'center',
        color: '#555',
        fontSize: 14,
        marginBottom: 24,
    },
    subheading: {
        fontWeight: 'bold',
        fontSize: 15,
        alignSelf: 'flex-start',
        marginBottom: 10,
        color: '#111',
    },
    bullets: {
        alignSelf: 'flex-start',
        marginBottom: 30,
    },
    bullet: {
        fontSize: 14,
        color: '#333',
        marginBottom: 10,
    },
    primaryBtn: {
        backgroundColor: '#4B0082',
        paddingVertical: 14,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
        marginBottom: 15,
    },
    primaryText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
    outlineBtn: {
        borderColor: '#4B0082',
        borderWidth: 2,
        paddingVertical: 14,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
    },
    outlineText: {
        color: '#4B0082',
        fontWeight: 'bold',
        fontSize: 15,
    },
});
