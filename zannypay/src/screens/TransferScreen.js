import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from '../components/GradientButton';
import { colors } from '../theme/colors';
import { useWallet } from '../context/WalletContext';
import { formatCurrency } from '../utils/format';

const BANKS = ['GTBank', 'Access Bank', 'Zenith Bank', 'UBA', 'First Bank', 'Opay', 'Kuda'];

export default function TransferScreen({ navigation }) {
  const { transferMoney, balance } = useWallet();
  const [bank, setBank] = useState('');
  const [account, setAccount] = useState('');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBanks, setShowBanks] = useState(false);

  const handleTransfer = async () => {
    if (!bank || account.length < 10 || !name || !amount) {
      Alert.alert('Missing details', 'Please fill in bank, 10-digit account number, name and amount.');
      return;
    }
    setLoading(true);
    const res = await transferMoney({ recipientName: name, recipientAccount: account, bank, amount, note });
    setLoading(false);
    if (!res.ok) {
      Alert.alert('Transfer failed', res.error);
      return;
    }
    Alert.alert('Success', `You sent ${formatCurrency(amount)} to ${name}.`, [
      { text: 'Done', onPress: () => navigation.navigate('Main') },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Send Money</Text>
        <Text style={styles.balance}>Balance: {formatCurrency(balance)}</Text>

        <Text style={styles.label}>Bank</Text>
        <TouchableOpacity style={styles.selectInput} onPress={() => setShowBanks(!showBanks)}>
          <Text style={{ color: bank ? colors.textDark : colors.textMuted }}>{bank || 'Select recipient bank'}</Text>
          <Ionicons name={showBanks ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
        </TouchableOpacity>
        {showBanks && (
          <View style={styles.dropdown}>
            {BANKS.map((b) => (
              <TouchableOpacity key={b} style={styles.dropdownItem} onPress={() => { setBank(b); setShowBanks(false); }}>
                <Text>{b}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Account Number</Text>
        <TextInput style={styles.input} placeholder="0123456789" value={account} onChangeText={setAccount} keyboardType="number-pad" maxLength={10} />

        <Text style={styles.label}>Recipient Name</Text>
        <TextInput style={styles.input} placeholder="e.g. Chidinma Okafor" value={name} onChangeText={setName} />

        <Text style={styles.label}>Amount</Text>
        <TextInput style={styles.input} placeholder="₦0.00" value={amount} onChangeText={setAmount} keyboardType="numeric" />

        <Text style={styles.label}>Note (optional)</Text>
        <TextInput style={styles.input} placeholder="What's this for?" value={note} onChangeText={setNote} />

        <GradientButton title="Send Money" onPress={handleTransfer} loading={loading} style={{ marginTop: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight },
  scroll: { padding: 24, paddingTop: 40 },
  title: { fontSize: 22, fontWeight: '800', color: colors.textDark },
  balance: { fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: 24 },
  label: { fontSize: 13, color: colors.textDark, fontWeight: '600', marginBottom: 6, marginTop: 4 },
  input: {
    backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, marginBottom: 14, borderWidth: 1, borderColor: colors.border,
  },
  selectInput: {
    backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    marginBottom: 6, borderWidth: 1, borderColor: colors.border,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  dropdown: {
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    marginBottom: 14, overflow: 'hidden',
  },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
});
