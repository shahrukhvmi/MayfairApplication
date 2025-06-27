import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Header from '../Layout/header';

export default function Ethnicity() {
    const navigation = useNavigation();
    const [selection, setSelection] = useState('');

    const options = ['Yes', 'No', 'Prefer not to say'];

    return (
        <>

            <Header />
            <ScrollView contentContainerStyle={styles.container}>
                {/* Progress */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar} />
                </View>
                <Text style={styles.progressText}>60% Completed</Text>

                {/* Heading */}
                <Text style={styles.heading}>Confirm Ethnicity</Text>
                <Text style={styles.subText}>
                    People of certain ethnicities may be suitable for treatment at a lower BMI than others, if appropriate.
                </Text>

                <Text style={styles.question}>
                    Does one of the following options describe your ethnic group or background?
                </Text>

                {/* Ethnicity List */}
                <View style={styles.ethnicityList}>
                    <View style={styles.column}>
                        <Text style={styles.bullet}>• South Asian</Text>
                        <Text style={styles.bullet}>• Other Asian</Text>
                        <Text style={styles.bullet}>• Black African</Text>
                    </View>
                    <View style={styles.column}>
                        <Text style={styles.bullet}>• Chinese</Text>
                        <Text style={styles.bullet}>• Middle Eastern</Text>
                        <Text style={styles.bullet}>• African-Caribbean</Text>
                    </View>
                </View>

                {/* Selection Buttons */}
                {options.map((opt) => (
                    <TouchableOpacity
                        key={opt}
                        style={[
                            styles.optionBox,
                            selection === opt && styles.selectedBox,
                        ]}
                        onPress={() => setSelection(opt)}
                    >
                        <Text style={styles.optionText}>{opt}</Text>
                    </TouchableOpacity>
                ))}

                {/* Next Button */}
                <TouchableOpacity
                    style={[
                        styles.nextButton,
                        !selection && styles.disabledBtn,
                    ]}
                    disabled={!selection}
                    onPress={() => navigation.navigate('calculate-height')}
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
    },
    progressContainer: {
        height: 4,
        backgroundColor: '#eee',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 6,
    },
    progressBar: {
        width: '60%',
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
        marginBottom: 8,
    },
    subText: {
        fontSize: 14,
        color: '#444',
        marginBottom: 15,
    },
    question: {
        fontWeight: '600',
        marginBottom: 10,
        fontSize: 15,
    },
    ethnicityList: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    column: {
        flex: 1,
    },
    bullet: {
        fontSize: 14,
        marginBottom: 5,
    },
    optionBox: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 14,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    selectedBox: {
        borderColor: '#4B0082',
        backgroundColor: '#eee6ff',
    },
    optionText: {
        fontSize: 15,
    },
    nextButton: {
        backgroundColor: '#4B0082',
        borderRadius: 30,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 10,
    },
    disabledBtn: {
        backgroundColor: '#ccc',
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
