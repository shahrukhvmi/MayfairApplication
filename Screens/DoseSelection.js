// DoseSelection.js
import React, { useState, useCallback } from 'react';
import { Image, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Header from '../Layout/header';
import Dose from '../Components/Dose';
import Addon from '../Components/addon';

// ────────────────────────────────────────────────────────────────────
export default function DoseSelection() {
  const navigation = useNavigation();

  const [selectedId, setSelectedId] = useState(null);    
  const [qty, setQty] = useState(1);

  /** Mock dose list coming from API */
  const rawDosages = [
    { id: 1, label: '2.5 mg', price: 159, stock: true },
    { id: 2, label: '5 mg', price: 189, stock: true },
    { id: 3, label: '7.5 mg', price: 229, stock: true },
    { id: 4, label: '10 mg', price: 229, stock: true },
    { id: 5, label: '12.5 mg', price: 245, stock: true },
    { id: 6, label: '15 mg', price: 245, stock: false },
  ];
  const rawAddons = [
    { id: 1, label: 'Sharps Bin', price: 5, stock: true },
    { id: 2, label: 'Box of 5 Needles', price: 2, stock: true },
    { id: 3, label: 'Pack of 10 Swabs', price: 1, stock: true },
  ];

  /** Helper to convert the raw object into what <Dose /> expects */
  const withDoseFields = useCallback(
    d => ({
      ...d,
      product_name: 'Mounjaro (Tirzepatide)',
      name: d.label,                          
      price: d.price,
      expiry: '2026-01-01',                      
      stock: { status: d.stock ? 1 : 0, quantity: 99 },
      qty,                                   
    }),
    [qty]
  );
  const withAddonsFields = useCallback(
    d => ({
      ...d,
      product_name: d.label,                              // Dose component shows this as the “name”
      price: d.price,                  // fake, or remove if you have real data
      stock: { status: d.stock ? 1 : 0, quantity: 99 },
      qty,                                        // current qty for this dose
    }),
    [qty]
  );
  /** ––––– Selection handlers ––––– */
  const addDose = doseId => {
    setSelectedId(doseId);
    setQty(1);
  };

  const incrementDose = () => setQty(q => q + 1);
  const decrementDose = () => setQty(q => (q > 1 ? q - 1 : q));

  const totalSelectedQty = () => (selectedId ? qty : 0);

  const orderTotal = () => {
    if (!selectedId) return '£0.00';
    const dose = rawDosages.find(d => d.id === selectedId);
    return `£${(dose.price * qty).toFixed(2)}`;
  };

  // ───────────────────────────────── UI ─────────────────────────────────
  return (
    <View style={{ flex: 1 }}>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.wraper}>

          <Image source={require('../assets/images/mounjaro.jpg')} style={styles.image} />
          <Text style={styles.title}>Mounjaro (Tirzepatide)</Text>
          <Text style={styles.badge}>Pack of 5 needles is included with every dose</Text>
          <Text style={styles.price}>From £159.00</Text>

        </View>
        <Text style={styles.sectionTitle}>
          Choose your <Text style={{ fontWeight: 'bold' }}>Dosage</Text>
        </Text>

        {rawDosages.map(dose => (
          <Dose
            key={dose.id}
            doseData={withDoseFields(dose)}
            isSelected={selectedId === dose.id}
            qty={qty}
            allow={12}                       // maximum units of a single dose
            totalSelectedQty={totalSelectedQty}
            onAdd={() => addDose(dose.id)}
            onIncrement={incrementDose}
            onDecrement={decrementDose}
          />
        ))}








        <Text style={styles.sectionTitle}>
          Select <Text style={{ fontWeight: 'bold' }}>Add-ons</Text>
        </Text>

        {rawAddons.map(dose => (
          <Addon
            key={dose.id}
            doseData={withAddonsFields(dose)}
            isSelected={selectedId === dose.id}
            qty={qty}
            allow={12}                       // maximum units of a single dose
            totalSelectedQty={totalSelectedQty}
            onAdd={() => addDose(dose.id)}
            onIncrement={incrementDose}
            onDecrement={decrementDose}
          />
        ))}
      </ScrollView>

      {/* Footer bar */}
      <View style={styles.footerBar}>
        <View>
          <Text style={styles.footerTitle}>Mounjaro (Tirzepatide)</Text>
          <Text style={styles.footerPriceLabel}>
            Order total: <Text style={styles.footerPrice}>{orderTotal()}</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={styles.proceedBtn}
          disabled={!selectedId}
          onPress={() => navigation.navigate('checkout')}
        >
          <Text style={styles.proceedText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ───────────────────────────── Styles ─────────────────────────────
const styles = StyleSheet.create({
  container: { padding: 30, paddingBottom: 120, backgroundColor: '#F2EDF9' },
  image: { width: '100%', height: 180, resizeMode: 'contain', marginBottom: 10 },
  title: { fontWeight: 'bold', fontSize: 18, color: '#4B0082' },
  badge: { backgroundColor: '#C9B2ED', padding: 4, borderRadius: 4, marginTop: 5, fontSize: 12 },
  price: { marginVertical: 8, fontWeight: '600' },
  sectionTitle: { marginVertical: 14, fontSize: 16 },
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
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
  },
  footerTitle: { fontWeight: 'bold', fontSize: 14, color: '#000' },
  footerPriceLabel: { fontSize: 12, color: '#444' },
  footerPrice: { fontWeight: 'bold', color: '#000' },
  proceedBtn: {
    backgroundColor: '#4B0082',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    opacity: 1,
  },
  proceedText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  wraper: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
  }
});
