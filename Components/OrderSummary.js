import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import { useNavigation } from '@react-navigation/native';
import useCartStore from '../store/useCartStore';

const OrderSummary = () => {
  // Example data (replace with your actual data/props)
  const navigation = useNavigation();


  /* _____________Zustannd_________________*/

  const { items, totalAmount, setCheckOut, setOrderId } = useCartStore();


  const finalTotal = totalAmount + 10; // Example of additional shipping or VAT
  const shipping = { country_name: 'UK', country_price: 5.0 };

  const handleEdit = () => {
    navigation.navigate('dose-selection');
  };

  const handleRemoveCoupon = () => {
    // Remove coupon logic
  };

  const handleApplyCoupon = () => {
    // Apply coupon logic
  };

  // Combine doses and addons into one array with a type
  // const items = [
  //   ...doses.map(item => ({ ...item, type: 'dose' })),
  //   ...addons.map(item => ({ ...item, type: 'addon' })),
  // ];

  console.log(items, "itemsitems")

  const renderItem = (item, idx) => {
    if (item.type === 'dose') {
      return (
        <React.Fragment key={idx}>
          <View style={styles.itemContainer}>
            <View style={styles.itemDetails}>
              <Text style={styles.itemTitle}>{item.product}</Text>
              <Text style={styles.itemQuantity}>Quantity: x{item.qty}</Text>
            </View>
            <Text style={styles.itemPrice}>£{item.price.toFixed(2)}</Text>
          </View>
          {item.product === 'Mounjaro (Tirzepatide)' && (
            <View style={[styles.itemContainer, styles.mounjaroContainer]}>
              <View style={styles.itemDetails}>
                <Text style={styles.itemTitle}>Pack of 5 Needle</Text>
                <Text style={styles.itemQuantity}>Quantity: x{item.qty}</Text>
              </View>
              <Text style={styles.itemPrice}>£0.00</Text>
            </View>
          )}
        </React.Fragment>
      );
    }
    // Addon
    return (
      <View style={styles.itemContainer} key={idx}>
        <View style={styles.itemDetails}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemQuantity}>Quantity: x{item.qty}</Text>
        </View>
        <Text style={styles.itemPrice}>£{item.price.toFixed(2)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.editText}>Edit order</Text>
          <Feather name="edit" size={24} color="#47317c" />
        </TouchableOpacity>
      </View>
      {items.doses?.map(renderItem)}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>£{totalAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>VAT</Text>
          <Text style={styles.summaryValue}>£0.00</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Shipping ({shipping.country_name})
          </Text>
          <Text style={styles.summaryValue}>£{shipping.country_price}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryTitle}>Total</Text>
          <Text style={styles.summaryTitle}>£{finalTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.separator} />
        {/* Discount Section */}
        {/* <View style={styles.discountSection}>
          <View style={styles.discountDetails}>
            <View>
              <Text style={styles.discountText}>Coupon Code Applied</Text>
              <Text style={styles.discountAmount}>- £5.00 (10% off)</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleRemoveCoupon}>
            <Entypo name="cross" size={24} />
          </TouchableOpacity>
        </View> */}
        {/* Apply Coupon Section */}
        <View style={styles.applyCouponContainer}>
          <TextInput
            style={styles.couponInput}
            placeholder="Enter discount code"
          />
          <TouchableOpacity
            style={styles.applyCouponButton}
            onPress={handleApplyCoupon}>
            <Text style={styles.applyCouponButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editText: {
    marginRight: 8,
    fontSize: 14,
    color: '#47317c',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F2EEFF',
    marginBottom: 8,
    borderRadius: 8,
  },
  mounjaroContainer: {
    backgroundColor: '#ececec',
  },
  itemDetails: {
    flexDirection: 'column',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f1f1f',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6b6b6b',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  summaryContainer: {
    marginTop: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#000',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  discountSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1f9e8c',
    borderRadius: 8,
    marginTop: 16,
  },
  discountDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  discountAmount: {
    color: '#fff',
    fontSize: 14,
  },
  removeButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyCouponContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  couponInput: {
    flex: 1,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  applyCouponButton: {
    padding: 8,
    backgroundColor: '#4B0082',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  applyCouponButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  paymentButtonContainer: {
    marginTop: 16,
  },
  paymentButton: {
    padding: 16,
    backgroundColor: '#1f9e8c',
    borderRadius: 8,
    alignItems: 'center',
  },
  paymentButtonText: {
    fontSize: 18,
    color: '#fff',
  },
});

export default OrderSummary;
