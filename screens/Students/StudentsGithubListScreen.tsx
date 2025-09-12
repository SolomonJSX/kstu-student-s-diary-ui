import React from 'react'
import { View, StyleSheet } from 'react-native';
import StudentsList from './StudentsList';

const StudentsGithubListScreen = () => {
  return (
    <View style={styles.screenContainer}>
      <StudentsList />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
export default StudentsGithubListScreen