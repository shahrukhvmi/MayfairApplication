import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import NextButton from '../Components/NextButton';
import BackButton from '../Components/BackButton';
import Header from '../Layout/header';

export default function PersonalDetails() {
    const navigation = useNavigation();

    const [gender, setGender] = useState(null);
    const [date, setDate] = useState(new Date('1999-08-01'));
    const [showPicker, setShowPicker] = useState(false);

    const formatDate = (date) => {
        return date.toLocaleDateString('en-GB'); // DD/MM/YYYY
    };

    const handleNext = () => {
        // You can save gender & DOB to context or navigate with params
        console.log({ gender, date });
        navigation.navigate('residential-address', { gender, date });
    };

    return (
        <>
            <Header />

            <ScrollView contentContainerStyle={styles.container}>
                {/* Progress */}
                <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar} />
                </View>
                <Text style={styles.progressText}>30% Completed</Text>

                {/* Heading */}
                <Text style={styles.heading}>Mention your sex at birth</Text>
                <Text style={styles.subtext}>
                    This refers to your sex when you were born. We ask this because a range of health issues are
                    specific to people based on their sex at birth.
                </Text>

                {/* Gender Options */}
                <TouchableOpacity
                    style={[
                        styles.genderOption,
                        gender === 'Male' && styles.genderSelected,
                    ]}
                    onPress={() => setGender('Male')}
                >
                    <Ionicons
                        name={gender === 'Male' ? 'checkbox' : 'square-outline'}
                        size={20}
                        color="#4B0082"
                        style={{ marginRight: 8 }}
                    />
                    <Text style={styles.genderText}>Male</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.genderOption,
                        gender === 'Female' && styles.genderSelected,
                    ]}
                    onPress={() => setGender('Female')}
                >
                    <Ionicons
                        name={gender === 'Female' ? 'checkbox' : 'square-outline'}
                        size={20}
                        color="#4B0082"
                        style={{ marginRight: 8 }}
                    />
                    <Text style={styles.genderText}>Female</Text>
                </TouchableOpacity>

                {/* Date of Birth */}
                <Text style={styles.label}>Date of Birth</Text>
                <TouchableOpacity style={styles.dobInput} onPress={() => setShowPicker(true)}>
                    <Text style={{ fontSize: 16, color: '#000' }}>{formatDate(date)}</Text>
                    <Ionicons name="calendar" size={20} color="#444" />
                </TouchableOpacity>

                {showPicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display={Platform.OS === 'android' ? 'default' : 'spinner'}
                        onChange={(event, selectedDate) => {
                            setShowPicker(false);
                            if (selectedDate) {
                                setDate(selectedDate);
                            }
                        }}
                        maximumDate={new Date()}
                        textColor="#000" // ✅ only affects iOS spinner
                    />
                )}

                {/* Next & Back Buttons */}
                <NextButton
                    label="Next"
                    disabled={!gender || !date}
                    onPress={handleNext}
                />

                <BackButton
                    label="Back"
                    onPress={() => navigation.goBack()}
                />
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f7f4ff',
        flexGrow: 1,
    },
    progressBarContainer: {
        height: 4,
        backgroundColor: '#ddd',
        borderRadius: 2,
        marginBottom: 8,
    },
    progressBar: {
        width: '30%',
        height: '100%',
        backgroundColor: '#4B0082',
        borderRadius: 2,
    },
    progressText: {
        textAlign: 'center',
        fontSize: 12,
        color: '#555',
        marginBottom: 20,
    },
    heading: {
        fontSize: 24,
        fontWeight: '600',
        fontFamily: 'serif',
        color: '#222',
        marginBottom: 10,
    },
    subtext: {
        color: '#555',
        fontSize: 14,
        marginBottom: 30,
    },
    genderOption: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    genderSelected: {
        borderColor: '#4B0082',
        backgroundColor: '#f2e9ff',
    },
    genderText: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 6,
        marginTop: 10,
        color
            : '#333',
    },
    dobInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#fff',
        marginBottom: 30,
        color: '#000000',
    },
});
