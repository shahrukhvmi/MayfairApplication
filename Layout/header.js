// Header.jsx
import React, { useState } from "react";
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import LoginModal from "../Components/Login/LoginModal";
import useLoginModalStore from "../store/useLoginModalStore";
import { Login } from "../api/loginApi";
import useSignupStore from "../store/signupStore";
import Fetcher from "../library/Fetcher";
import useAuthStore from "../store/authStore"; // ✅ get token
import Dropdown from "../Components/Dropdown";

const Header = () => {
    const navigation = useNavigation();
    const [showLoader, setShowLoader] = useState(false);
    const { showLoginModal, closeLoginModal, openLoginModal } =
        useLoginModalStore();

    const { setFirstName, setLastName, setEmail, firstName } = useSignupStore();
    const { token, clearToken, setToken } = useAuthStore();
    const { firstName: userFirstName, clearFirstName, clearLastName, clearEmail } = useSignupStore();

    const [anchorVisible, setAnchorVisible] = useState(false); // dropdown state

    const handleLogout = () => {
        clearToken();
        clearFirstName();
        clearLastName();
        clearEmail();
        navigation.reset({ index: 0, routes: [{ name: "Initial" }] }); // or navigate to login screen
    };

    const loginMutation = useMutation({
        mutationFn: Login,
        onMutate: () => setShowLoader(true),
        onSuccess: (resp) => {
            const user = resp?.data?.data;
            if (!user?.token) throw new Error("No token in response");

            setToken(user.token);
            Fetcher.axiosSetup.defaults.headers.common.Authorization =
                `Bearer ${user.token}`;
            setShowLoader(false);
            closeLoginModal();

            setFirstName(user.fname);
            setLastName(user.lname);
            setEmail(user.email);

            navigation.reset({
                index: 0,
                routes: [{ name: "dashboard" }],
            });
        },
        onError: (error) => {
            setShowLoader(false);
            const errs = error?.response?.data?.errors;
            if (errs && typeof errs === "object") {
                Object.values(errs).flat().forEach((msg) =>
                    Toast.show({ type: "error", text1: msg })
                );
            } else {
                Toast.show({ type: "error", text1: "Login failed" });
            }
        },
    });

    return (
        <>
            <View style={styles.header}>
                {/* Logo */}
                <TouchableOpacity onPress={() => navigation.navigate("Initial")}>
                    <Image
                        source={require("../assets/images/logo.png")}
                        style={styles.logo}
                    />
                </TouchableOpacity>

                {/* Right side — login or profile */}
                <Dropdown
                    token={token}
                    userFirstName={userFirstName}
                    handleLogout={handleLogout}
                    openLoginModal={openLoginModal}
                />

            </View>

            {/* Login Modal */}
            <LoginModal
                modes="login"
                show={showLoginModal}
                onClose={closeLoginModal}
                isLoading={showLoader}
                onLogin={(formData) =>
                    loginMutation.mutate({ ...formData, company_id: 1 })
                }
            />

           
        </>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    logo: {
        width: 120,
        height: 50,
        resizeMode: "contain",
    },
    loginText: {
        fontWeight: "600",
        fontSize: 16,
        color: "#4B0082",
    },
    profileWrapper: {
        flexDirection: "row",
        alignItems: "center",
    },
    profileImage: {
        width: 32,
        height: 32,
        borderRadius: 50,
        marginRight: 8,
    },
    profileText: {
        fontWeight: "600",
        fontSize: 15,
        color: "#4B0082",
    },
});

export default Header;
