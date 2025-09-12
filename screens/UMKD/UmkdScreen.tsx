import React from 'react'
import { View, StyleSheet } from 'react-native';
import UmkdSubjectLists from './UmkdSubjectLists';

const UmkdScreen = () => {
  return (
    <View style={styles.screenContainer}>
      <UmkdSubjectLists />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
export default UmkdScreen