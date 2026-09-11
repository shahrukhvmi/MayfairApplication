// Dose.js
import React, {useState} from 'react';
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
import Feather from 'react-native-vector-icons/Feather';

import useCartStore from '../store/useCartStore';
import {getNotified} from '../api/GetNotified';
import {Fonts} from '../utils/fonts';

const PRIMARY = '#47317c';

const Dose = ({
  doseData,
  onAdd,
  onIncrement,
  onDecrement,
  isSelected,
  qty,
  allow = 100,
  totalSelectedQty,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {removeItemCompletely} = useCartStore();

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
      Toast.show({
        type: 'error',
        text1: 'Limit Exceeded',
        text2: `You can only select up to ${allowed} units.`,
      });
      return;
    }

    if (doseData.qty >= doseData.stock.quantity) {
      Toast.show({
        type: 'error',
        text1: 'Out of Stock',
        text2: `Only ${doseData.stock.quantity} units available.`,
      });
      return;
    }

    if (qty >= allowed) {
      Toast.show({
        type: 'error',
        text1: 'Limit Exceeded',
        text2: `Max ${allowed} units allowed.`,
      });
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
        Toast.show({
          type: 'success',
          text1: 'Notified',
          text2: response?.data?.message,
        });
      } else {
        Toast.show({type: 'error', text1: 'Error', text2: response?.errors});
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2:
          err?.response?.data?.errors?.Notification ||
          'Something went wrong.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabledLook = isOutOfStock || (!isSelected && isAllowExceeded);

  return (
    <>
      <View style={styles.wrapper}>
        {doseStatus === 0 && (
          <TouchableOpacity
            style={styles.notifyBtn}
            onPress={handleNotifiedClick}
            activeOpacity={0.8}>
            {isLoading ? (
              <>
                <ActivityIndicator size={12} color="#059669" />
                <Text style={styles.notifyTxt}>Loading…</Text>
              </>
            ) : (
              <>
                <Feather name="info" size={12} color="#059669" />
                <Text style={styles.notifyTxt}>Get Notified</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {!isOutOfStock && !isSelected && isAllowExceeded && (
          <View style={styles.limitBadge}>
            <Text style={styles.limitBadgeText}>Selection limit reached</Text>
          </View>
        )}

        {isOutOfStock && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockBadgeText}>Out of stock</Text>
          </View>
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
          ]}>
          <View style={[styles.left, isDisabledLook && styles.dimmed]}>
            <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
              {isSelected && <Feather name="check" size={11} color="#fff" />}
            </View>

            <View style={{flex: 1}}>
              <Text style={styles.productName}>{doseData?.product_name}</Text>
              <Text
                style={[styles.doseName, isSelected && styles.doseNameActive]}>
                {doseData.name}
              </Text>
              {doseData?.expiry && (
                <Text style={styles.expiry}>
                  Expiry: {moment(doseData.expiry).format('DD/MM/YYYY')}
                </Text>
              )}
            </View>
          </View>

          <View style={[styles.right, isDisabledLook && styles.dimmed]}>
            <Text style={[styles.price, isSelected && styles.priceSelected]}>
              £{parseFloat(doseData.price).toFixed(2)}
            </Text>

            {isSelected && (
              <View style={styles.actionRow}>
                <View style={styles.qtyBox}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={handleDecrement}>
                    <Feather name="minus" size={11} color="#475569" />
                  </TouchableOpacity>
                  <Text style={styles.qtyTxt}>{qty}</Text>
                  <TouchableOpacity
                    style={[
                      styles.qtyBtn,
                      qty >= allowed && styles.qtyBtnDisabled,
                    ]}
                    disabled={qty >= allowed}
                    onPress={handleIncrement}>
                    <Feather name="plus" size={11} color="#475569" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => setShowModal(true)}>
                  <Feather name="trash-2" size={14} color="#ef4444" />
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
        onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Remove Dose?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to remove this dose from your selection?
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={[styles.modalBtn, styles.cancelBtn]}>
                <Text style={styles.cancelTxt}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDelete}
                style={[styles.modalBtn, styles.deleteBtnModal]}>
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
    marginTop: 16,
    position: 'relative',
  },
  notifyBtn: {
    position: 'absolute',
    right: 10,
    top: -12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 20,
  },
  notifyTxt: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: '#059669',
  },
  limitBadge: {
    position: 'absolute',
    left: 12,
    top: -12,
    zIndex: 20,
    borderWidth: 1,
    borderColor: '#fde68a',
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  limitBadgeText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: '#b45309',
  },
  outOfStockBadge: {
    position: 'absolute',
    left: 12,
    top: -12,
    zIndex: 20,
    borderWidth: 1,
    borderColor: '#fecdd3',
    backgroundColor: '#fff1f2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  outOfStockBadgeText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: '#be123c',
  },

  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  cardDefault: {borderColor: '#e2e8f0'},
  cardSelected: {
    borderColor: PRIMARY,
    backgroundColor: 'rgba(71, 49, 124, 0.04)',
  },
  cardOut: {borderColor: '#e2e8f0', backgroundColor: '#f8fafc'},
  cardDisabled: {borderColor: '#e2e8f0', backgroundColor: '#f8fafc'},
  dimmed: {opacity: 0.55},

  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY,
  },
  productName: {
    textTransform: 'capitalize',
    fontSize: 14.5,
    fontFamily: Fonts.semiBold,
    color: '#0f172a',
  },
  doseName: {
    fontSize: 13,
    color: '#64748b',
    fontFamily: Fonts.medium,
    marginTop: 2,
  },
  doseNameActive: {
    color: PRIMARY,
  },
  expiry: {
    fontSize: 11.5,
    fontFamily: Fonts.regular,
    color: '#94a3b8',
    marginTop: 3,
  },
  right: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: '#334155',
  },
  priceSelected: {
    color: PRIMARY,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnDisabled: {opacity: 0.4},
  qtyTxt: {
    width: 22,
    textAlign: 'center',
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: '#0f172a',
  },
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  modalBox: {
    backgroundColor: '#fff',
    width: '84%',
    padding: 22,
    borderRadius: 18,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: Fonts.semiBold,
    color: '#0f172a',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 13.5,
    fontFamily: Fonts.regular,
    color: '#475569',
    marginBottom: 20,
    lineHeight: 19,
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
    backgroundColor: '#f1f5f9',
  },
  deleteBtnModal: {
    backgroundColor: '#dc2626',
  },
  cancelTxt: {
    color: '#334155',
    fontFamily: Fonts.semiBold,
    fontSize: 13,
  },
  deleteTxt: {
    color: '#fff',
    fontFamily: Fonts.semiBold,
    fontSize: 13,
  },
});

export default Dose;
