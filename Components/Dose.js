// Dose.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Toast from 'react-native-toast-message';
import moment from 'moment';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import useCartStore from '../store/useCartStore';
import { getNotified } from '../api/GetNotified';

const Dose = ({ doseData, onAdd, onIncrement, onDecrement, isSelected, qty, allow = 100, totalSelectedQty }) => {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { removeItemCompletely } = useCartStore();

  const allowed = parseInt(allow);
  const doseStatus = doseData?.stock?.status;
  const isOutOfStock = doseStatus === 0 || doseData?.stock?.quantity === 0;
  const isAllowExceeded = totalSelectedQty >= allowed;

  const handleAdd = () => {
    if (!isSelected && !isOutOfStock && !isAllowExceeded) {
      onAdd();
    }
  };

  const handleIncrement = () => {
    const totalQty = totalSelectedQty + 1;

    if (totalQty > allowed) {
      Toast.show({ type: 'error', text1: 'Limit Exceeded', text2: `You can only select up to ${allowed} units.` });
      return;
    }

    if (doseData.qty >= doseData.stock.quantity) {
      Toast.show({ type: 'error', text1: 'Out of Stock', text2: `Only ${doseData.stock.quantity} units available.` });
      return;
    }

    if (qty >= allowed) {
      Toast.show({ type: 'error', text1: 'Limit Exceeded', text2: `Max ${allowed} units allowed.` });
      return;
    }

    onIncrement(doseData?.id);
  };

  const handleDecrement = () => {
    if (qty > 1) {
      onDecrement();
    } else {
      setShowModal(true);
    }
  };

  const handleDelete = () => {
    setShowModal(false);
    removeItemCompletely(doseData?.id, 'doses');
  };

  const handleNotifiedClick = async () => {
    setIsLoading(true);
    try {
      const response = await getNotified({
        eid: doseData.pivot?.eid,
        pid: doseData.pivot?.pid,
      });

      if (response?.data?.status === true) {
        Toast.show({ type: 'success', text1: 'Notified', text2: response?.data?.message });
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: response?.errors });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: err?.response?.data?.errors?.Notification || 'Something went wrong.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <View style={styles.wrapper}>
        {doseStatus === 0 && (
          <TouchableOpacity style={styles.notifyBtn} onPress={handleNotifiedClick}>
            {isLoading ? (
              <>
                <ActivityIndicator size={12} />
                <Text style={styles.notifyTxt}>Loading…</Text>
              </>
            ) : (
              <>
                <FontAwesome5 name="info-circle" size={12} color="#16a34a" />
                <Text style={styles.notifyTxt}>Get Notified</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          activeOpacity={0.9}
          disabled={isOutOfStock || isAllowExceeded}
          onPress={handleAdd}
          style={[
            styles.card,
            isOutOfStock
              ? styles.cardOut
              : isSelected
              ? styles.cardSelected
              : isAllowExceeded
              ? styles.cardDisabled
              : styles.cardDefault,
          ]}
        >
          {isOutOfStock && <Text style={styles.stockBadge}>Out of stock</Text>}

          {isSelected && (
            <View style={styles.tick}>
              <FontAwesome5 name="check" size={10} color="#fff" />
            </View>
          )}

          <View style={styles.left}>
            <FontAwesome5
              name={isSelected ? 'dot-circle' : 'circle'}
              size={14}
              color={isSelected ? '#7c3aed' : '#374151'}
              style={styles.radio}
            />

            <View>
              <Text style={styles.productName}>{doseData?.product_name}</Text>
              <Text style={styles.doseName}>{doseData.name}</Text>
              {doseData?.expiry && (
                <Text style={styles.expiry}>
                  Expiry: {moment(doseData.expiry).format('DD/MM/YYYY')}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.right}>
            <Text style={[styles.price, isSelected && styles.priceSelected]}>
              £{parseFloat(doseData.price).toFixed(2)}
            </Text>

            {isSelected && (
              <View style={styles.actionRow}>
                <View style={styles.qtyBox}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={handleDecrement}>
                    <FontAwesome5 name="minus" size={12} />
                  </TouchableOpacity>
                  <Text style={styles.qtyTxt}>{qty}</Text>
                  <TouchableOpacity
                    style={[styles.qtyBtn, qty >= allowed && styles.qtyBtnDisabled]}
                    disabled={qty >= allowed}
                    onPress={handleIncrement}
                  >
                    <FontAwesome5 name="plus" size={12} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => setShowModal(true)} >
                  <MaterialIcons name="delete" size={18} color="#fff" style={styles.deleteBtn} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Remove Dose?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to remove this dose from your selection?
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={[styles.modalBtn, styles.cancelBtn]}
              >
                <Text style={styles.cancelTxt}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDelete}
                style={[styles.modalBtn, styles.deleteBtnModal]}
              >
                <Text style={styles.deleteTxt}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 14,
    paddingHorizontal: 6,
  },
  notifyBtn: {
    position: 'absolute',
    right: 10,
    top: -8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0fce5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    zIndex: 20,
  },
  notifyTxt: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '600',
    color: '#15803d',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1.5,
    borderRadius: 14,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDefault: { borderColor: '#ccc' },
  cardSelected: {
    borderColor: '#7c3aed',
    backgroundColor: '#ffffff',
    borderWidth: 1.8,
    borderRadius: 16,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardOut: { borderColor: '#e5e7eb', backgroundColor: '#F8F9FA', opacity: 0.5 },
  cardDisabled: { borderColor: '#ddd', opacity: 0.5 },
  stockBadge: {
    position: 'absolute',
    top: -8,
    left: 16,
    backgroundColor: '#9333ea',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 10,
    fontWeight: '600',
    borderRadius: 5,
    overflow: 'hidden',
  },
  tick: {
    position: 'absolute',
    top: -12,
    right: -12,
    backgroundColor: '#6D28D9',
    padding: 8,
    borderRadius: 999,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  radio: { marginTop: 4 },
  productName: {
    textTransform: 'capitalize',
    fontWeight: 'bold',
    fontSize: 15,
    color: '#1f2937',
  },
  doseName: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '600',
    marginTop: 2,
  },
  expiry: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  price: {
    fontWeight: '600',
    fontSize: 16,
    color: '#374151',
  },
  priceSelected: {
    color: '#6D28D9',
    fontWeight: 'bold',
    fontSize: 17,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  qtyBtn: {
    backgroundColor: '#e5e7eb',
    padding: 6,
    borderRadius: 999,
  },
  qtyBtnDisabled: { opacity: 0.4 },
  qtyTxt: {
    marginHorizontal: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  deleteBtn: {
    color: '#ef4444',
    fontSize:22,
    // padding: 8,
    // borderRadius: 999,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalBox: {
    backgroundColor: '#fff',
    width: '84%',
    padding: 22,
    borderRadius: 16,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e1e1e',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginLeft: 10,
  },
  cancelBtn: {
    backgroundColor: '#f3f4f6',
  },
  deleteBtnModal: {
    backgroundColor: '#dc2626',
  },
  cancelTxt: {
    color: '#111827',
    fontWeight: '600',
  },
  deleteTxt: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default Dose;
