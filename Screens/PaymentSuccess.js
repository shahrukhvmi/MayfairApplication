import React, {useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';

import {Fonts} from '../utils/fonts';
import Header from '../Layout/header';
import NextButton from '../Components/NextButton';
import useCartStore from '../store/useCartStore';
import GetImageIsUplaod from '../api/GetImageIsUplaod';
import {GetIdVerification} from '../api/IdVerificationApi';
import useImageUploadStore from '../store/useImageUploadStore';
import useIdVerificationUploadStore from '../store/useIdVerificationUploadStore';

const PRIMARY = '#47317c';

const VerificationCard = ({icon, title, description, label, onPress}) => (
  <View style={styles.verifyCard}>
    <View style={styles.verifyBadge}>
      <Feather name={icon} size={12} color="#d97706" />
      <Text style={styles.verifyBadgeText}>ACTION REQUIRED</Text>
    </View>
    <Text style={styles.verifyTitle}>{title}</Text>
    <Text style={styles.verifyDesc}>{description}</Text>

    <TouchableOpacity
      style={styles.verifyButton}
      activeOpacity={0.85}
      onPress={onPress}>
      <Feather name="upload-cloud" size={14} color="#fff" />
      <Text style={styles.verifyButtonText}>{label}</Text>
      <Feather name="chevron-right" size={13} color="#fff" />
    </TouchableOpacity>
  </View>
);

const PaymentSuccess = () => {
  const {items, orderId, checkOut} = useCartStore();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {imageUploaded, setImageUploaded} = useImageUploadStore();
  const {idVerificationUpload, setIdVerificationUpload} =
    useIdVerificationUploadStore();

  useEffect(() => {
    if (!checkOut || Object.keys(checkOut).length === 0) {
      navigation.replace('dashboard');
    }
  }, [checkOut, navigation]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const [imageResult, idResult] = await Promise.allSettled([
          GetImageIsUplaod({order_id: orderId}),
          GetIdVerification(),
        ]);
        if (imageResult.status === 'fulfilled') {
          setImageUploaded(imageResult.value?.data?.status);
        }
        if (idResult.status === 'fulfilled') {
          setIdVerificationUpload(idResult.value?.data?.status);
        }
      } catch (error) {
        console.error('Failed to fetch verification status:', error);
      }
    };

    if (orderId) fetchStatus();
  }, [orderId]);

  if (!checkOut || Object.keys(checkOut).length === 0) {
    return null;
  }

  const handleGoBack = () => navigation.navigate('dashboard');
  const handleGoUpload = () => navigation.navigate('photo-upload');
  const handleGoIdVerify = () => navigation.navigate('id-verification');

  const allItems = [...(items?.doses ?? []), ...(items?.addons ?? [])];
  const needsVerification = !imageUploaded || !idVerificationUpload;

  return (
    <>
      <Header />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {paddingBottom: insets.bottom + 24},
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {/* Success header */}
          <View style={styles.successHeader}>
            <View style={styles.badgeCircle}>
              <Feather name="check" size={30} color="#fff" />
            </View>
            <Text style={styles.title}>Order Placed Successfully</Text>
            <Text style={styles.orderId}>Order #{orderId}</Text>
          </View>

          <View style={styles.body}>
            {/* Order summary table */}
            <View style={styles.table}>
              <View style={[styles.row, styles.tableHeaderRow]}>
                <Text style={[styles.headerCell, styles.colItem]}>Items</Text>
                <Text style={[styles.headerCell, styles.colQty]}>Qty</Text>
                <Text style={[styles.headerCell, styles.colAmount]}>
                  Amount
                </Text>
              </View>

              {allItems.map((item, index) => (
                <View key={`item-${index}`} style={styles.row}>
                  <Text style={[styles.cell, styles.colItem]}>
                    {item?.label || item?.product || item?.name || 'Item'}
                  </Text>
                  <Text style={[styles.cell, styles.colQty]}>
                    {item?.qty || item?.quantity || 1}
                  </Text>
                  <Text style={[styles.cell, styles.colAmount]}>
                    £
                    {(
                      parseFloat(item?.price || 0) *
                      (item?.qty || item?.quantity || 1)
                    ).toFixed(2)}
                  </Text>
                </View>
              ))}

              {checkOut?.discount?.discount != null && (
                <View style={styles.row}>
                  <Text style={[styles.cell, styles.colItem]}>
                    Discount
                    {checkOut?.discount?.type === 'Percent'
                      ? ` (${parseInt(checkOut?.discount?.discount, 10)}%)`
                      : checkOut?.discount?.type
                      ? ` (${checkOut?.discount?.type})`
                      : ''}
                    {checkOut?.discount?.code
                      ? ` - ${checkOut?.discount?.code}`
                      : ''}
                  </Text>
                  <Text style={[styles.cell, styles.colQty]} />
                  <Text style={[styles.cell, styles.colAmount, styles.discount]}>
                    {checkOut?.discount?.type === 'Percent'
                      ? `-£${parseFloat(
                          checkOut?.discount?.discount_value || 0,
                        ).toFixed(2)}`
                      : `-£${parseFloat(
                          checkOut?.discount?.discount || 0,
                        ).toFixed(2)}`}
                  </Text>
                </View>
              )}

              {checkOut?.shipment && (
                <View style={styles.row}>
                  <Text style={[styles.cell, styles.colItem]}>
                    Shipping ({checkOut?.shipment?.name})
                  </Text>
                  <Text style={[styles.cell, styles.colQty]} />
                  <Text style={[styles.cell, styles.colAmount]}>
                    £{parseFloat(checkOut?.shipment?.price || 0).toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={[styles.row, styles.totalRow]}>
                <Text style={[styles.totalLabel, styles.colItem]}>Total</Text>
                <Text style={[styles.cell, styles.colQty]} />
                <Text style={[styles.totalValue, styles.colAmount]}>
                  £{parseFloat(checkOut?.total || 0).toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Verification section */}
            {needsVerification && (
              <View style={styles.verifySection}>
                <View style={styles.verifyHeadingRow}>
                  <Feather name="clipboard" size={20} color={PRIMARY} />
                  <View style={styles.verifyHeadingText}>
                    <Text style={styles.verifyHeading}>
                      Your next step: verification
                    </Text>
                    <Text style={styles.verifySubheading}>
                      Please complete the uploads below so our clinical team
                      can review your order.
                    </Text>
                  </View>
                </View>

                {!imageUploaded && (
                  <VerificationCard
                    icon="camera"
                    title="Upload your photo"
                    description="Please upload your photo verification to complete your order."
                    label="Upload photo"
                    onPress={handleGoUpload}
                  />
                )}
                {!idVerificationUpload && (
                  <VerificationCard
                    icon="credit-card"
                    title="Verify Your Identity"
                    description="Please upload a valid ID to verify your identity and complete your order."
                    label="Upload ID"
                    onPress={handleGoIdVerify}
                  />
                )}

                <View style={styles.secureNote}>
                  <Feather name="shield" size={15} color="#0f766e" />
                  <Text style={styles.secureNoteText}>
                    Your uploads are stored securely and handled confidentially
                    as part of your clinical review.
                  </Text>
                </View>
              </View>
            )}

            {/* Delivery / cancellation info */}
            <View style={styles.infoSection}>
              <Text style={styles.infoParagraph}>
                <Text style={styles.infoBold}>Delivery: </Text>
                All orders, once approved, are shipped via next-day tracked
                delivery using either DPD or Royal Mail. Orders may take longer
                than one working day to approve due to the clinical checks
                required. If you would like your order delivered on a specific
                date, please contact us before it is dispatched so we can send
                it accordingly.
              </Text>
              <Text style={styles.infoParagraph}>
                <Text style={styles.infoBold}>Changes or cancellation: </Text>
                If there are any changes you would like to make to your order or
                to cancel it, please contact us immediately by email on{' '}
                <Text style={styles.link}>
                  contact@mayfairweightlossclinic.co.uk
                </Text>
                . Please note that once your medication has been dispensed you
                will not be able to cancel or return your order. This is due to
                legislation around prescription-only medication.
              </Text>
            </View>

            {imageUploaded && idVerificationUpload && (
              <NextButton
                onPress={handleGoBack}
                label="Continue to view order details"
                style={styles.continueButton}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default PaymentSuccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFBFD',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.1)',
    overflow: 'hidden',
    shadowColor: 'rgba(71, 49, 124, 0.12)',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 3,
  },

  // Success header
  successHeader: {
    backgroundColor: '#f5f2fc',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(71, 49, 124, 0.08)',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  badgeCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: '#0f172a',
    textAlign: 'center',
  },
  orderId: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: PRIMARY,
    marginTop: 6,
  },

  body: {
    padding: 18,
    gap: 22,
  },

  // Table
  table: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  tableHeaderRow: {
    backgroundColor: 'rgba(71, 49, 124, 0.05)',
    borderTopWidth: 0,
  },
  headerCell: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: '#334155',
  },
  cell: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: '#334155',
  },
  colItem: {
    flex: 2.2,
  },
  colQty: {
    flex: 1,
    textAlign: 'center',
  },
  colAmount: {
    flex: 1.1,
    textAlign: 'right',
  },
  discount: {
    color: PRIMARY,
    fontFamily: Fonts.medium,
  },
  totalRow: {
    backgroundColor: 'rgba(71, 49, 124, 0.055)',
  },
  totalLabel: {
    fontSize: 13.5,
    fontFamily: Fonts.semiBold,
    color: '#0f172a',
    textAlign: 'right',
  },
  totalValue: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: PRIMARY,
    textAlign: 'right',
  },

  // Verification
  verifySection: {
    gap: 14,
  },
  verifyHeadingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  verifyHeadingText: {
    flex: 1,
  },
  verifyHeading: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: '#0f172a',
  },
  verifySubheading: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#64748b',
    marginTop: 3,
    lineHeight: 18,
  },
  verifyCard: {
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
    backgroundColor: 'rgba(255, 251, 235, 0.6)',
    borderRadius: 16,
    padding: 14,
  },
  verifyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    marginBottom: 8,
  },
  verifyBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: '#d97706',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  verifyTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: '#0f172a',
  },
  verifyDesc: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 17,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 12,
  },
  verifyButtonText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: '#fff',
  },
  secureNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  secureNoteText: {
    flex: 1,
    fontSize: 11.5,
    fontFamily: Fonts.regular,
    color: '#64748b',
    lineHeight: 17,
  },

  // Info
  infoSection: {
    gap: 14,
  },
  infoParagraph: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: '#475569',
    lineHeight: 20,
  },
  infoBold: {
    fontFamily: Fonts.semiBold,
    color: '#0f172a',
  },
  link: {
    fontFamily: Fonts.medium,
    color: PRIMARY,
    textDecorationLine: 'underline',
  },

  continueButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    minHeight: 48,
  },
});
