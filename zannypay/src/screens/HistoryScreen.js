import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { colors } from '../theme/colors';
import { useWallet } from '../context/WalletContext';
import TransactionRow from '../components/TransactionRow';

export default function HistoryScreen() {
  const { transactions } = useWallet();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Transaction History</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 }}
        renderItem={({ item }) => <TransactionRow txn={item} />}
        ListEmptyComponent={<Text style={styles.empty}>No transactions yet.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight, paddingTop: 20 },
  title: { fontSize: 22, fontWeight: '800', color: colors.textDark, paddingHorizontal: 20, marginBottom: 10 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40 },
});
