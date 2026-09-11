import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import useVariationStore from '../store/useVariationStore';
import {useFocusEffect} from '@react-navigation/native';
import {Fonts} from '../utils/fonts';

const PRIMARY = '#47317c';

const decodeHtmlEntities = text =>
  text
    .replace(/&nbsp;|&nbps;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

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

const ProductConsent = ({setIsConcentCheck}) => {
  const [isChecked, setIsChecked] = useState(false);
  const {variation} = useVariationStore();

  useFocusEffect(
    React.useCallback(() => {
      setIsConcentCheck(isChecked);
    }, [isChecked]),
  );

  const listItems = variation?.terms_and_conditon
    ? extractListItems(variation.terms_and_conditon)
    : [];

  return (
    <View>
      <Text style={styles.paragraphExplain}>
        Please review the important information below regarding your
        treatment:
      </Text>

      {listItems.length > 0 && (
        <View style={styles.bulletList}>
          {listItems.map((item, index) => (
            <View key={`bullet-${index}`} style={styles.bulletItem}>
              <Text style={styles.bulletIcon}>{'•'}</Text>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.checkboxRow}
        activeOpacity={0.8}
        onPress={() => setIsChecked(!isChecked)}>
        <View style={[styles.checkbox, isChecked && styles.checkboxActive]}>
          {isChecked && <Feather name="check" size={12} color="#fff" />}
        </View>
        <Text style={styles.checkboxLabel}>
          I confirm that I have read, understood and accepted all of the
          above information.
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProductConsent;

const styles = StyleSheet.create({
  paragraphExplain: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: '#64748b',
    lineHeight: 19,
    marginBottom: 14,
  },
  bulletList: {
    marginBottom: 16,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bulletIcon: {
    fontSize: 15,
    color: PRIMARY,
    marginRight: 8,
    lineHeight: 19,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: '#475569',
    lineHeight: 19,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  checkboxActive: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: '#1e293b',
    lineHeight: 19,
  },
});
