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
import {Fonts} from '../utils/fonts';

const SwitchTabs = ({ tabs, selectedTab, onTabChange }) => {
  const { width } = useWindowDimensions();
  const tabWidth = (width - 72) / tabs.length; // subtract card + screen padding
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
    marginBottom: 22,
    alignItems: 'flex-start',
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#f1f0f7',
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  tab: {
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slider: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#47317c',
    borderRadius: 9,
    top: 0,
  },

  tabText: {
    fontSize: 13,
    color: '#64748b',
    textTransform: 'capitalize',
    fontFamily: Fonts.medium,
  },
  activeTabText: {
    color: '#ffffff',
    textTransform: 'capitalize',
  },
});

export default SwitchTabs;
