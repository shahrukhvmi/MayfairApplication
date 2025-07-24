import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from 'react-native';

const SwitchTabs = ({ tabs, selectedTab, onTabChange }) => {
  const { width } = useWindowDimensions();
  const tabWidth = (width - 36) / tabs.length; // subtract padding (16 left + 16 right)
  const translateX = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      const index = tabs.findIndex(tab => tab.value === selectedTab);
      Animated.spring(translateX, {
        toValue: tabWidth * index,
        useNativeDriver: true,
      }).start();
    }, [selectedTab]));

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { width: tabWidth * tabs.length }]}>
        {/* Sliding animated background */}
        <Animated.View
          style={[
            styles.slider,
            {
              width: tabWidth - 8,
              transform: [{ translateX }],
              marginHorizontal: 4,
            },
          ]}
        />
        {tabs.map((tab, index) => {
          const isActive = selectedTab === tab.value;
          return (
            <TouchableOpacity
              key={tab.value}
              onPress={() => onTabChange(tab.value)}
              style={[styles.tab, { width: tabWidth }]}>
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0ff',
    borderRadius: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  tab: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slider: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#4B0082',
    borderRadius: 30,
    top: 0,

  },

  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B0082',
    textTransform: 'capitalize'

  },
  activeTabText: {
    color: '#ffffff',
    textTransform: 'capitalize'

  },
});

export default SwitchTabs;
