import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import { useForm, Controller } from 'react-hook-form';

import Header from '../Layout/header';
import TextField from '../Components/TextField';
import NextButton from '../Components/NextButton';
import BackButton from '../Components/BackButton';

export default function ResidentialAddressScreen() {
    const navigation = useNavigation();
    const [showManual, setShowManual] = useState(true);

    const { control, handleSubmit } = useForm({
        defaultValues: {
            postcode: '',
            address1: '',
            address2: '',
            city: '',
            country: '',
        },
    });

    const onSubmit = (data) => {
        console.log('Form Data:', data);
        navigation.navigate('preferred-phone-number');
    };

    return (
        <>
            <Header />

            <ScrollView contentContainerStyle={styles.container}>
                {/* Progress Bar */}
                <View style={styles.progressBarBackground}>
                    <View style={styles.progressBarFill} />
                </View>
                <Text style={styles.progressText}>40% Completed</Text>

                {/* Title */}
                <Text style={styles.heading}>Patient Residential Address</Text>
                <Text style={styles.subtext}>Required for age verification purpose</Text>

                {/* Postcode Search with button inside input */}
                <View style={styles.relativeContainer}>
                    <Controller
                        control={control}
                        name="postcode"
                        render={({ field: { onChange, value } }) => (
                            <TextField
                                placeholder="Enter your postal code"
                                value={value}
                                onChangeText={onChange}
                                style={styles.textFieldWithButton}
                            />
                        )}
                    />
                    <TouchableOpacity style={styles.insideSearchButton}>
                        <Ionicons name="search" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>



                {/* Toggle Manual Fields */}
                <TouchableOpacity onPress={() => setShowManual(!showManual)}>
                    <Text style={styles.toggleText}>
                        {showManual ? 'Hide manual address entry' : 'Enter address manually'}
                    </Text>
                </TouchableOpacity>

                {/* Manual Fields */}
                {showManual && (
                    <>
                        <Controller
                            control={control}
                            name="address1"
                            render={({ field: { onChange, value } }) => (
                                <TextField
                                    placeholder="Enter address line 1"
                                    value={value}
                                    onChangeText={onChange}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="address2"
                            render={({ field: { onChange, value } }) => (
                                <TextField
                                    placeholder="Enter address line 2 (optional)"
                                    value={value}
                                    onChangeText={onChange}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="city"
                            render={({ field: { onChange, value } }) => (
                                <TextField
                                    placeholder="Enter city or town"
                                    value={value}
                                    onChangeText={onChange}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="country"
                            render={({ field: { onChange, value } }) => (
                                <TextField
                                    placeholder="Enter state or country"
                                    value={value}
                                    onChangeText={onChange}
                                />
                            )}
                        />
                    </>
                )}

                {/* Next & Back Buttons */}
                <NextButton label="Next" onPress={handleSubmit(onSubmit)} />
                <BackButton label="Back" onPress={() => navigation.goBack()} />
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f8f5ff',
        padding: 24,
        flexGrow: 1,
    },
    progressBarBackground: {
        height: 4,
        backgroundColor: '#ddd',
        borderRadius: 2,
        marginBottom: 6,
    },
    progressBarFill: {
        width: '40%',
        height: 4,
        backgroundColor: '#4B0082',
        borderRadius: 2,
    },
    progressText: {
        textAlign: 'center',
        fontSize: 12,
        marginBottom: 20,
        color: '#666',
    },
    heading: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#2e2e2e',
        fontFamily: 'serif',
        marginBottom: 6,
    },
    subtext: {
        fontSize: 13,
        color: '#555',
        marginBottom: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },

    inputWrapper: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        backgroundColor: '#fff',
    },

    searchBtn: {
        flexDirection: 'row',
        backgroundColor: '#4B0082',
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },

    searchBtn: {
        flexDirection: 'row',
        backgroundColor: '#4B0082',
        paddingHorizontal: 12,
        paddingVertical: 3,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    toggleText: {
        color: '#4B0082',
        fontSize: 13,
        marginTop: 10,
        marginBottom: 20,
        textAlign: 'right',
    },
    relativeContainer: {
        position: 'relative',
        marginBottom: 20,
    },

    textFieldWithButton: {
        paddingRight: 40,
    },

    insideSearchButton: {
        position: 'absolute',
        right: 10,
        top: 0,
        tran1form: [{ translateY: -12 }],
        backgroundColor: '#4B0082',
        borderRadius: 4,
        paddingHorizontal: 18,
        paddingVertical: 19,
        justifyContent: 'center',
        alignItems: 'center',
    },
    
});
