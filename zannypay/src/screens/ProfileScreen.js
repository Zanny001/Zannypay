import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useWallet } from '../context/WalletContext';
import Card from '../components/Card';

const MENU = [
  { icon: 'person-outline', label: 'Personal Information' },
  { icon: 'shield-checkmark-outline', label: 'Security & PIN' },
  { icon: 'card-outline', label: 'Linked Bank Accounts' },
  { icon: 'notifications-outline', label: 'Notifications' },
  { icon: 'help-circle-outline', label: 'Help & Support' },
];

export default function ProfileScreen() {
  const { user, logout } = useWallet();

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.name || 'N')[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.phone}>{user?.phone}</Text>
      </View>

      <Card style={{ marginHorizontal: 20, marginBottom: 20 }}>
        {MENU.map((item, i) => (
          <TouchableOpacity key={item.label} style={[styles.menuItem, i === MENU.length - 1 && { borderBottomWidth: 0 }]}>
            <Ionicons name={item.icon} size={20} color={colors.primary} style={{ marginRight: 14 }} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        ))}
      </Card>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight, paddingTop: 40 },
  header: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 26 },
  name: { fontSize: 18, fontWeight: '700', color: colors.textDark },
  phone: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  menuLabel: { fontSize: 14, color: colors.textDark, fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.danger },
  logoutText: { color: colors.danger, fontWeight: '700', marginLeft: 8 },
});
