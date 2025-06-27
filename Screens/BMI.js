import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../Layout/header';

export default function BMI() {
    const navigation = useNavigation();

    // You can replace this with actual calculated value from global state (Zustand, Redux, etc.)
    const bmiValue = 29.1;

    return (

        <>

            <Header />
            <ScrollView contentContainerStyle={styles.container}>
                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar} />
                </View>
                <Text style={styles.progressText}>70% Completed</Text>

                {/* Heading */}
                <Text style={styles.heading}>Your BMI:</Text>

                {/* BMI Display Box */}
                <View style={styles.bmiBox}>
                    <Text style={styles.bmiText}>BMI: {bmiValue}</Text>
                </View>

                {/* Next Button */}
                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={() => navigation.navigate('medical-questions')}
                >
                    <Text style={styles.nextText}>Next</Text>
                </TouchableOpacity>

                {/* Back Button */}
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f8f5ff',
        flexGrow: 1,
        padding: 24,
        justifyContent: 'start',
    },
    progressContainer: {
        height: 4,
        backgroundColor: '#eee',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 6,
    },
    progressBar: {
        width: '70%',
        height: 4,
        backgroundColor: '#4B0082',
    },
    progressText: {
        textAlign: 'center',
        fontSize: 12,
        color: '#666',
        marginBottom: 20,
    },
    heading: {
        fontSize: 26,
        fontWeight: 'bold',
        fontFamily: 'serif',
        marginBottom: 20,
    },
    bmiBox: {
        backgroundColor: '#eee9ff',
        padding: 50,
        borderRadius: 15,
        marginBottom: 30,
        alignItems: 'center',
    },
    bmiText: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    nextButton: {
        backgroundColor: '#4B0082',
        borderRadius: 30,
        paddingVertical: 14,
        alignItems: 'center',
    },
    nextText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    backText: {
        textAlign: 'center',
        marginTop: 18,
        color: '#4B0082',
        textDecorationLine: 'underline',
    },
});
