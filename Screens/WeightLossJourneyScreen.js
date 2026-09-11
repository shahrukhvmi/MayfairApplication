import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Dimensions} from 'react-native';
import {useMutation} from '@tanstack/react-query';
import {LineChart} from 'react-native-chart-kit';
import Feather from 'react-native-vector-icons/Feather';

import GetBmiJourney from '../api/GetBmiJourney';
import useAuthUserDetailStore from '../store/useAuthUserDetailStore';
import useSignupStore from '../store/signupStore';
import Header from '../Layout/header';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Fonts} from '../utils/fonts';

const PRIMARY = '#47317c';
const SCREEN_WIDTH = Dimensions.get('window').width;

/* ── Helpers ── */
const kgToStonesPounds = kg => {
  if (!kg) return {stones: 0, pounds: 0};
  const totalPounds = kg * 2.20462;
  return {
    stones: Math.floor(totalPounds / 14),
    pounds: Math.round(totalPounds % 14),
  };
};

const getWeightByUnit = (item, unit) => {
  if (unit === 'kg') return Number(item.weight_kg);
  if (item.weight_stones || item.weight_pounds) {
    return item.weight_stones * 14 + (item.weight_pounds ?? 0);
  }
  const {stones, pounds} = kgToStonesPounds(item.weight_kg);
  return stones * 14 + pounds;
};

const formatWeight = (value, unit) => {
  if (unit === 'kg') return `${value} kg`;
  return `${Math.floor(value / 14)} st ${Math.round(value % 14)} lb`;
};

const getChangeMeta = change => {
  if (change > 0) return {type: 'gain', tone: 'red', label: 'Gained'};
  if (change < 0) return {type: 'loss', tone: 'green', label: 'Lost'};
  return {type: 'same', tone: 'gray', label: 'No change'};
};

const getChangeDescription = type => {
  if (type === 'loss') return 'Weight loss since your first record';
  if (type === 'gain') return 'Weight gain since your first record';
  return 'No weight change since your first record';
};

const calculateStats = (journey, unit) => {
  const values = journey.map(item => getWeightByUnit(item, unit));
  return {
    start: values[0],
    current: values[values.length - 1],
  };
};

const TONE_STYLES = {
  default: {iconBg: 'rgba(71, 49, 124, 0.08)', iconColor: PRIMARY, badgeBg: 'rgba(71, 49, 124, 0.06)', badgeColor: PRIMARY, badgeBorder: 'rgba(71, 49, 124, 0.15)', valueColor: '#0f172a'},
  green: {iconBg: '#ecfdf5', iconColor: '#059669', badgeBg: '#ecfdf5', badgeColor: '#047857', badgeBorder: '#a7f3d0', valueColor: '#059669'},
  red: {iconBg: '#fef2f2', iconColor: '#ef4444', badgeBg: '#fef2f2', badgeColor: '#dc2626', badgeBorder: '#fecaca', valueColor: '#ef4444'},
  gray: {iconBg: '#f1f5f9', iconColor: '#64748b', badgeBg: '#f1f5f9', badgeColor: '#475569', badgeBorder: '#e2e8f0', valueColor: '#334155'},
};

const StatCard = ({title, value, description, badge, iconName, tone = 'default', showMinus}) => {
  const s = TONE_STYLES[tone] || TONE_STYLES.default;
  return (
    <View style={styles.statCard}>
      <View style={styles.statCardTop}>
        <View style={[styles.statIconBox, {backgroundColor: s.iconBg}]}>
          <Feather name={iconName} size={16} color={s.iconColor} />
        </View>
        {badge ? (
          <View
            style={[
              styles.statBadge,
              {backgroundColor: s.badgeBg, borderColor: s.badgeBorder},
            ]}>
            <Text style={[styles.statBadgeText, {color: s.badgeColor}]}>
              {badge}
            </Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, {color: s.valueColor}]}>
        {showMinus ? '−' : ''}
        {value}
      </Text>
      <Text style={styles.statDescription}>{description}</Text>
    </View>
  );
};

const UnitTabs = ({unit, setUnit}) => (
  <View style={styles.unitTabs}>
    {[
      {value: 'kg', label: 'KG'},
      {value: 'st', label: 'St / Lb'},
    ].map(opt => {
      const isActive = unit === opt.value;
      return (
        <View
          key={opt.value}
          onTouchEnd={() => setUnit(opt.value)}
          style={[styles.unitTab, isActive && styles.unitTabActive]}>
          <Text
            style={[
              styles.unitTabText,
              isActive && styles.unitTabTextActive,
            ]}>
            {opt.label}
          </Text>
        </View>
      );
    })}
  </View>
);

const EmptyState = () => (
  <View style={styles.emptyWrap}>
    <View style={styles.emptyIconBox}>
      <Feather name="bar-chart-2" size={24} color={PRIMARY} />
    </View>
    <Text style={styles.emptyTitle}>No weight progression yet</Text>
    <Text style={styles.emptyText}>
      Your journey will appear once tracking starts.
    </Text>
  </View>
);

const Loader = () => (
  <View style={styles.container}>
    <View style={styles.pageHeader}>
      <View style={[styles.skeletonBlock, {width: 130, height: 10, marginBottom: 10}]} />
      <View style={[styles.skeletonBlock, {width: 200, height: 22, marginBottom: 8}]} />
      <View style={[styles.skeletonBlock, {width: '80%', height: 12}]} />
    </View>
    <View style={styles.statsGrid}>
      {[0, 1, 2].map(i => (
        <View key={i} style={[styles.statCard, {height: 110}]} />
      ))}
    </View>
    <View style={[styles.chartCard, {height: 280}]} />
  </View>
);

const WeightLossJourneyScreen = () => {
  const insets = useSafeAreaInsets();
  const {authUserDetail} = useAuthUserDetailStore();
  const {firstName} = useSignupStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [unit, setUnit] = useState('kg');

  const getJourney = useMutation({
    mutationFn: id => GetBmiJourney(id),
    onSuccess: res => {
      setData(res?.data || []);
      setLoading(false);
    },
    onError: () => setLoading(false),
  });

  useEffect(() => {
    if (authUserDetail?.id) {
      getJourney.mutate(authUserDetail.id);
    } else {
      setLoading(false);
    }
  }, [authUserDetail?.id]);

  const displayName =
    authUserDetail?.fname?.trim() || firstName?.trim() || 'Patient';

  const bmiJourney = data?.bmi_journey || [];

  if (loading) {
    return (
      <>
        <Header />
        <Loader />
      </>
    );
  }

  if (!bmiJourney.length) {
    return (
      <>
        <Header />
        <ScrollView
          contentContainerStyle={[
            styles.container,
            {paddingBottom: insets.bottom + 16},
          ]}>
          <View style={styles.pageHeader}>
            <Text style={styles.pageLabel}>WEIGHT LOSS JOURNEY</Text>
            <Text style={styles.pageTitle}>{displayName}'s Progress</Text>
            <Text style={styles.pageSubtitle}>
              Review your recorded weight changes and track your progress
              throughout your treatment.
            </Text>
          </View>
          <EmptyState />
        </ScrollView>
      </>
    );
  }

  const stats = calculateStats(bmiJourney, unit);
  const totalChange = stats.current - stats.start;
  const changeMeta = getChangeMeta(totalChange);
  const percentage = stats.start
    ? Math.abs((totalChange / stats.start) * 100).toFixed(1)
    : 0;

  const chartValues = bmiJourney.map(item => Number(item.weight_kg));
  const chartLabels = bmiJourney.map((item, i) => {
    if (bmiJourney.length > 6 && i % Math.ceil(bmiJourney.length / 5) !== 0) {
      return '';
    }
    const raw = item.order_date_readable || '';
    return raw.length > 6 ? raw.slice(0, 6) : raw;
  });

  return (
    <>
      <Header />
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {paddingBottom: insets.bottom + 16},
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Page header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageLabel}>WEIGHT LOSS JOURNEY</Text>
          <Text style={styles.pageTitle}>{displayName}'s Progress</Text>
          <Text style={styles.pageSubtitle}>
            Review your recorded weight changes and track your progress
            throughout your treatment.
          </Text>
        </View>

        {/* Overview card */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <View>
              <Text style={styles.overviewTitle}>Progress Overview</Text>
              <Text style={styles.overviewSubtitle}>
                Your weight statistics and progression chart.
              </Text>
            </View>
            <UnitTabs unit={unit} setUnit={setUnit} />
          </View>

          {/* Stats grid */}
          <View style={styles.statsGrid}>
            <StatCard
              title="STARTING WEIGHT"
              value={formatWeight(stats.start, unit)}
              description="Your first recorded weight"
              badge="Baseline"
              iconName="flag"
            />
            <StatCard
              title="CURRENT WEIGHT"
              value={formatWeight(stats.current, unit)}
              description="Your most recent weight"
              badge="Latest"
              iconName="user"
            />
            <StatCard
              title="TOTAL CHANGE"
              value={
                changeMeta.type === 'same'
                  ? formatWeight(0, unit)
                  : formatWeight(Math.abs(totalChange), unit)
              }
              description={getChangeDescription(changeMeta.type)}
              badge={changeMeta.type === 'same' ? '0%' : `${percentage}%`}
              iconName={
                changeMeta.type === 'gain' ? 'trending-up' : 'trending-down'
              }
              tone={changeMeta.tone}
              showMinus={changeMeta.type === 'loss'}
            />
            <StatCard
              title="TOTAL ORDERS"
              value={String(bmiJourney.length)}
              description="Recorded treatment orders"
              badge="Approved"
              iconName="clipboard"
            />
          </View>

          {/* Chart */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View style={styles.chartIconBox}>
                <Feather name="trending-down" size={15} color="#fff" />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.chartTitle}>Weight progression</Text>
                <Text style={styles.chartSubtitle}>
                  Changes across your recorded treatment orders.
                </Text>
              </View>
            </View>

            <View style={styles.chartRecordsBadge}>
              <Feather name="award" size={12} color={PRIMARY} />
              <Text style={styles.chartRecordsText}>
                {bmiJourney.length} records ·{' '}
                {unit === 'kg' ? 'Kilograms' : 'Stones / Pounds'}
              </Text>
            </View>

            <LineChart
              data={{
                labels: chartLabels,
                datasets: [{data: chartValues}],
              }}
              width={SCREEN_WIDTH - 64}
              height={240}
              yAxisSuffix={unit === 'kg' ? 'kg' : ''}
              formatYLabel={v =>
                unit === 'kg'
                  ? `${Math.round(v)}`
                  : `${kgToStonesPounds(Number(v)).stones}st`
              }
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(71, 49, 124, ${opacity})`,
                labelColor: () => '#94a3b8',
                propsForBackgroundLines: {
                  stroke: 'rgba(0,0,0,0.06)',
                  strokeDasharray: '4 4',
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: PRIMARY,
                  fill: '#fff',
                },
                propsForLabels: {
                  fontSize: 10,
                  fontFamily: Fonts.regular,
                },
              }}
              bezier
              style={styles.chartStyle}
              withInnerLines={false}
              withOuterLines={false}
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
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

  // Overview card
  overviewCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 16,
  },
  overviewHeader: {
    marginBottom: 16,
  },
  overviewTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: '#0f172a',
  },
  overviewSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 14,
  },

  // Unit tabs
  unitTabs: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 4,
    alignSelf: 'flex-start',
  },
  unitTab: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 9,
  },
  unitTabActive: {
    backgroundColor: 'rgba(71, 49, 124, 0.09)',
  },
  unitTabText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#64748b',
  },
  unitTabTextActive: {
    color: PRIMARY,
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    backgroundColor: '#fff',
    padding: 14,
  },
  statCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statIconBox: {
    width: 34,
    height: 34,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statBadgeText: {
    fontSize: 9.5,
    fontFamily: Fonts.medium,
  },
  statTitle: {
    fontSize: 9.5,
    fontFamily: Fonts.medium,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 19,
    fontFamily: Fonts.bold,
    marginBottom: 4,
  },
  statDescription: {
    fontSize: 10.5,
    fontFamily: Fonts.regular,
    color: '#94a3b8',
    lineHeight: 14,
  },

  // Chart card
  chartCard: {
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 14,
    backgroundColor: '#fff',
    padding: 14,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  chartIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 13.5,
    fontFamily: Fonts.bold,
    color: '#0f172a',
  },
  chartSubtitle: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: '#94a3b8',
    marginTop: 1,
  },
  chartRecordsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  chartRecordsText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: '#475569',
  },
  chartStyle: {
    borderRadius: 12,
    marginLeft: -16,
  },

  // Skeleton
  skeletonBlock: {
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    opacity: 0.6,
  },

  // Empty state
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(71, 49, 124, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: '#0f172a',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default WeightLossJourneyScreen;
