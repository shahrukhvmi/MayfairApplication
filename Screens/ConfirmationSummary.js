import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../Layout/header';
import NextButton from '../Components/NextButton';
import BackButton from '../Components/BackButton';

export default function ConfirmationSummary() {
    const navigation = useNavigation();

    // These values should come from Zustand, Redux or props
    const formData = {
        fullName: 'Pamela Wyatt',
        dob: '01-08-1995',
        gender: 'Male',
        postcode: 'ig88ey',
        height: '20 cm',
        weight: '200 kg',
        bmi: '5000.0',
    };

    return (

        <>

            <Header />
            <ScrollView contentContainerStyle={styles.container}>
                {/* Progress */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar} />
                </View>
                <Text style={styles.progressText}>95% Completed</Text>

                {/* Heading */}
                <Text style={styles.heading}>Confirm your answers</Text>
                <Text style={styles.subheading}>
                    It’s important your answers are accurate, as we’ll use them to determine your suitability for the treatment.
                </Text>

                {/* Answer Box */}
                <View style={styles.answerBox}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Full Name: </Text>
                        <Text style={styles.value}>{formData.fullName}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Date of Birth: </Text>
                        <Text style={styles.value}>{formData.dob}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Post code: </Text>
                        <Text style={styles.value}>{formData.postcode}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Gender: </Text>
                        <Text style={styles.value}>{formData.gender}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Height: </Text>
                        <Text style={styles.value}>{formData.height}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Weight: </Text>
                        <Text style={styles.value}>{formData.weight}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>BMI: </Text>
                        <Text style={styles.value}>{formData.bmi}</Text>
                    </View>
                </View>

                {/* Confirm Button */}


                <NextButton
                    onPress={() => navigation.navigate('dose-selection')}
                    label='Next'

                />
                <BackButton label='Review all answers' onPress={() => navigation.navigate('dose-selection')} />
                <BackButton label='Back' onPress={() => navigation.goBack()} />
                {/* Review + Back */}


            </ScrollView>

        </>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f8f5ff',
        flexGrow: 1,
        padding: 20,
        paddingBottom: 40,
    },
    progressContainer: {
        height: 4,
        backgroundColor: '#eee',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 6,
    },
    progressBar: {
        width: '95%',
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
        fontSize: 22,
        fontWeight: 'bold',
        fontFamily: 'serif',
        marginBottom: 10,
    },
    subheading: {
        fontSize: 14,
        color: '#333',
        marginBottom: 20,
    },
    answerBox: {
        backgroundColor: '#eee9ff',
        borderRadius: 10,
        padding: 20,
        marginBottom: 30,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 10,
        flexWrap: 'wrap',
    },
    label: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    value: {
        fontSize: 14,
        color: '#333',
    },
    confirmBtn: {
        backgroundColor: '#4B0082',
        borderRadius: 30,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 15,
    },
    confirmText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    link: {
        textAlign: 'center',
        color: '#4B0082',
        textDecorationLine: 'underline',
        marginBottom: 10,
    },
});
