import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from '../components/GradientButton';
import { colors } from '../theme/colors';
import { useWallet } from '../context/WalletContext';
import { formatCurrency } from '../utils/format';

const CATEGORIES = [
  { key: 'airtime', label: 'Airtime', icon: 'phone-portrait-outline' },
  { key: 'data', label: 'Data', icon: 'wifi-outline' },
  { key: 'electricity', label: 'Electricity', icon: 'flash-outline' },
  { key: 'tv', label: 'TV Subscription', icon: 'tv-outline' },
  { key: 'water', label: 'Water', icon: 'water-outline' },
  { key: 'internet', label: 'Internet', icon: 'globe-outline' },
];

const PROVIDERS = {
  airtime: ['MTN', 'Airtel', 'Glo', '9mobile'],
  data: ['MTN Data', 'Airtel Data', 'Glo Data', '9mobile Data'],
  electricity: ['EKEDC', 'IKEDC', 'AEDC', 'PHED'],
  tv: ['DSTV', 'GOtv', 'StarTimes'],
  water: ['Lagos Water Corp'],
  internet: ['Spectranet', 'Smile'],
};

export default function BillsScreen({ navigation, route }) {
  const { payBill, balance } = useWallet();
  const [category, setCategory] = useState(route?.params?.initialCategory || null);
  const [provider, setProvider] = useState('');
  const [reference, setReference] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => { setCategory(null); setProvider(''); setReference(''); setAmount(''); };

  const handlePay = async () => {
    if (!provider || !amount) {
      Alert.alert('Missing details', 'Select a provider and enter an amount.');
      return;
    }
    setLoading(true);
    const res = await payBill({
      billerName: `${provider}`,
      category: CATEGORIES.find((c) => c.key === category)?.label,
      amount,
      reference,
    });
    setLoading(false);
    if (!res.ok) {
      Alert.alert('Payment failed', res.error);
      return;
    }
    Alert.alert('Success', `Paid ${formatCurrency(amount)} to ${provider}.`, [
      { text: 'Done', onPress: () => { reset(); navigation.navigate('Main'); } },
    ]);
  };

  if (!category) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Pay Bills</Text>
        <Text style={styles.subtitle}>Balance: {formatCurrency(balance)}</Text>
        <View style={styles.grid}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity key={c.key} style={styles.gridItem} onPress={() => setCategory(c.key)}>
              <View style={styles.iconWrap}>
                <Ionicons name={c.icon} size={26} color={colors.primary} />
              </View>
              <Text style={styles.gridLabel}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 20 }}>
        <TouchableOpacity onPress={() => setCategory(null)} style={{ marginBottom: 16 }}>
          <Ionicons name="arrow-back" size={22} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.title}>{CATEGORIES.find((c) => c.key === category)?.label}</Text>

        <Text style={styles.label}>Provider</Text>
        <View style={styles.providerRow}>
          {(PROVIDERS[category] || []).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.providerChip, provider === p && styles.providerChipActive]}
              onPress={() => setProvider(p)}
            >
              <Text style={{ color: provider === p ? '#fff' : colors.textDark, fontWeight: '600' }}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{category === 'electricity' || category === 'tv' ? 'Meter / Smartcard Number' : 'Phone Number'}</Text>
        <TextInput style={styles.input} placeholder="Enter number" value={reference} onChangeText={setReference} keyboardType="number-pad" />

        <Text style={styles.label}>Amount</Text>
        <TextInput style={styles.input} placeholder="₦0.00" value={amount} onChangeText={setAmount} keyboardType="numeric" />

        <GradientButton title="Pay Now" onPress={handlePay} loading={loading} style={{ marginTop: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight, paddingTop: 20 },
  title: { fontSize: 22, fontWeight: '800', color: colors.textDark, paddingHorizontal: 24 },
  subtitle: { fontSize: 13, color: colors.textMuted, paddingHorizontal: 24, marginTop: 4, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginTop: 16 },
  gridItem: { width: '33%', alignItems: 'center', marginBottom: 24 },
  iconWrap: {
    width: 60, height: 60, borderRadius: 18, backgroundColor: '#F0EBFC',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  gridLabel: { fontSize: 12, color: colors.textDark, textAlign: 'center' },
  label: { fontSize: 13, color: colors.textDark, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  providerRow: { flexDirection: 'row', flexWrap: 'wrap' },
  providerChip: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 16,
    paddingVertical: 8, marginRight: 8, marginBottom: 8, backgroundColor: '#fff',
  },
  providerChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  input: {
    backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, borderWidth: 1, borderColor: colors.border,
  },
});
