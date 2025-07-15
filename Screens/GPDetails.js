import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from "react-native";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import useGpDetailsStore from "../store/gpDetailStore";
import Header from "../Layout/header";
import SelectField from "../Components/SelectField";
import { logApiError, logApiSuccess } from "../utils/logApiDebug";
import TextFields from "../Components/TextFields";
import Icon from 'react-native-vector-icons/FontAwesome';
import NextButton from "../Components/NextButton";
import BackButton from "../Components/BackButton";
import Toast from "react-native-toast-message";
export default function GpDetail() {
    const [searchLoading, setSearchLoading] = useState(false);
    const [addressOptions, setAddressOptions] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState("");

    const { gpdetails, setGpDetails } = useGpDetailsStore();
    const navigation = useNavigation();

    const {
        handleSubmit,
        watch,
        setValue,
        trigger,
        formState: { errors, isValid },
    } = useForm({
        mode: "onChange",
        defaultValues: {
            gpDetails: "",
            gepTreatMent: "",
            email: "",
            postalCode: "",
            addressLine1: "",
            addressLine2: "",
            city: "",
            gpName: "",
        },
    });

    const gpDetails = watch("gpDetails");
    const gepTreatMent = watch("gepTreatMent");
    const postalCode = watch("postalCode");

    useEffect(() => {
        if (gpdetails) {
            setValue("gpDetails", gpdetails.gpConsent || "");
            setValue("gepTreatMent", gpdetails.consentDetail || "");
            setValue("email", gpdetails.email || "");
            setValue("postalCode", gpdetails.zipcode || "");
            setValue("addressLine1", gpdetails.addressLine1 || "");
            setValue("addressLine2", gpdetails.addressLine2 || "");
            setValue("city", gpdetails.city || "");
            setValue("gpName", gpdetails.gpName || "");

            // if (gpdetails.zipcode || gpdetails.addressLine1 || gpdetails.city) {
            //     setManual(true);
            // }
        }
        trigger();
    }, [gpdetails, trigger, setValue]);

    const handleAddressFetch = async () => {
        if (!postalCode) return;

        const apiKey = "7a46f2abc01b47b58e586ec1cda38c68";
        const apiUrl = `https://api.nhs.uk/service-search/search-postcode-or-place?api-version=1&search=${postalCode}`;

        setSearchLoading(true);
        try {
            const response = await axios.post(
                apiUrl,
                {
                    filter: "(OrganisationTypeID eq 'GPB') or (OrganisationTypeID eq 'GPP')",
                    top: 25,
                    skip: 0,
                    count: true,
                },
                {
                    headers: {
                        "subscription-key": apiKey,
                        "Content-Type": "application/json",
                    },
                }
            );
            logApiSuccess(response)
            if (response.status === 200 && response.data?.value) {
                setAddressOptions(response.data.value);
            }
        } catch (err) {
            console.error("Postal search failed", err);

            let message = "Something went wrong";

            if (err.response?.status === 404) {
                // Custom error from NHS API
                const errorData = err.response?.data;
                message = errorData?.errorName || errorData?.errorText || "Invalid postal code. Please try again.";
            } else if (err.message) {
                message = err.message;
            }

            Toast.show({
                type: 'error',
                text1: 'Postal Code Error',
                text2: message,
            });

            setAddressOptions([]);
        } finally {
            setSearchLoading(false);
        }


    };

    const onSubmit = async (data) => {
        const payload = {
            gpConsent: data.gpDetails,
            consentDetail: data.gepTreatMent,
            email: data.email || "",
            zipcode: data.postalCode || "",
            gpName: data.gpName || "",
            addressLine1: data.addressLine1 || "",
            addressLine2: data.addressLine2 || "",
            city: data.city || "",
            state: "",
        };
        setGpDetails(payload);
        navigation.navigate("confirmation-summary");
    };
    const clearAllGpFields = () => {
        setValue("gepTreatMent", "");
        setValue("email", "");
        setValue("postalCode", "");
        setValue("gpName", "");
        setValue("addressLine1", "");
        setValue("addressLine2", "");
        setValue("city", "");

        setAddressOptions([]);
        setSelectedIndex("");
    };

    const clearAddressOnlyFields = () => {
        setValue("email", "");
        setValue("postalCode", "");
        setValue("gpName", "");
        setValue("addressLine1", "");
        setValue("addressLine2", "");
        setValue("city", "");

        setAddressOptions([]);
        setSelectedIndex("");
    };

    return (
        <>
            <Header />
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <Text style={styles.heading}>GP Details</Text>
                <Text style={styles.subheading}>Are you registered with a GP in the UK?</Text>
                <View style={styles.radioGroup}>
                    {["yes", "no"].map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.radioButton,
                                gpDetails === option && styles.selectedRadio,
                            ]}
                            onPress={() => setValue("gpDetails", option)}
                        >
                            <Text style={styles.radioText}>
                                {option === "yes" ? "Yes" : "No"}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {gpDetails === "no" && (
                    <View style={styles.infoBox}>
                        <Text>
                            You should inform your doctor of any medication you take. Contact us
                            if you want us to email a letter for your doctor.
                        </Text>
                    </View>
                )}

                {gpDetails === "yes" && (
                    <>
                        <Text style={styles.subheading}>
                            Do you consent for us to inform your GP about the treatment?
                        </Text>
                        <View style={styles.radioGroup}>
                            {[
                                { value: "yes", label: "Yes – Please inform my GP" },
                                { value: "no", label: "No – I will inform my GP prior to starting treatment" },
                            ].map((opt) => (
                                <TouchableOpacity
                                    key={opt.value}
                                    style={[
                                        styles.radioButton,
                                        gepTreatMent === opt.value && styles.selectedRadio,
                                    ]}
                                    onPress={() => {
                                        setValue("gepTreatMent", opt.value);
                                        if (opt.value === "no") {
                                            clearAddressOnlyFields();
                                        }
                                    }}

                                >
                                    <Text style={styles.radioText}>{opt.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}

                {gpDetails === "yes" && gepTreatMent === "yes" && (
                    <>
                        <Text style={styles.optionalText}>
                            Email <Text style={styles.optionalNote}>(optional)</Text>
                        </Text>
                        <TextFields
                            // label={"Email"}
                            placeholder="Email"
                            value={watch("email")}

                            onChangeText={(text) => setValue("email", text)}
                        />

                        <View style={{ marginBottom: 16 }}>
                            <View style={{ flexDirection: "row", gap: 4 }}>
                                <TextFields
                                    style={[styles.input, { flex: 1 }]}
                                    label="Post code"
                                    placeholder="Post code"
                                    value={postalCode}
                                    onChangeText={(text) => {
                                        setValue("postalCode", text);
                                        setAddressOptions([]);
                                        setSelectedIndex("");
                                    }}
                                />
                                <TouchableOpacity
                                    style={styles.searchButton}
                                    onPress={handleAddressFetch}
                                    disabled={searchLoading}
                                >
                                    <Text style={styles.searchButtonText}>
                                        {searchLoading ? (
                                            <Text style={styles.searchButtonText}>Searching</Text>
                                        ) : (
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Icon name="search" size={16} color="#fff" style={{ marginRight: 6 }} />
                                                <Text style={styles.searchButtonText}>Search</Text>
                                            </View>
                                        )}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {addressOptions?.length > 0 && (
                                <SelectField

                                    label="Select Your Address"
                                    value={selectedIndex}
                                    onChange={(idx) => {
                                        const selected = addressOptions[idx];
                                        setSelectedIndex(idx);
                                        setValue("gpName", selected.OrganisationName || "", { shouldValidate: true });
                                        setValue("addressLine1", selected.Address1 || "", { shouldValidate: true });
                                        setValue("addressLine2", selected.Address2 || "", { shouldValidate: true });
                                        setValue("city", selected.City || "", { shouldValidate: true });

                                    }}
                                    options={addressOptions.map((addr, idx) => ({
                                        value: idx,
                                        label: `${addr.OrganisationName}, ${addr.Address1}, ${addr.City}`,
                                    }))}
                                    required
                                    error={errors?.addressLine1?.message}
                                />
                            )}
                        </View>


                    </>
                )}

                {gpDetails === "yes" && gepTreatMent === "yes" && (

                    <>
                        <TextFields
                            required
                            placeholder="GP Name"
                            label="GP Name"
                            value={watch("gpName")}
                            onChangeText={(text) => setValue("gpName", text)}
                        />
                        <TextFields
                            required
                            label="Address"
                            placeholder="Address"
                            value={watch("addressLine1")}
                            onChangeText={(text) => setValue("addressLine1", text)}
                        />
                        <TextFields
                            label="Address 2"
                            placeholder="Address 2"
                            valueTextField={watch("addressLine2")}
                            onChangeText={(text) => setValue("addressLine2", text)}
                        />
                        <TextFields
                            required
                            label="Town / City"
                            placeholder="Town / City"
                            value={watch("city")}
                            onChangeText={(text) => setValue("city", text)}
                        />
                    </>
                )}



                <NextButton
                    style={{ width: "100%" }}
                    label="Next"
                    onPress={handleSubmit(onSubmit)}
                    disabled={!isValid}
                />

                <BackButton
                    label="Back"
                    onPress={() => navigation.navigate('signup')}

                />
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    heading: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 12,
    },
    subheading: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    radioGroup: {
        flexDirection: "column",
        gap: 10,
        marginBottom: 16,
    },
    radioButton: {
        flex: 1,
        flexDirection:'row',
        padding: 12,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        backgroundColor: "#fff",
    },
    selectedRadio: {
        backgroundColor: "#F2EEFF",
        borderColor: "#47317c",
    },
    radioText: {
        fontSize: 14,
        color: "#333",
    },
    infoBox: {
        backgroundColor: "#FFF3CD",
        borderLeftWidth: 4,
        borderLeftColor: "#ffeeba",
        padding: 12,
        borderRadius: 6,
        marginVertical: 16,
    },
    optionalText: {
        fontSize: 14,
        marginTop: 10,
        marginBottom: 4,
    },
    optionalNote: {
        fontStyle: "italic",
        color: "#666",
    },
    searchButton: {
        backgroundColor: "#47317c",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 4,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 48,
        marginTop: 28,
    },
    searchButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },


    nextButton: {
        backgroundColor: "#47317c",
        padding: 14,
        borderRadius: 30,
        alignItems: "center",
        marginTop: 20,
    },
    nextButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});
