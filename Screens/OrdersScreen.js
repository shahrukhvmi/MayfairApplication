import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useMutation} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import useOrderId from '../store/useOrderIdStore';
import usePaginationStore from '../store/pagination';
import {useStatusStore} from '../store/useStatusStore';
import GetOrdersApi from '../api/getOrders';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Header from '../Layout/header';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Fonts} from '../utils/fonts';

const PRIMARY = '#47317c';

const STATUS_OPTIONS = [
  {value: 'all', label: 'All orders', dot: PRIMARY, bg: '#f3f0f9', text: PRIMARY, border: '#d9cff0'},
  {value: 'processing', label: 'Processing', dot: '#f59e0b', bg: '#fffbeb', text: '#b45309', border: '#fde68a'},
  {value: 'incomplete', label: 'Incomplete', dot: '#f97316', bg: '#fff7ed', text: '#c2410c', border: '#fed7aa'},
  {value: 'approved', label: 'Approved', dot: '#10b981', bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0'},
  {value: 'cancelled', label: 'Cancelled', dot: '#ef4444', bg: '#fef2f2', text: '#991b1b', border: '#fecaca'},
];

const getStatusMeta = status =>
  STATUS_OPTIONS.find(o => o.value === status?.toLowerCase()) ||
  {dot: '#94a3b8', bg: '#f8fafc', text: '#64748b', border: '#e2e8f0'};

const OrderStatusPill = ({status}) => {
  const meta = getStatusMeta(status);
  return (
    <View style={[styles.statusPill, {backgroundColor: meta.bg, borderColor: meta.border}]}>
      <View style={[styles.statusDot, {backgroundColor: meta.dot}]} />
      <Text style={[styles.statusText, {color: meta.text}]}>{status}</Text>
    </View>
  );
};

const OrdersScreen = () => {
  const insets = useSafeAreaInsets();
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  const {currentPage, setCurrentPage} = usePaginationStore();
  const listRef = useRef(null);

  const goToPage = page => {
    setCurrentPage(page);
    listRef.current?.scrollToOffset({offset: 0, animated: true});
  };
  const {status, setStatus} = useStatusStore();
  const {setOrderId} = useOrderId();

  const navigation = useNavigation();

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

  useFocusEffect(
    React.useCallback(() => {
      getOrdersMutation.mutate({page: currentPage});
    }, [currentPage]),
  );

  const filteredOrders = data?.allorders?.filter(order => {
    const q = searchValue.toLowerCase();
    const matchesSearch =
      !q ||
      order.order_id.toString().includes(q) ||
      order.treatment?.toLowerCase().includes(q) ||
      order.items.some(i => i.product?.toLowerCase().includes(q));

    const matchesStatus =
      status === 'all' || order.status.toLowerCase() === status.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleSendId = id => {
    setOrderId(id);
    navigation.navigate('order-detail');
  };

  const getUniqueTreatments = order => {
    const items = Array.isArray(order?.items) ? order.items : [];
    return [...new Set(items.map(i => i?.product).filter(Boolean))];
  };

  const getGroupedItems = order => {
    const items = Array.isArray(order?.items) ? order.items : [];
    return Object.values(
      items.reduce((acc, item) => {
        const name =
          item?.name === '' && item?.label === 'Pack of 5 Needles'
            ? 'Pack of 5 Needles'
            : item?.name || item?.label || item?.product || 'Item';
        acc[name] = acc[name] || {name, quantity: 0};
        acc[name].quantity += Number(item?.quantity) || 0;
        return acc;
      }, {}),
    );
  };

  const renderOrderCard = ({item: order}) => {
    const treatments = getUniqueTreatments(order);
    const groupedItems = getGroupedItems(order);

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderCardHeader}>
          <View>
            <Text style={styles.orderLabel}>ORDER</Text>
            <Text style={styles.orderId}>#{order.order_id}</Text>
          </View>
          <OrderStatusPill status={order.status} />
        </View>

        <View style={styles.orderCardBody}>
          <View style={styles.rowBetween}>
            <View style={styles.colFlex}>
              <Text style={styles.fieldLabel}>DATE</Text>
              <View style={styles.dateRow}>
                <Feather name="calendar" size={12} color="#94a3b8" />
                <Text style={styles.dateText}>{order.created_at}</Text>
              </View>
            </View>
            <View style={[styles.colFlex, {alignItems: 'flex-end'}]}>
              <Text style={styles.fieldLabel}>TOTAL</Text>
              <Text style={styles.totalText}>£{order.total_price}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.fieldLabel}>TREATMENT</Text>
          <View style={styles.treatmentList}>
            {treatments.map((t, i) => (
              <Text key={`${t}-${i}`} style={styles.treatmentText}>
                {t}
              </Text>
            ))}
          </View>

          <View style={{marginTop: 12}}>
            <Text style={styles.fieldLabel}>ITEMS</Text>
            <View style={styles.itemsList}>
              {groupedItems.map((g, i) => (
                <Text key={`${g.name}-${i}`} style={styles.itemText}>
                  {g.name}
                  <Text style={styles.itemQty}> × {g.quantity}</Text>
                </Text>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => handleSendId(order?.id)}
            activeOpacity={0.85}>
            <Feather name="eye" size={15} color="#fff" />
            <Text style={styles.viewButtonText}>View order</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSkeleton = () => (
    <View style={styles.orderCard}>
      <View style={styles.orderCardHeader}>
        <View style={{gap: 6}}>
          <View style={[styles.skeletonBlock, {width: 60, height: 10}]} />
          <View style={[styles.skeletonBlock, {width: 90, height: 16}]} />
        </View>
        <View style={[styles.skeletonBlock, {width: 80, height: 22, borderRadius: 11}]} />
      </View>
      <View style={styles.orderCardBody}>
        <View style={[styles.skeletonBlock, {width: '100%', height: 60, borderRadius: 8}]} />
      </View>
    </View>
  );

  const renderPagination = () => {
    if (isLoading || !data || !filteredOrders?.length) return null;

    const lastPage = Number(data?.last_page) || 1;
    if (lastPage <= 1) return null;

    const pages = Array.from({length: lastPage}, (_, i) => i + 1);

    return (
      <View style={styles.paginationWrap}>
        <Text style={styles.paginationInfo}>
          Page <Text style={styles.paginationInfoBold}>{currentPage}</Text> of{' '}
          <Text style={styles.paginationInfoBold}>{lastPage}</Text>
        </Text>

        <View style={styles.paginationControls}>
          <TouchableOpacity
            style={[
              styles.pageButton,
              currentPage === 1 && styles.pageButtonDisabled,
            ]}
            disabled={currentPage === 1}
            onPress={() => goToPage(currentPage - 1)}>
            <Feather name="chevron-left" size={16} color="#64748b" />
          </TouchableOpacity>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.pageNumbersScroll}
            contentContainerStyle={styles.pageNumbersRow}>
            {pages.map(p => {
              const isActive = p === currentPage;
              return (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.pageButton,
                    isActive && styles.pageButtonActive,
                  ]}
                  onPress={() => goToPage(p)}>
                  <Text
                    style={[
                      styles.pageButtonText,
                      isActive && styles.pageButtonTextActive,
                    ]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.pageButton,
              currentPage === lastPage && styles.pageButtonDisabled,
            ]}
            disabled={currentPage === lastPage}
            onPress={() => goToPage(currentPage + 1)}>
            <Feather name="chevron-right" size={16} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIconBox}>
        <Feather name="shopping-bag" size={24} color="#94a3b8" />
      </View>
      <Text style={styles.emptyTitle}>No orders found</Text>
      <Text style={styles.emptyText}>No orders match your search or filter.</Text>
    </View>
  );

  return (
    <>
      <Header />
      <FlatList
        ref={listRef}
        style={styles.list}
        data={isLoading ? [] : filteredOrders}
        keyExtractor={i => i.order_id.toString()}
        renderItem={renderOrderCard}
        contentContainerStyle={[
          styles.container,
          {paddingBottom: insets.bottom + 16},
        ]}
        ListHeaderComponent={
          <>
            {/* Page header card */}
            <View style={styles.pageHeader}>
              <View style={styles.pageHeaderTop}>
                <View style={{flex: 1}}>
                  <Text style={styles.pageLabel}>ORDERS</Text>
                  <Text style={styles.pageTitle}>My Orders</Text>
                  <Text style={styles.pageSubtitle}>
                    Review your previous orders and complete order details.
                  </Text>
                </View>
                {data?.total != null && (
                  <View style={styles.totalBadge}>
                    <Feather name="shopping-bag" size={13} color={PRIMARY} />
                    <Text style={styles.totalBadgeText}>
                      {data.total} Total Orders
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Search */}
            <View style={styles.searchWrap}>
              <Feather name="search" size={16} color="#94a3b8" style={styles.searchIcon} />
              <TextInput
                placeholder="Search by order ID or treatment…"
                placeholderTextColor="#94a3b8"
                value={searchValue}
                onChangeText={setSearchValue}
                style={styles.searchInput}
              />
              {searchValue ? (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setSearchValue('')}>
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Status filter chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipsScroll}
              contentContainerStyle={styles.chipsRow}>
              {STATUS_OPTIONS.map(opt => {
                const isActive = status === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setStatus(opt.value)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isActive ? opt.bg : '#fff',
                        borderColor: isActive ? opt.border : '#e2e8f0',
                      },
                    ]}
                    activeOpacity={0.8}>
                    <View style={[styles.statusDot, {backgroundColor: opt.dot}]} />
                    <Text
                      style={[
                        styles.chipText,
                        {color: isActive ? opt.text : '#64748b'},
                      ]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Info notice */}
            <View style={styles.infoNotice}>
              <Feather name="info" size={13} color="#f59e0b" />
              <Text style={styles.infoText}>
                <Text style={styles.infoTextBold}>Note: </Text>
                Changes to your shipping address will only apply to future
                orders and will not affect previous ones.
              </Text>
            </View>

            {isLoading && (
              <>
                {renderSkeleton()}
                {renderSkeleton()}
                {renderSkeleton()}
              </>
            )}
          </>
        }
        ListEmptyComponent={!isLoading ? renderEmpty() : null}
        ItemSeparatorComponent={() => <View style={{height: 12}} />}
        ListFooterComponent={renderPagination}
        ListFooterComponentStyle={{marginTop: 16}}
      />
    </>
  );
};

const styles = StyleSheet.create({
  list: {
    backgroundColor: '#FBFBFD',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    backgroundColor: '#FBFBFD',
  },

  // Page header
  pageHeader: {
    borderWidth: 1,
    borderColor: '#e4e0f5',
    borderRadius: 16,
    backgroundColor: '#fbfaff',
    padding: 18,
    marginBottom: 16,
  },
  pageHeaderTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  pageLabel: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    color: 'rgba(71, 49, 124, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  pageTitle: {
    fontSize: 21,
    fontFamily: Fonts.bold,
    color: '#0f172a',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#64748b',
    lineHeight: 17,
  },
  totalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#e8e2f5',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  totalBadgeText: {
    fontSize: 11.5,
    fontFamily: Fonts.semiBold,
    color: '#1e293b',
  },

  // Search
  searchWrap: {
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 12,
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 2,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    paddingLeft: 40,
    paddingRight: 60,
    fontSize: 13,
    color: '#0f172a',
    fontFamily: Fonts.regular,
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearButtonText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: '#475569',
  },

  // Status chips
  chipsScroll: {
    marginBottom: 12,
  },
  chipsRow: {
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Info notice
  infoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
    backgroundColor: 'rgba(255, 251, 235, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: '#64748b',
    lineHeight: 16,
  },
  infoTextBold: {
    fontFamily: Fonts.medium,
    color: '#475569',
  },

  // Order card
  orderCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  orderCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  orderLabel: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  orderId: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: '#0f172a',
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    textTransform: 'capitalize',
  },
  orderCardBody: {
    padding: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colFlex: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    fontSize: 12.5,
    fontFamily: Fonts.medium,
    color: '#334155',
  },
  totalText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: '#0f172a',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 14,
  },
  treatmentList: {
    marginTop: 4,
    gap: 2,
  },
  treatmentText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: '#0f172a',
  },
  itemsList: {
    marginTop: 4,
    gap: 2,
  },
  itemText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: '#64748b',
  },
  itemQty: {
    fontFamily: Fonts.medium,
    color: '#334155',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    minHeight: 42,
    marginTop: 16,
  },
  viewButtonText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: '#fff',
  },

  // Skeleton
  skeletonBlock: {
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    opacity: 0.6,
  },

  // Pagination
  paginationWrap: {
    gap: 10,
  },
  paginationInfo: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#94a3b8',
    textAlign: 'center',
  },
  paginationInfoBold: {
    fontFamily: Fonts.semiBold,
    color: '#334155',
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  pageNumbersScroll: {
    flexGrow: 0,
  },
  pageNumbersRow: {
    flexDirection: 'row',
    gap: 6,
  },
  pageButton: {
    minWidth: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  pageButtonActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  pageButtonDisabled: {
    opacity: 0.4,
  },
  pageButtonText: {
    fontSize: 12.5,
    fontFamily: Fonts.medium,
    color: '#64748b',
  },
  pageButtonTextActive: {
    color: '#fff',
    fontFamily: Fonts.semiBold,
  },

  // Empty state
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: '#0f172a',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default OrdersScreen;
