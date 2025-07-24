// OrderDetail.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import moment from 'moment';
import useOrderId from '../store/useOrderIdStore';
import getOrderByIdApi from '../api/getOrderByIdApi';
import Header from '../Layout/header';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AnimatedLogoLoader from '../Components/AnimatedLogoLoader';
/* ––––––––– utility helpers ––––––––– */
const formatHeight = (d) => {
  if (!d) return 'N/A';
  if (d.height_unit === 'imperial') return `${d.ft} ft ${d.inch} in`;
  if (d.height_unit === 'metrics') return `${d.cm} cm`;
  return 'N/A';
};
const formatWeight = (d) => {
  if (!d) return 'N/A';
  if (d.weight_unit === 'metrics') return `${d.kg} kg`;
  if (d.weight_unit === 'imperial') return `${d.stones} st ${d.pound} lbs`;
  return 'N/A';
};

/* ––––––––– main component ––––––––– */
export default function OrderDetail() {
  const { orderId } = useOrderId();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0-3
  const navigation = useNavigation();
  /* fetch order */
  useFocusEffect(
    React.useCallback(() => {
      if (!orderId) return;
      setLoading(true);
      getOrderByIdApi(orderId)
        .then((res) => setOrder(res?.data))
        .finally(() => setLoading(false));
    }, [orderId]));

  /* quick destructuring (guards for “undefined”) */
  const o = order?.data?.order;
  const shipping = o?.shipping;
  const billing = o?.billing;
  const patient = o?.consultation?.fields?.patientInfo;
  const gp = o?.consultation?.fields?.gpdetails;
  const bmi = o?.consultation?.fields?.bmi;
  const medicalInfo = o?.consultation?.fields?.medicalInfo?.length
    ? o?.consultation?.fields?.medicalInfo
    : o?.consultation?.fields?.legacy_medicalInfo;
  const products = o?.items ?? [];
  const discount = o?.consultation?.fields?.checkout?.discount;
  const shippedOn = o?.created_at;
  const shippedTime = o?.created_at_time;

  /* loading state */
  if (loading || !o) {
    return (
      <>
        <Header />
        <View style={styles.centered}><AnimatedLogoLoader size="large" /></View>
      </>
    );
  }

  /* ––––––––– render helpers ––––––––– */
  const TabButton = ({ label, idx }) => (
    <TouchableOpacity
      style={[styles.tabBtn, activeTab === idx && styles.tabBtnActive]}
      onPress={() => setActiveTab(idx)}
    >
      <Text style={styles.tabText}>{label}</Text>
    </TouchableOpacity>
  );

  const Row = ({ left, right }) => (
    <View style={styles.row}>
      <Text style={styles.rowLeft}>{left}</Text>
      <Text style={styles.rowRight}>{right}</Text>
    </View>
  );

  /* ––––––––– UI ––––––––– */
  return (
    <>
      <Header />

      {/* date chip */}
      <View style={styles.dateChip}>
        <Text style={styles.dateChipTxt}>
          {moment(shippedOn, 'DD-MM-YYYY', true).isValid()
            ? moment(shippedOn, 'DD-MM-YYYY').format('DD-MM-YYYY')
            : 'N/A'} {shippedTime}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>
          Details of Order&nbsp;
          <Text style={styles.bold}>#{o.id}</Text>
        </Text>

        {/* stat chips */}
        {/* ── modern stat chips ─────────────────────────────── */}
        <View style={styles.statWrap}>
          {[
            {
              label: 'Status',
              value: o.status,
              icon: 'pricetag',
              color: '#6366F1',          // indigo
            },
            {
              label: 'Payment',
              value: o.payments?.status,
              icon: 'card',
              color: '#10B981',          // green
            },
            {
              label: 'Total',
              value: `£${o.total_price}`,
              icon: 'cash',
              color: '#F59E0B',          // amber
            },
          ].map((s) => (
            <View key={s.label} style={[styles.statChip, { backgroundColor: `${s.color}1A` }]}>
              {/* <Ionicons name={s.icon} size={16} color={s.color} style={{ marginRight: 6 }} /> */}
              <View style={{ flex: 1 }}>
                <Text style={styles.statLabel}>{s.label}</Text>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              </View>
            </View>
          ))}
        </View>


        {/* tabs */}
        <View style={styles.tabs}>
          <TabButton label="Order Details" idx={0} />
          <TabButton label="Patient Details" idx={1} />
          {/* <TabButton label="Medical Questions" idx={2} /> */}
          {/* <TabButton label="Shipping/Billing" idx={3} /> */}
        </View>

        {/* tab content */}
        {/* TAB 0 – Order Details ------------------------------------------------ */}
        {activeTab === 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Order Details</Text>
            {products.map((p) => (
              <Row
                key={p.id}
                left={`${p.label} x${p.quantity}`}
                right={`£${(p.price * p.quantity).toFixed(2)}`}
              />
            ))}
            {discount?.discount > 0 && (
              <>
                <Row left="Discount"
                  right={discount.type === 'Fixed'
                    ? `-£${discount.discount_value}`
                    : `-${discount.discount_value}%`} />
                <Row left="Coupon Code" right={discount.code || 'N/A'} />
              </>
            )}
            <Row left="Shipping Fee" right={`£${o.shippment_weight}`} />
            <Row left="Total" right={`£${o.total_price}`} />
          </View>
        )}

        {/* TAB 1 – Patient Details --------------------------------------------- */}
        {activeTab === 1 && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Patient Information</Text>
              <Row left="First Name" right={patient?.firstName || 'N/A'} />
              <Row left="Last Name" right={patient?.lastName || 'N/A'} />
              <Row left="Pregnancy" right={patient?.pregnancy || 'N/A'} />
              <Row left="Gender" right={patient?.gender || 'N/A'} />
              <Row left="Date of Birth"
                right={moment(patient?.dob, 'DD-MM-YYYY', true).isValid()
                  ? moment(patient.dob, 'DD-MM-YYYY').format('DD-MM-YYYY')
                  : 'N/A'} />
              <Row left="Phone" right={patient?.phoneNo || 'N/A'} />
            </View>

            {/* <View style={styles.card}>
              <Text style={styles.cardTitle}>GP Details</Text>
              <Row left="Registered with UK GP?" right={gp?.gpConsent || 'N/A'} />
              <Row left="Address" right={gp?.addressLine1 || 'N/A'} />
              <Row left="City" right={gp?.city || 'N/A'} />
              <Row left="Email" right={gp?.email || 'N/A'} />
              <Row left="County" right={gp?.state || 'N/A'} />
            </View> */}

            {/* <View style={styles.card}>
              <Text style={styles.cardTitle}>BMI Information</Text>
              <Row left="BMI" right={bmi?.bmi ?? 'N/A'} />
              <Row left="Height Unit" right={bmi?.height_unit?.toUpperCase() ?? 'N/A'} />
              <Row left="Height" right={formatHeight(bmi)} />
              <Row left="Weight Unit" right={bmi?.weight_unit?.toUpperCase() ?? 'N/A'} />
              <Row left="Weight" right={formatWeight(bmi)} />
            </View> */}
          </>
        )}

        {/* TAB 2 – Medical Questions ------------------------------------------ */}
        {activeTab === 2 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Medical Information</Text>
            {medicalInfo?.length
              ? medicalInfo.map((q, i) => (
                <Row
                  key={i}
                  left={`${i + 1}. ${q.question.replace(/<[^>]*>/g, '')}`}
                  right={q.answer}
                />
              ))
              : <Text style={styles.gray}>No medical info found.</Text>}
          </View>
        )}

        {/* TAB 3 – Shipping / Billing ----------------------------------------- */}
        {activeTab === 3 && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Shipping Information</Text>
              <Row left="First Name" right={shipping?.first_name || patient?.firstName || 'N/A'} />
              <Row left="Last Name" right={shipping?.last_name || patient?.lastName || 'N/A'} />
              <Row left="Address1" right={shipping?.addressone || 'N/A'} />
              <Row left="Address2" right={shipping?.addresstwo || 'N/A'} />
              <Row left="City" right={shipping?.city || 'N/A'} />
              <Row left="County" right={shipping?.state || 'N/A'} />
              <Row left="Postal Code" right={shipping?.postalcode || 'N/A'} />
              <Row left="Country" right={shipping?.country || 'N/A'} />
              <Row left="Phone" right={patient?.phoneNo || 'N/A'} />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Billing Information</Text>
              <Row left="Address1" right={billing?.addressone || 'N/A'} />
              <Row left="Address2" right={billing?.addresstwo || 'N/A'} />
              <Row left="City" right={billing?.city || 'N/A'} />
              <Row left="County" right={billing?.state || 'N/A'} />
              <Row left="Postal Code" right={billing?.postalcode || 'N/A'} />
              <Row left="Country" right={billing?.country || 'N/A'} />
            </View>
          </>
        )}


        {/* back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate("dashboard")}>
          <Text style={{ color: '#fff' }}>Back</Text>


        </TouchableOpacity>

      </ScrollView>
    </>
  );
}

/* ––––––––– styles ––––––––– */
const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  dateChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#47317c',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderBottomRightRadius: 999,
    borderTopRightRadius: 999,
    margin: 16,
  },
  dateChipTxt: { color: '#fff', fontWeight: '600', fontSize: 12 },

  title: { fontSize: 22, fontWeight: '700', marginBottom: 12, color: '#1C1C29' },
  bold: { fontWeight: '800' },

  statWrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  stat: {
    minWidth: 90,
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
  },
  statValue: {
    backgroundColor: '#47317c',
    color: '#fff',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: 'hidden',
    marginLeft: 4,
  },

  tabs: { flexDirection: 'row', marginBottom: 12 },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    borderRadius: 6,
    marginRight: 6,
  },
  tabBtnActive: { backgroundColor: '#47317c' },
  tabText: { color: '#fff', fontWeight: '600' },

  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  rowLeft: { color: '#1C1C29', flex: 1, paddingRight: 12 },
  rowRight: { color: '#1C1C29', fontWeight: '600', flexShrink: 0 },
  gray: { color: '#6B7280' },

  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#47317c',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
    marginTop: 8,
  },

  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#C9B2ED',
    alignItems: 'center',
    borderRadius: 12,
    marginRight: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tabBtnActive: {
    backgroundColor: '#47317c',
  },
  tabText: {
    fontWeight: '600',
    color: '#fff',
    fontSize: 14,
  },

  stat: {
    minWidth: 90,
    marginRight: 10,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statValue: {
    backgroundColor: '#47317c',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 6,
    fontSize: 12,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C29',
    marginBottom: 10,
  },

  rowLeft: {
    color: '#374151',
    flex: 1,
    paddingRight: 12,
    fontSize: 14,
  },
  rowRight: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 14,
  },

  backBtn: {
    alignSelf: 'center',
    backgroundColor: '#47317c',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },

  /* modern stat chips */
  statWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },

  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    minWidth: 105,

  },

  statLabel: {
    fontSize: 12,
    color: '#374151',
  },

  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },

});
