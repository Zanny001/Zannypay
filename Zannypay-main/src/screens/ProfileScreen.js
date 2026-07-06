import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Switch, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import { colors } from '../theme/colors';
import { useWallet } from '../context/WalletContext';
import Card from '../components/Card';

export default function ProfileScreen() {
  const { user, logout } = useWallet();
  const navigation = useNavigation();
  
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [hasHardware, setHasHardware] = useState(false);
  const [pushNotes, setPushNotes] = useState(true);

  // Check hardware on mount
  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setHasHardware(compatible);
    })();
  }, []);

  const handleToggleBiometrics = async (newValue) => {
    if (newValue) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Enable Biometric Login for Zannypay',
        fallbackLabel: 'Use PIN',
      });
      
      if (result.success) {
        setBiometricsEnabled(true);
        Alert.alert('Success', 'Biometric authentication is now enabled.');
      } else {
        setBiometricsEnabled(false);
        Alert.alert('Authentication Failed', 'We could not verify your identity.');
      }
    } else {
      setBiometricsEnabled(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Secure Logout', 'Are you sure you want to end this session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.name || 'Z')[0].toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{user?.name || 'Zannypay Member'}</Text>
          <Text style={styles.phone}>{user?.phone || 'No Phone Linked'}</Text>
          <View style={styles.tierBadge}>
            <Ionicons name="shield-checkmark" size={12} color={colors.success} />
            <Text style={styles.tierText}>Verified Account · Tier 1 Limit</Text>
          </View>
        </View>

        <Text style={styles.sectionHeading}>Security Configuration</Text>
        <Card style={styles.cardMargin}>
          {hasHardware && (
            <View style={styles.settingRow}>
              <View style={styles.rowLeft}>
                <Ionicons name={Platform.OS === 'ios' ? "faceid" : "finger-print-outline"} size={20} color={colors.primary} />
                <Text style={styles.menuLabel}>Biometric Login</Text>
              </View>
              <Switch 
                value={biometricsEnabled} 
                onValueChange={handleToggleBiometrics} 
                trackColor={{ true: colors.primary, false: colors.border }} 
              />
            </View>
          )}
          <View style={[styles.settingRow, !hasHardware && { borderBottomWidth: 0 }]}>
            <View style={styles.rowLeft}>
              <Ionicons name="notifications-outline" size={20} color={colors.primary} />
              <Text style={styles.menuLabel}>Real-time Push Alerts</Text>
            </View>
            <Switch 
              value={pushNotes} 
              onValueChange={setPushNotes} 
              trackColor={{ true: colors.primary, false: colors.border }} 
            />
          </View>
        </Card>

        <Text style={styles.sectionHeading}>Support & Infrastructure</Text>
        <Card style={styles.cardMargin}>
          <TouchableOpacity style={styles.clickableMenu} onPress={() => navigation.navigate('Support')}>
            <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.menuLabel}>Help & Support Channels</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          <View style={[styles.clickableMenu, { borderBottomWidth: 0 }]}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.menuLabel}>App Version</Text>
            <Text style={{ marginLeft: 'auto', color: colors.textMuted, fontSize: 13 }}>v1.0.0 (Production)</Text>
          </View>
        </Card>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Secure Log Out</Text>
        </TouchableOpacity>
        
        <Text style={styles.footerText}>Secured by Zannypay Infrastructure</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight, paddingTop: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 26 },
  name: { fontSize: 18, fontWeight: '700', color: colors.textDark },
  phone: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  tierBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E7F8ED', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  tierText: { fontSize: 11, color: colors.success, fontWeight: '600', marginLeft: 4 },
  sectionHeading: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', paddingHorizontal: 20, marginBottom: 8, marginTop: 16 },
  cardMargin: { marginHorizontal: 20, paddingVertical: 4 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  clickableMenu: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  menuLabel: { fontSize: 14, color: colors.textDark, fontWeight: '500', marginLeft: 12 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, paddingVertical: 16, borderRadius: 14, backgroundColor: '#FEE2E2', marginTop: 32 },
  logoutText: { color: colors.danger, fontWeight: '700', marginLeft: 8 },
  footerText: { textAlign: 'center', color: colors.textMuted, fontSize: 11, marginTop: 16, marginBottom: 40 }
});
