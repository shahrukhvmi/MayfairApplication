import React, { useEffect, useState } from 'react';
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
import { Picker } from '@react-native-picker/picker';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import useOrderId from '../store/useOrderIdStore';
import usePaginationStore from '../store/pagination';
import { useStatusStore } from '../store/useStatusStore';
import GetOrdersApi from '../api/getOrders';
import { useNavigation } from '@react-navigation/native';
import Header from '../Layout/header';

const OrdersScreen = () => {
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  const { currentPage, setCurrentPage } = usePaginationStore();
  const { status, setStatus } = useStatusStore();
  const { setOrderId } = useOrderId();

  const navigation = useNavigation();

  const getOrdersMutation = useMutation(GetOrdersApi, {
    onSuccess: res => {
      setData(res?.data?.myorders);
      setIsLoading(false);
    },
    onError: () => {
      Toast.show({ type: 'error', text1: 'Something went wrong' });
      setIsLoading(false);
    },
  });

  useEffect(() => {
    getOrdersMutation.mutate({ page: currentPage });
  }, [currentPage]);

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

  const handleSendId = id => {
    setOrderId(id);
    navigation.navigate('order-detail');
  };

  const renderRow = ({ item }) => {
    const treatments = [...new Set(item.items.map(i => i.product))].join('\n');

    const grouped = Object.values(
      item.items.reduce((acc, cur) => {
        const name =
          cur.name === '' && cur.label === 'Pack of 5 Needles'
            ? 'Pack of 5 Needles'
            : cur.name;
        acc[name] = acc[name] || { name, qty: 0 };
        acc[name].qty += cur.quantity;
        return acc;
      }, {}),
    );

    return (
      <View style={styles.row}>
        <Text style={[styles.cell, styles.id]} numberOfLines={1}>{item.order_id}</Text>
        <Text style={[styles.cell, styles.date]} numberOfLines={1}>{item.created_at}</Text>
        <Text style={[styles.cell, styles.treat]} numberOfLines={3}>{treatments}</Text>
        <View style={[styles.cell, styles.items]}>
          {grouped.map(g => (
            <Text key={g.name} numberOfLines={1}>• {g.name} × {g.qty}</Text>
          ))}
        </View>
        <View style={[styles.cell, styles.stat]}>
          <Text style={pillStyle(item.status)}>{item.status}</Text>
        </View>
        <Text style={[styles.cell, styles.total]} numberOfLines={1}>£{item.total_price}</Text>
        <TouchableOpacity
          style={[styles.cell, styles.eye]}
          onPress={() => handleSendId(item.id)}>
          <Ionicons name="eye" size={20} color="#47317c" />
        </TouchableOpacity>
      </View>
    );
  };

  return (

    <>

      <Header />
      <View style={styles.container}>
        <Text style={styles.heading}>My Orders</Text>
        <Text style={styles.sub}>View your order history</Text>

        {/* Search */}
        <View style={styles.topRow}>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color="#888" style={styles.searchIcon} />
            <TextInput
              placeholder="Search by Order ID"
              placeholderTextColor="#9CA3AF"
              value={searchValue}
              onChangeText={setSearchValue}
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* Filter tag */}
        {/* <View style={styles.statusTagWrapper}>
        <Text style={styles.statusTagLabel}>Showing:</Text>
        <View
          style={[
            styles.statusTag,
            status === 'all' ? styles.defaultPill : pillStyle(status),
          ]}>
          <Text style={styles.statusTagText}>
            {status === 'all' ? 'All Orders' : status}
          </Text>
        </View>
      </View> */}
        {/* processing: { backgroundColor: '#fef3c7', color: '#92400e' },
  incomplete: { backgroundColor: '#ffedd5', color: '#c2410c' },
  approved: { backgroundColor: '#d1fae5', color: '#065f46' },
  cancelled: { backgroundColor: '#fee2e2', color: '#991b1b' },
  defaultPill: { backgroundColor: '#e5e7eb', color: '#374151' }, */}

        {/* Dropdown */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Sort by status</Text>
          <View style={[
            styles.dropdownWrapper,
            styles.statusTag,
            status === 'all' && styles.defaultPill,
            status === 'processing' && styles.processing,
            status === 'incomplete' && styles.incomplete,
            status === 'approved' && styles.approved,
            status === 'cancelled' && styles.cancelled,
          ]}>
            <Picker
              selectedValue={status}
              onValueChange={setStatus}
              style={styles.dropdown}
              dropdownIconColor="white"
              mode="dropdown">
              <Picker.Item label="All" value="all" color="white" />
              <Picker.Item label="Processing" value="processing" color="white" />
              <Picker.Item label="Incomplete" value="incomplete" color="white" />
              <Picker.Item label="Approved" value="approved" color="white" />
              <Picker.Item label="Cancelled" value="cancelled" color="white" />
            </Picker>
          </View>
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <Ionicons name="bulb-outline" size={16} color="#2563eb" />
          <Text style={styles.bannerText}>
            Changes to your shipping address will only apply to future orders and will not affect previous ones
          </Text>
        </View>

        {/* Orders table */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ minWidth: 670 }}>
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
              <ActivityIndicator style={{ marginTop: 30 }} size="large" />
            ) : (
              <FlatList
                data={filteredOrders}
                keyExtractor={i => i.order_id.toString()}
                renderItem={renderRow}
                contentContainerStyle={{ paddingBottom: 40 }}
              />
            )}
          </View>
        </ScrollView>
      </View>

    </>
  );
};

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
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  heading: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  sub: { color: '#4b5563', marginBottom: 12 },

  topRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  searchWrap: { flex: 1, minWidth: '60%', position: 'relative' },
  searchIcon: { position: 'absolute', left: 12, top: 12, zIndex: 2 },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingVertical: 10,
    paddingLeft: 38,
    paddingRight: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#f9fafb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  dropdownWrapper: {
    flex: 1,
    height: 36,
    backgroundColor: 'white',
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  dropdown: {
    // height: 36,
    color: 'black',
  },

  statusTagWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statusTagLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  statusTag: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusTagText: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'capitalize',
    color: '#111',
  },

  banner: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
    padding: 10,
    marginBottom: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  bannerText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#2563eb',
    flex: 1,
  },

  headerRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f3f4f6',
  },
  hCell: { fontSize: 11, fontWeight: '600', color: '#6b7280' },

  row: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  cell: { fontSize: 13, color: '#374151' },

  id: { width: COL_WIDTH.id },
  date: { width: COL_WIDTH.date },
  treat: { width: COL_WIDTH.treat },
  items: { width: COL_WIDTH.items },
  stat: { width: COL_WIDTH.stat, justifyContent: 'center' },
  total: { width: COL_WIDTH.total },
  eye: { width: COL_WIDTH.eye, alignItems: 'center' },

  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    overflow: 'hidden',
    textAlign: 'center',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  processing: { backgroundColor: '#fef3c7', color: '#92400e' },
  incomplete: { backgroundColor: '#ffedd5', color: '#c2410c' },
  approved: { backgroundColor: '#d1fae5', color: '#065f46' },
  cancelled: { backgroundColor: '#fee2e2', color: '#991b1b' },
  defaultPill: { backgroundColor: '#e5e7eb', color: '#374151' },
});

export default OrdersScreen;
