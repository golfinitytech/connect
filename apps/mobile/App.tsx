import React from 'react';
import { WebView } from 'react-native-webview';
import { StyleSheet, View, StatusBar } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <WebView 
        source={{ uri: 'http://103.188.52.30:8085/' }} 
        style={styles.webview}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
});
