// Addon.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
} from 'react-native';
import Toast from 'react-native-toast-message';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import useCartStore from '../store/useCartStore';

const Addon = ({
  doseData,
  onAdd,
  onIncrement,
  onDecrement,
  isSelected,
  qty,
  allow,
  totalSelectedQty,
  onUnselect,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { removeItemCompletely } = useCartStore();

  const allowed          = parseInt(allow || 100, 10);
  const doseStatus       = doseData?.stock?.status;
  const isOutOfStock     = doseStatus === 0 || doseData?.stock?.quantity === 0;
  const isAllowExceeded  = totalSelectedQty() >= allowed;

  /* ──── handlers ──── */
  const handleAdd        = () => !isSelected && onAdd();
  const handleIncrement  = () => {
    const total = totalSelectedQty() + 1;
    if (total > allowed)
      return Toast.show({type:'error',text1:`You can only select up to ${allowed} units.`});
    if (doseData.qty >= doseData.stock.quantity)
      return Toast.show({type:'error',text1:`Only ${doseData.stock.quantity} units available.`});
    if (qty >= allowed)
      return Toast.show({type:'error',text1:`Max ${allowed} units for this option.`});
    onIncrement(doseData.id);
  };
  const handleDecrement  = () => (qty > 1 ? onDecrement() : setShowModal(true));
  const handleDelete     = () => {
    setShowModal(false);
    removeItemCompletely(doseData.id, 'doses');
    onUnselect?.(doseData.id);
  };

  /* ──── ui ──── */
  return (
    <>
      {/* card wrapper */}
      <TouchableOpacity
        disabled={isOutOfStock || isAllowExceeded}
        activeOpacity={0.9}
        onPress={handleAdd}
        style={[
          styles.card,
          isOutOfStock ? styles.cardOut
          : isSelected   ? styles.cardSelected
          : isAllowExceeded ? styles.cardDisabled
          : styles.cardDefault,
        ]}
      >
        {/* badge + tick */}
        {isOutOfStock && <Text style={styles.stockBadge}>Out&nbsp;of&nbsp;stock</Text>}
        {isSelected   && (
          <View style={styles.tick}>
            <FontAwesome5 name="check" size={10} color="#fff" />
          </View>
        )}

        {/* top row */}
        <View style={styles.topRow}>
          <View style={styles.left}>
            <FontAwesome5
              name={isSelected ? 'dot-circle' : 'circle'}
              size={14}
              color={isSelected ? '#7c3aed' : '#374151'}
              style={{marginTop:2}}
            />
            <Text style={styles.productName}>{doseData.product_name}</Text>
          </View>

          <Text style={[styles.price, isSelected && styles.priceSelected]}>
            £{parseFloat(doseData.price).toFixed(2)}
          </Text>
        </View>

        {/* bottom row only when selected */}
        {isSelected && (
          <View style={styles.bottomRow}>
            <View style={styles.qtyBox}>
              <TouchableOpacity style={styles.qtyBtn} onPress={handleDecrement}>
                <FontAwesome5 name="minus" size={10} />
              </TouchableOpacity>
              <Text style={styles.qtyTxt}>{qty}</Text>
              <TouchableOpacity
                style={[styles.qtyBtn, qty >= allowed && styles.qtyBtnDisabled]}
                disabled={qty >= allowed}
                onPress={handleIncrement}
              >
                <FontAwesome5 name="plus" size={10} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setShowModal(true)} style={styles.deleteBtn}>
              <MaterialIcons name="delete" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>

      {/* delete-confirm modal */}
      <Modal transparent animationType="fade" visible={showModal} onRequestClose={()=>setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Remove Add-on?</Text>
            <Text style={styles.modalMessage}>Are you sure you want to remove this add-on?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn,styles.cancelBtn]} onPress={()=>setShowModal(false)}>
                <Text style={styles.cancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn,styles.deleteBtnModal]} onPress={handleDelete}>
                <Text style={styles.deleteTxt}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

/* ──── styles ──── */
const styles = StyleSheet.create({
  card:{padding:16,borderRadius:14,borderWidth:1.5,backgroundColor:'#fff',marginBottom:14},
  cardDefault:{borderColor:'#ccc',shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.06,shadowRadius:4,elevation:2},
  cardSelected:{borderColor:'#7c3aed',borderWidth:1.8,shadowColor:'#7c3aed',shadowOffset:{width:0,height:2},shadowOpacity:0.08,shadowRadius:6,elevation:3},
  cardOut:{borderColor:'#e5e7eb',backgroundColor:'#f9fafb',opacity:0.6},
  cardDisabled:{borderColor:'#ddd',opacity:0.5},

  topRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  left:{flexDirection:'row',alignItems:'center',gap:8,flexShrink:1},
  productName:{fontWeight:'600',fontSize:15,color:'#1f2937',flexShrink:1},
  price:{fontWeight:'600',fontSize:16,color:'#374151'},
  priceSelected:{color:'#7c3aed',fontWeight:'bold'},

  bottomRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:10},
  qtyBox:{flexDirection:'row',alignItems:'center',backgroundColor:'#f3f4f6',borderRadius:999,paddingHorizontal:10,paddingVertical:4},
  qtyBtn:{backgroundColor:'#e5e7eb',padding:6,borderRadius:999},
  qtyBtnDisabled:{opacity:0.4},
  qtyTxt:{marginHorizontal:10,fontSize:14,fontWeight:'700',color:'#111827'},
  deleteBtn:{backgroundColor:'#ef4444',padding:9,borderRadius:999},

  stockBadge:{position:'absolute',top:-10,left:16,backgroundColor:'#9333ea',color:'#fff',paddingHorizontal:8,paddingVertical:2,fontSize:10,fontWeight:'600',borderRadius:8},
  tick:{position:'absolute',top:-12,right:-12,backgroundColor:'#6d28d9',padding:8,borderRadius:999,borderWidth:2,borderColor:'#fff',elevation:4},

  /* modal */
  modalOverlay:{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(0,0,0,0.45)'},
  modalBox:{backgroundColor:'#fff',width:'84%',padding:22,borderRadius:16},
  modalTitle:{fontSize:18,fontWeight:'700',marginBottom:6,color:'#1e1e1e'},
  modalMessage:{fontSize:14,color:'#374151',marginBottom:18},
  modalActions:{flexDirection:'row',justifyContent:'flex-end',gap:10},
  modalBtn:{paddingVertical:10,paddingHorizontal:18,borderRadius:10},
  cancelBtn:{backgroundColor:'#f3f4f6'},
  deleteBtnModal:{backgroundColor:'#dc2626'},
  cancelTxt:{fontWeight:'600',color:'#1f2937'},
  deleteTxt:{fontWeight:'600',color:'#fff'},
});

export default Addon;
