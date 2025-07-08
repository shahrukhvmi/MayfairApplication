import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Picker} from '@react-native-picker/picker';
import {useMutation} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import useOrderId from '../store/useOrderIdStore';
import usePaginationStore from '../store/pagination';
import {useStatusStore} from '../store/useStatusStore';
import GetOrdersApi from '../api/getOrders';
import {useNavigation} from '@react-navigation/native';

const OrdersScreen = () => {
  /* ───────────────── state ───────────────── */
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  const {currentPage, setCurrentPage} = usePaginationStore();
  const {status, setStatus} = useStatusStore();
  const {setOrderId} = useOrderId();

  const navigation = useNavigation();

  /* ─────────────── fetch orders ────────────── */
  const getOrdersMutation = useMutation(GetOrdersApi, {
    onSuccess: res => {
      setData(res?.data?.myorders);
      setIsLoading(false);
    },
    onError: () => {
      Toast.show({type: 'error', text1: 'Something went wrong'});
      setIsLoading(false);
    },
  });

  useEffect(() => {
    getOrdersMutation.mutate({page: currentPage});
  }, [currentPage]);

  /* ──────────────── filters ───────────────── */
  const filteredOrders = data?.allorders?.filter(order => {
    const q = searchValue.toLowerCase();
    const matchesSearch =
      order.order_id.toString().includes(q) ||
      order.treatment?.toLowerCase().includes(q) ||
      order.items.some(i => i.product.toLowerCase().includes(q));

    const matchesStatus =
      status === 'all' || order.status.toLowerCase() === status.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  /* ──────────────── helpers ───────────────── */
  const pillStyle = s => {
    switch (s.toLowerCase()) {
      case 'processing':
        return [styles.pill, styles.processing];
      case 'incomplete':
        return [styles.pill, styles.incomplete];
      case 'approved':
        return [styles.pill, styles.approved];
      case 'cancelled':
        return [styles.pill, styles.cancelled];
      default:
        return [styles.pill, styles.defaultPill];
    }
  };

  //Send Order ID
  const handleSendId = id => {
    setOrderId(id);
    console.log(id, 'ID');
    navigation.navigate('order-detail');
  };

  /* ─────────────── render row ─────────────── */
  const renderRow = ({item}) => {
    const treatments = [...new Set(item.items.map(i => i.product))].join('\n');

    const grouped = Object.values(
      item.items.reduce((acc, cur) => {
        const name =
          cur.name === '' && cur.label === 'Pack of 5 Needles'
            ? 'Pack of 5 Needles'
            : cur.name;
        acc[name] = acc[name] || {name, qty: 0};
        acc[name].qty += cur.quantity;
        return acc;
      }, {}),
    );

    return (
      <View style={styles.row}>
        {/* ───────────── cells ───────────── */}
        <Text style={[styles.cell, styles.id]} numberOfLines={1}>
          {item.order_id}
        </Text>
        <Text style={[styles.cell, styles.date]} numberOfLines={1}>
          {item.created_at}
        </Text>
        <Text style={[styles.cell, styles.treat]} numberOfLines={3}>
          {treatments}
        </Text>
        <View style={[styles.cell, styles.items]}>
          {grouped.map(g => (
            <Text key={g.name} numberOfLines={1}>
              • {g.name} × {g.qty}
            </Text>
          ))}
        </View>
        <View style={[styles.cell, styles.stat]}>
          <Text style={pillStyle(item.status)}>{item.status}</Text>
        </View>
        <Text style={[styles.cell, styles.total]} numberOfLines={1}>
          £{item.total_price}
        </Text>

        <TouchableOpacity
          style={[styles.cell, styles.eye]}
          onPress={() => handleSendId(item.id)}>
          <Ionicons name="eye" size={20} color="#47317c" />
        </TouchableOpacity>
      </View>
    );
  };

  /* ───────────────── view ───────────────── */
  return (
    <View style={styles.container}>
      {/* ───── Heading ───── */}
      <Text style={styles.heading}>My Orders</Text>
      <Text style={styles.sub}>View your order history</Text>

      {/* ───── Search + status filter ───── */}
      <View style={styles.topRow}>
        <View style={styles.searchWrap}>
          <Ionicons
            name="search"
            size={18}
            color="#888"
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search by Order ID"
            value={searchValue}
            onChangeText={setSearchValue}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.pickerWrap}>
          <Text style={styles.pickerLabel}>Sort by status</Text>
          <Picker
            selectedValue={status}
            onValueChange={setStatus}
            style={styles.picker}
            mode="dropdown">
            <Picker.Item label="All" value="all" />
            <Picker.Item label="Processing" value="processing" />
            <Picker.Item label="Incomplete" value="incomplete" />
            <Picker.Item label="Approved" value="approved" />
            <Picker.Item label="Cancelled" value="cancelled" />
          </Picker>
        </View>
      </View>

      {/* ───── blue note banner ───── */}
      <View style={styles.banner}>
        <Ionicons name="bulb-outline" size={16} color="#2563eb" />
        <Text style={styles.bannerText}>
          Changes to your shipping address will only apply to future orders and
          will not affect previous ones
        </Text>
      </View>

      {/* ───── column headers ───── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{minWidth: 670}}>
          {' '}
          {/* 670 = sum of COL_WIDTH values */}
          <View style={styles.headerRow}>
            <Text style={[styles.hCell, styles.id]}>ORDER ID</Text>
            <Text style={[styles.hCell, styles.date]}>ORDER DATE</Text>
            <Text style={[styles.hCell, styles.treat]}>TREATMENT</Text>
            <Text style={[styles.hCell, styles.items]}>ITEMS</Text>
            <Text style={[styles.hCell, styles.stat]}>STATUS</Text>
            <Text style={[styles.hCell, styles.total]}>TOTAL</Text>
            <Text style={[styles.hCell, styles.eye]} />
          </View>
          {isLoading ? (
            <ActivityIndicator style={{marginTop: 30}} size="large" />
          ) : (
            <FlatList
              data={filteredOrders}
              keyExtractor={i => i.order_id.toString()}
              renderItem={renderRow}
              contentContainerStyle={{paddingBottom: 40}}
              // Remove scrollEnabled={false} to allow vertical scroll
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

/* ────────────────── styles ────────────────── */
const COL_WIDTH = {
  id: 70,
  date: 90,
  treat: 140,
  items: 160,
  stat: 90,
  total: 80,
  eye: 40,
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff', padding: 16},
  heading: {fontSize: 24, fontWeight: 'bold', color: '#1f2937'},
  sub: {color: '#4b5563', marginBottom: 12},

  /* search + picker */
  topRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 12},
  searchWrap: {flex: 1, position: 'relative', marginRight: 12},
  searchIcon: {position: 'absolute', left: 10, top: 12},
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 8,
    paddingLeft: 34,
    paddingRight: 10,
    fontSize: 14,
    color: '#111827',
  },
  pickerWrap: {width: 140},
  pickerLabel: {fontSize: 12, color: '#374151', marginBottom: 2},
  picker: {borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8},

  /* note banner */
  banner: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
    padding: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  bannerText: {marginLeft: 6, fontSize: 13, color: '#2563eb', flex: 1},

  /* header row */
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  hCell: {fontSize: 11, fontWeight: '600', color: '#6b7280'},

  /* data rows */
  row: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  cell: {fontSize: 13, color: '#374151'},

  /* column widths */
  id: {width: COL_WIDTH.id},
  date: {width: COL_WIDTH.date},
  treat: {width: COL_WIDTH.treat},
  items: {width: COL_WIDTH.items},
  stat: {width: COL_WIDTH.stat, justifyContent: 'center'},
  total: {width: COL_WIDTH.total},
  eye: {width: COL_WIDTH.eye, alignItems: 'center'},

  /* status pill */
  pill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    fontSize: 11,
    overflow: 'hidden',
    textAlign: 'center',
  },
  processing: {backgroundColor: '#fef3c7', color: '#d97706'},
  incomplete: {backgroundColor: '#ffedd5', color: '#ea580c'},
  approved: {backgroundColor: '#d1fae5', color: '#059669'},
  cancelled: {backgroundColor: '#fee2e2', color: '#b91c1c'},
  defaultPill: {backgroundColor: '#e5e7eb', color: '#374151'},
});

export default OrdersScreen;
