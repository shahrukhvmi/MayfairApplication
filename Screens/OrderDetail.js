import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import moment from 'moment';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';

import useOrderId from '../store/useOrderIdStore';
import getOrderByIdApi from '../api/getOrderByIdApi';
import Header from '../Layout/header';
import AnimatedLogoLoader from '../Components/AnimatedLogoLoader';
import {Fonts} from '../utils/fonts';

const PRIMARY = '#47317c';

const money = v => {
  const n = parseFloat(v);
  return isNaN(n) ? '0.00' : n.toFixed(2);
};

const TABS = [
  {key: 0, label: 'Order Details', icon: 'shopping-bag'},
  {key: 1, label: 'Patient Details', icon: 'user'},
];

export default function OrderDetail() {
  const {orderId} = useOrderId();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useFocusEffect(
    React.useCallback(() => {
      if (!orderId) return;
      setLoading(true);
      getOrderByIdApi(orderId)
        .then(res => setOrder(res?.data))
        .finally(() => setLoading(false));
    }, [orderId]),
  );

  const o = order?.data?.order;
  const patient = o?.consultation?.fields?.patientInfo;
  const products = o?.items ?? [];
  const discount = o?.consultation?.fields?.checkout?.discount;
  const hasDiscount = discount?.discount > 0;
  const isPercent = discount?.type !== 'Fixed';
  const shippedOn = o?.created_at;

  const formattedDate = moment(shippedOn, 'DD-MM-YYYY', true).isValid()
    ? moment(shippedOn, 'DD-MM-YYYY').format('DD MMM YYYY')
    : 'N/A';
  const formattedDob = moment(patient?.dob, 'DD-MM-YYYY', true).isValid()
    ? moment(patient.dob, 'DD-MM-YYYY').format('DD-MM-YYYY')
    : 'N/A';

  if (loading || !o) {
    return (
      <>
        <Header />
        <View style={styles.centered}>
          <AnimatedLogoLoader size="large" />
        </View>
      </>
    );
  }

  const StatusCard = ({label, value, icon}) => (
    <View style={styles.statusCard}>
      <View style={styles.statusIcon}>
        <Feather name={icon} size={18} color={PRIMARY} />
      </View>
      <View style={{flex: 1}}>
        <Text style={styles.statusLabel}>{label}</Text>
        <View style={styles.statusValueRow}>
          <View style={styles.statusDot} />
          <Text style={styles.statusValue} numberOfLines={1}>
            {value || 'N/A'}
          </Text>
        </View>
      </View>
    </View>
  );

  const DetailField = ({label, value}) => (
    <View style={styles.detailField}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || 'N/A'}</Text>
    </View>
  );

  return (
    <>
      <Header />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.container,
          {paddingBottom: insets.bottom + 24},
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Back link */}
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => navigation.navigate('dashboard')}>
          <Feather name="arrow-left" size={15} color="#64748b" />
          <Text style={styles.backLinkText}>Back to orders</Text>
        </TouchableOpacity>

        {/* Page header */}
        <Text style={styles.pageLabel}>ORDER DETAILS</Text>
        <Text style={styles.pageTitle}>Order #{o.id}</Text>
        <Text style={styles.pageSubtitle}>
          {formattedDate !== 'N/A'
            ? `Placed on ${formattedDate}`
            : 'Review your treatment items and patient information.'}
        </Text>

        {/* Status cards */}
        <View style={styles.statusRow}>
          <StatusCard label="ORDER STATUS" value={o.status} icon="shopping-bag" />
          <StatusCard
            label="PAYMENT STATUS"
            value={o.payments?.status}
            icon="file-text"
          />
        </View>

        {/* Tab switcher */}
        <Text style={styles.switchLabel}>SWITCH DETAILS</Text>
        <View style={styles.tabBar}>
          {TABS.map(({key, label, icon}) => {
            const active = activeTab === key;
            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.8}
                onPress={() => setActiveTab(key)}
                style={[styles.tab, active && styles.tabActive]}>
                <Feather
                  name={icon}
                  size={14}
                  color={active ? PRIMARY : '#94a3b8'}
                />
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Order Details tab */}
        {activeTab === 0 && (
          <View style={styles.detailCard}>
            <View style={styles.detailCardHeader}>
              <View style={styles.detailCardIcon}>
                <Feather name="shopping-bag" size={19} color={PRIMARY} />
              </View>
              <Text style={styles.detailCardTitle}>Order details</Text>
            </View>

            <View style={styles.itemsWrap}>
              {products.map((p, index) => (
                <View key={p?.id || index} style={styles.itemCard}>
                  <Text style={styles.itemName}>
                    {p?.label || p?.name || p?.product || 'Item'}
                  </Text>
                  <View style={styles.itemMetaRow}>
                    <View>
                      <Text style={styles.itemMetaLabel}>QUANTITY</Text>
                      <Text style={styles.itemMetaValue}>{p?.quantity}</Text>
                    </View>
                    <View style={{alignItems: 'flex-end'}}>
                      <Text style={styles.itemMetaLabel}>AMOUNT</Text>
                      <Text style={styles.itemAmount}>
                        £{money(parseFloat(p?.price) * Number(p?.quantity))}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.summary}>
              {hasDiscount && (
                <>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>
                      Discount
                      {isPercent ? ` (${parseInt(discount?.discount, 10)}%)` : ''}
                    </Text>
                    <Text style={styles.summaryDiscount}>
                      -£
                      {money(
                        isPercent
                          ? discount?.discount_value
                          : discount?.discount,
                      )}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Coupon code</Text>
                    <Text style={styles.summaryValue}>
                      {discount?.code || 'N/A'}
                    </Text>
                  </View>
                </>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping fee</Text>
                <Text style={styles.summaryValue}>
                  £{money(o.shippment_weight)}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>£{money(o.total_price)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Patient Details tab */}
        {activeTab === 1 && (
          <View style={styles.detailCard}>
            <View style={styles.detailCardHeader}>
              <View style={styles.detailCardIcon}>
                <Feather name="user" size={19} color={PRIMARY} />
              </View>
              <Text style={styles.detailCardTitle}>Patient information</Text>
            </View>

            <View style={styles.detailGrid}>
              <DetailField label="First name" value={patient?.firstName} />
              <DetailField label="Last name" value={patient?.lastName} />
              <DetailField label="Gender" value={patient?.gender} />
              {patient?.gender === 'female' && (
                <DetailField label="Pregnancy" value={patient?.pregnancy} />
              )}
              <DetailField label="Date of birth" value={formattedDob} />
              <DetailField label="Phone number" value={patient?.phoneNo} />
            </View>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#FBFBFD',
  },
  container: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FBFBFD',
  },

  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  backLinkText: {
    fontSize: 12.5,
    fontFamily: Fonts.medium,
    color: '#64748b',
  },

  pageLabel: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: '#94a3b8',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: '#0f172a',
  },
  pageSubtitle: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 18,
  },

  // Status cards
  statusRow: {
    gap: 12,
    marginBottom: 22,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e8e2f5',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(71, 49, 124, 0.07)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: '#94a3b8',
    letterSpacing: 1.1,
    marginBottom: 5,
  },
  statusValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PRIMARY,
  },
  statusValue: {
    fontSize: 12.5,
    fontFamily: Fonts.semiBold,
    color: PRIMARY,
    textTransform: 'capitalize',
  },

  // Tabs
  switchLabel: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: '#94a3b8',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 18,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 9,
  },
  tabActive: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.12)',
  },
  tabText: {
    fontSize: 12.5,
    fontFamily: Fonts.semiBold,
    color: '#94a3b8',
  },
  tabTextActive: {
    color: PRIMARY,
  },

  // Detail card
  detailCard: {
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.1)',
    borderRadius: 22,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  detailCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#faf9fc',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(71, 49, 124, 0.07)',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  detailCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: 'rgba(71, 49, 124, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailCardTitle: {
    fontSize: 17,
    fontFamily: Fonts.bold,
    color: '#0f172a',
  },

  // Items
  itemsWrap: {
    padding: 14,
    gap: 12,
  },
  itemCard: {
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.08)',
    backgroundColor: '#faf9fc',
    borderRadius: 16,
    padding: 16,
  },
  itemName: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: '#0f172a',
    textTransform: 'capitalize',
    lineHeight: 19,
  },
  itemMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 14,
  },
  itemMetaLabel: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: '#94a3b8',
    letterSpacing: 1,
  },
  itemMetaValue: {
    fontSize: 12.5,
    fontFamily: Fonts.medium,
    color: '#334155',
    marginTop: 5,
  },
  itemAmount: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: PRIMARY,
    marginTop: 5,
  },

  // Summary
  summary: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(71, 49, 124, 0.07)',
    backgroundColor: '#faf9fc',
    padding: 16,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 12.5,
    fontFamily: Fonts.medium,
    color: '#0f172a',
  },
  summaryDiscount: {
    fontSize: 12.5,
    fontFamily: Fonts.semiBold,
    color: '#059669',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(71, 49, 124, 0.1)',
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: '#0f172a',
  },
  totalValue: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: PRIMARY,
  },

  // Patient grid
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 14,
    gap: 12,
  },
  detailField: {
    width: '47%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.08)',
    backgroundColor: '#faf9fc',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: '#94a3b8',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: '#0f172a',
    textTransform: 'capitalize',
  },
});
