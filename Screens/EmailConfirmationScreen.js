import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';

import TextField from '../Components/TextFields';
import NextButton from '../Components/NextButton';
import BackButton from '../Components/BackButton';
import Header from '../Layout/header';

const EmailConfirmation = () => {
    const navigation = useNavigation();

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors, isValid },
    } = useForm({
        defaultValues: {
            email: '',
            confirmEmail: '',
        },
        mode: 'onChange',
    });

    const email = watch('email');

    const onSubmit = (data) => {
        console.log('Submitted:', data);
        // Pass to next step or save to context
        navigation.navigate('personal-details', { ...data });
    };

    return (
        <>
            <Header />
            <ScrollView contentContainerStyle={styles.container}>
                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar} />
                </View>
                <Text style={styles.progressText}>20% Completed</Text>

                {/* Heading */}
                <Text style={styles.heading}>Please enter your email</Text>
                <Text style={styles.subtext}>
                    This is where we’ll send information from your prescriber and pharmacy.
                </Text>

                {/* Email Field */}
                <Controller
                    control={control}
                    name="email"
                    rules={{
                        required: 'Email is required',
                        pattern: {
                            value: /\S+@\S+\.\S+/,
                            message: 'Enter a valid email address',
                        },
                    }}
                    render={({ field: { onChange, value } }) => (
                        <TextField
                            label="Email Address"
                            placeholder="Enter your email"
                            value={value}
                            onChangeText={onChange}
                            required
                        />
                    )}
                />
                {errors.email && (
                    <Text style={styles.error}>{errors.email.message}</Text>
                )}

                {/* Confirm Email Field */}
                <Controller
                    control={control}
                    name="confirmEmail"
                    rules={{
                        required: 'Please confirm your email',
                        validate: (value) =>
                            value === email || 'Email addresses must match',
                    }}
                    render={({ field: { onChange, value } }) => (
                        <TextField
                            label="Confirm Email Address"
                            placeholder="Confirm your email"
                            value={value}
                            onChangeText={onChange}
                            required
                        />
                    )}
                />
                {errors.confirmEmail && (
                    <Text style={styles.error}>{errors.confirmEmail.message}</Text>
                )}

                {/* Next & Back Buttons */}
                <NextButton
                    label="Next"
                    disabled={!isValid}
                    onPress={handleSubmit(onSubmit)}
                />

                <BackButton label="Back" onPress={() => navigation.goBack()} />
            </ScrollView>
        </>
    );
};

export default EmailConfirmation;

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
        width: '20%',
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
        fontSize: 26,
        fontWeight: '600',
        color: '#2e2e2e',
        marginBottom: 10,
    },
    subtext: {
        color: '#555',
        fontSize: 14,
        marginBottom: 30,
    },
    error: {
        color: 'red',
        marginBottom: 10,
    },
});
