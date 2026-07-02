import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { gradients, colors } from '../theme/colors';
import { formatCurrency, maskAccount } from '../utils/format';
import { useWallet } from '../context/WalletContext';
import TransactionRow from '../components/TransactionRow';
import Card from '../components/Card';
import GradientButton from '../components/GradientButton';

const QUICK_ACTIONS = [
  { key: 'Transfer', icon: 'swap-horizontal', label: 'Transfer' },
  { key: 'Bills', icon: 'receipt-outline', label: 'Bills' },
  { key: 'Airtime', icon: 'phone-portrait-outline', label: 'Airtime', category: 'Airtime' },
  { key: 'Fund', icon: 'add-circle-outline', label: 'Fund Wallet' },
];

export default function DashboardScreen({ navigation }) {
  const { user, balance, transactions, fundWallet } = useWallet();
  const [hidden, setHidden] = useState(false);
  const [fundModalVisible, setFundModalVisible] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [funding, setFunding] = useState(false);

  const handleQuickAction = (key) => {
    if (key === 'Fund') return setFundModalVisible(true);
    if (key === 'Bills') return navigation.navigate('Bills');
    if (key === 'Airtime') return navigation.navigate('Bills', { initialCategory: 'airtime' });
    navigation.navigate(key);
  };

  const handleConfirmFund = async () => {
    setFunding(true);
    const res = await fundWallet(fundAmount);
    setFunding(false);
    if (!res.ok) {
      Alert.alert('Error', res.error);
      return;
    }
    setFundModalVisible(false);
    setFundAmount('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.hello}>Hello, {user?.name?.split(' ')[0] || 'there'} 👋</Text>
            <Text style={styles.account}>{maskAccount(user?.accountNumber || '0000')}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(user?.name || 'N')[0].toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <LinearGradient colors={gradients.primary} style={styles.balanceCard}>
          <View style={styles.balanceTopRow}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <TouchableOpacity onPress={() => setHidden(!hidden)}>
              <Ionicons name={hidden ? 'eye-off' : 'eye'} size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceValue}>
            {hidden ? '••••••' : formatCurrency(balance)}
          </Text>
          <View style={styles.cardChipRow}>
            <MaterialCommunityIcons name="wifi" size={20} color="#F5B700" style={{ transform: [{ rotate: '90deg' }] }} />
            <Text style={styles.cardTag}>Zannypay Virtual Wallet</Text>
          </View>
        </LinearGradient>

        <View style={styles.quickActions}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity key={action.key} style={styles.actionItem} onPress={() => handleQuickAction(action.key)}>
              <View style={styles.actionIconWrap}>
                <Ionicons name={action.icon} size={22} color={colors.primary} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <Card style={{ marginHorizontal: 20 }}>
          {transactions.length === 0 ? (
            <Text style={styles.empty}>No transactions yet. Try a transfer or bill payment!</Text>
          ) : (
            transactions.slice(0, 5).map((txn) => <TransactionRow key={txn.id} txn={txn} />)
          )}
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={fundModalVisible} transparent animationType="slide" onRequestClose={() => setFundModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Fund Wallet</Text>
            <Text style={styles.modalSubtitle}>Sandbox top-up — no real money is moved.</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter amount"
              keyboardType="numeric"
              value={fundAmount}
              onChangeText={setFundAmount}
              autoFocus
            />
            <GradientButton title="Add to Wallet" onPress={handleConfirmFund} loading={funding} />
            <TouchableOpacity style={{ marginTop: 14, alignItems: 'center' }} onPress={() => setFundModalVisible(false)}>
              <Text style={{ color: colors.textMuted }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
  },
  hello: { fontSize: 17, fontWeight: '700', color: colors.textDark },
  account: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700' },
  balanceCard: { marginHorizontal: 20, borderRadius: 20, padding: 22, marginBottom: 20 },
  balanceTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { color: '#E6DEFF', fontSize: 13 },
  balanceValue: { color: '#fff', fontSize: 32, fontWeight: '800', marginTop: 6 },
  cardChipRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  cardTag: { color: '#E6DEFF', fontSize: 12, marginLeft: 8 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 24 },
  actionItem: { alignItems: 'center', width: '23%' },
  actionIconWrap: {
    width: 52, height: 52, borderRadius: 16, backgroundColor: '#F0EBFC',
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  actionLabel: { fontSize: 11, color: colors.textDark, textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textDark },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  empty: { color: colors.textMuted, textAlign: 'center', paddingVertical: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.textDark },
  modalSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 4, marginBottom: 18 },
  modalInput: {
    backgroundColor: colors.bgLight, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, marginBottom: 18, borderWidth: 1, borderColor: colors.border,
  },
});
