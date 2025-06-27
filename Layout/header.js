import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import { useState } from 'react';
import {
    Image,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const Header = () => {
    const [showModal, setShowModal] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secure, setSecure] = useState(true);
    const navigation = useNavigation();
    return (
        <>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate("Initial")}>



                    <Image
                        source={require('../assets/images/logo.png')} // Adjust the path as necessary
                        style={styles.logo}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowModal(true)}>
                    <Text style={styles.loginText}>Login</Text>
                </TouchableOpacity>
            </View>

            {/* Modal */}
            <Modal transparent animationType="fade" visible={showModal}>
                <View style={styles.modalWrapper}>
                    <View style={styles.modalBox}>
                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={() => setShowModal(false)}
                        >
                            {/* <Ionicons name="close" size={24} color="#333" /> */}
                        </TouchableOpacity>

                        <Text style={styles.modalTitle}>Login</Text>

                        <Text style={styles.label}>
                            Email Address <Text style={{ color: 'red' }}>*</Text>
                        </Text>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            style={styles.input}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Text style={styles.label}>
                            Password <Text style={{ color: 'red' }}>*</Text>
                        </Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Enter your password"
                                style={[styles.input, { flex: 1 }]}
                                secureTextEntry={secure}
                            />
                            <TouchableOpacity onPress={() => setSecure(!secure)}>
                                {/* <Ionicons
                                    name={secure ? 'eye-outline' : 'eye-off-outline'}
                                    size={20}
                                    color="#666"
                                    style={{ marginLeft: 8 }}
                                /> */}
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.loginButton}>
                            <Text style={styles.loginButtonText}>Login</Text>
                        </TouchableOpacity>

                        <Text style={styles.infoText}>
                            Are you a new patient?{' '}
                            <Text style={styles.link}>Get started with the consultation</Text>
                        </Text>
                        <TouchableOpacity>
                            <Text style={styles.link}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    logo: {
        width: 120,
        height: 50,
        resizeMode: 'contain',
    },
    loginText: {
        fontWeight: '600',
        fontSize: 16,
        color: '#4B0082',
    },
    modalWrapper: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        backgroundColor: '#fff',
        width: '90%',
        borderRadius: 12,
        padding: 20,
        elevation: 10,
    },
    closeBtn: {
        alignSelf: 'flex-end',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        alignSelf: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
    },
    input: {
        backgroundColor: '#f3f3ff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 12,
        marginBottom: 10,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    loginButton: {
        backgroundColor: '#4B0082',
        borderRadius: 30,
        paddingVertical: 14,
        marginTop: 15,
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    infoText: {
        textAlign: 'center',
        fontSize: 13,
        marginTop: 20,
        color: '#333',
    },
    link: {
        color: '#4B0082',
        textDecorationLine: 'underline',
    },
});

export default Header;
