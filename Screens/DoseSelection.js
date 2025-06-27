import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../Layout/header';

export default function DoseSelection() {
    const navigation = useNavigation();
    const [selected, setSelected] = useState('7.5 mg');
    const [quantity, setQuantity] = useState(1);

    const dosages = [
        { label: '2.5 mg', price: '£159.00', stock: true },
        { label: '5 mg', price: '£189.00', stock: true },
        { label: '7.5 mg', price: '£229.00', stock: true },
        { label: '10 mg', price: '£229.00', stock: true },
        { label: '12.5 mg', price: '£245.00', stock: true },
        { label: '15 mg', price: '£245.00', stock: true },
    ];

    const increase = () => setQuantity(q => q + 1);
    const decrease = () => setQuantity(q => (q > 1 ? q - 1 : 1));

    const orderTotal = () => {
        const price = Number(dosages.find(d => d.label === selected)?.price.replace(/[\u00A3,]/g, '')) || 0;
        return `£${price * quantity}`;
    };

    return (
        <View style={{ flex: 1 }}>
            <Header />

            <ScrollView contentContainerStyle={styles.container}>
                <Image source={require('../assets/images/mounjaro.jpg')} style={styles.image} />
                <Text style={styles.title}>Mounjaro (Tirzepatide)</Text>
                <Text style={styles.badge}>Pack of 5 needles is included with every dose</Text>
                <Text style={styles.price}>From £159.00</Text>

                <Text style={styles.sectionTitle}>
                    Choose your <Text style={{ fontWeight: 'bold' }}>Dosage</Text>
                </Text>

                {dosages.map((item) => (
                    <TouchableOpacity
                        key={item.label}
                        onPress={() => item.stock && setSelected(item.label)}
                        style={[
                            styles.cardBox,
                            selected === item.label && styles.cardSelected,
                            !item.stock && styles.cardOutOfStock,
                        ]}
                        activeOpacity={0.8}
                    >
                        <View style={styles.cardRow}>
                            <View style={styles.leftSection}>
                                {/* <View style={styles.cardIconPlaceholder} /> */}
                                <View>
                                    <Text style={styles.cardNumber}>{item.label}</Text>
                                    <Text style={styles.expiry}>Expiry: 01/26</Text>
                                </View>
                            </View>

                            <View style={styles.rightSection}>
                                <Text style={styles.balanceMain}>{item.price}</Text>
                                <Text style={styles.balanceSub}>£{(Number(item.price.replace(/[\u00A3,]/g, '')) / 12).toFixed(2)}
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.qtyRow, selected !== item.label && { opacity: 0.5 }]}>
                            <TouchableOpacity onPress={selected === item.label ? decrease : undefined} style={styles.qtyBtn}>
                                <Text>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.qtyText}>{selected === item.label ? quantity : 1}</Text>
                            <TouchableOpacity onPress={selected === item.label ? increase : undefined} style={styles.qtyBtn}>
                                <Text>+</Text>
                            </TouchableOpacity>
                        </View>

                        {!item.stock && <Text style={styles.outOfStock}>Out of stock</Text>}
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.footerBar}>
                <View style={styles.footerLeft}>
                    <Text style={styles.footerTitle}>Mounjaro (Tirzepatide)</Text>
                    <Text style={styles.footerPriceLabel}>Order total: <Text style={styles.footerPrice}>{orderTotal()}</Text></Text>
                </View>



                <TouchableOpacity
                    style={styles.proceedBtn}
                    onPress={() => {
                        const selectedDose = dosages.find(d => d.label === selected);
                        const price = Number(selectedDose?.price.replace(/[\u00A3,]/g, '')) || 0;

                        navigation.navigate('checkout');
                    }}
                >
                    <Text style={styles.proceedText}>Proceed to Checkout</Text>
                </TouchableOpacity>

            </View>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 30,
        paddingBottom: 120,
        backgroundColor: '#F2EDF9',
    },
    image: {
        width: '100%',
        height: 180,
        resizeMode: 'contain',
        marginBottom: 10,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#4B0082',
    },
    badge: {
        backgroundColor: '#eee',
        padding: 4,
        borderRadius: 4,
        marginTop: 5,
        fontSize: 12,
    },
    price: {
        marginVertical: 8,
        fontWeight: '600',
    },
    sectionTitle: {
        marginVertical: 10,
        fontSize: 16,
    },
    cardBox: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        minHeight: 110,
        justifyContent: 'space-between',
    },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    cardIconPlaceholder: {
        width: 40,
        height: 28,
        borderRadius: 6,
        backgroundColor: '#f0e9e0',
        marginRight: 10,
    },
    cardNumber: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#222',
    },
    expiry: {
        fontSize: 12,
        color: '#777',
        marginTop: 2,
    },
    rightSection: {
        alignItems: 'flex-end',
    },
    balanceMain: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#222',
    },
    balanceSub: {
        fontSize: 13,
        color: '#777',
        marginTop: 2,
    },
    cardSelected: {
        borderColor: '#4B0082',
        borderWidth: 1.5,
    },
    cardOutOfStock: {
        opacity: 0.5,
    },
    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'start',
        marginTop: 14,
        gap: 12,
    },
    qtyBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#EEE',
        borderRadius: 8,
    },
    qtyText: {
        fontSize: 16,
        fontWeight: '600',
    },
    outOfStock: {
        color: 'red',
        marginTop: 8,
        textAlign: 'center',
        fontSize: 12,
    },
    footerBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        position: 'absolute',
        bottom: 15,
        left: 0,
        right: 0,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    footerLeft: {
        flexDirection: 'column',
    },
    footerTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#000',
    },
    footerPriceLabel: {
        fontSize: 12,
        color: '#444',
    },
    footerPrice: {
        fontWeight: 'bold',
        color: '#000',
    },
    proceedBtn: {
        backgroundColor: '#4B0082',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 30,
    },
    proceedText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 13,
    },
});
