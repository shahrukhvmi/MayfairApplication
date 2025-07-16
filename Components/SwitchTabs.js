import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';

const SwitchTabs = ({tabs, selectedTab, onTabChange}) => {
  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab, index) => {
        const isActive = selectedTab === tab.value;
        const isLast = index === tabs.length - 1;

        return (
          <TouchableOpacity
            key={tab.value}
            onPress={() => onTabChange(tab.value)}
            style={[
              styles.tabButton,
              isActive && styles.activeTab,
              !isLast && styles.borderRight,
            ]}>
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#15803d', // green-700
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  activeTab: {
    backgroundColor: '#dcfce7', // green-100
  },
  borderRight: {
    borderRightWidth: 1,
    borderColor: '#000000',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  activeTabText: {
    color: '#000000',
  },
});

export default SwitchTabs;
