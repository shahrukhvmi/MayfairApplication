import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import useVariationStore from '../store/useVariationStore';
import { useFocusEffect } from '@react-navigation/native';

// Helper to decode HTML entities
const decodeHtmlEntities = text =>
  text
    .replace(/&nbsp;|&nbps;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

// Helper to extract each <li> and clean it
const extractListItems = html => {
  const liRegex = /<li[^>]*>(.*?)<\/li>/g;
  const items = [];
  let match;
  while ((match = liRegex.exec(html)) !== null) {
    const raw = match[1];
    const cleaned = decodeHtmlEntities(raw.replace(/<[^>]+>/g, '').trim());
    if (cleaned) items.push(cleaned);
  }
  return items;
};

const ProductConsent = ({ onConsentChange, setIsConcentCheck }) => {
  const [isValid, setIsValid] = useState();
  const [isChecked, setIsChecked] = useState(false);

  const { variation } = useVariationStore();

  useFocusEffect(
    React.useCallback(() => {
      setIsValid(isChecked);

      console.log(isValid, 'isValid');
      setIsConcentCheck(isChecked);
    }, [isChecked]));

  return (
    <View style={styles.card}>
      <Text style={styles.subHeading}>Treatment Consent</Text>
      <Text style={styles.paragraphExplain}>
        Please review the important information below regarding your treatment:
      </Text>

      {variation?.terms_and_conditon ? (
        <View style={styles.bulletList}>
          {extractListItems(variation.terms_and_conditon).map((item, index) => (
            <View key={`bullet-${index}`} style={styles.bulletItem}>
              <Text style={styles.bulletIcon}>{'\u2022'}</Text>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => {
          const checked = !isChecked;
          setIsChecked(checked);
          onConsentChange?.(checked);
        }}>
        {isChecked ? (
          <MaterialIcons name="check-box" size={30} color="#47317c" />
        ) : (
          <MaterialIcons
            name="check-box-outline-blank"
            size={30}
            color="#47317c"
          />
        )}
        <Text style={{ marginLeft: 10, fontSize: 14, paddingRight: 10 }}>
          I confirm that I have read, understood and accepted all of the above
          information.
        </Text>
      </TouchableOpacity>

      {!isChecked && (
        <Text style={{ fontSize: 12, color: 'red', marginTop: 8 }}>
          You must accept the terms to continue.
        </Text>
      )}
    </View>
  );
};

export default ProductConsent;

const styles = StyleSheet.create({
  subHeading: {
    textAlign: 'left',
    color: '#1A1A1A',
    marginBottom: 16,
    fontSize: 20,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  paragraphExplain: {
    marginBottom: 10,
    fontSize: 14,
    color: '#444',
  },
  paragraph: {
    fontSize: 14,
    color: '#444',
    lineHeight: 25,
    marginBottom: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  bulletList: {
    marginTop: 10,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletIcon: {
    fontSize: 16,
    color: '#444',
    marginRight: 6,
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
  },
});
