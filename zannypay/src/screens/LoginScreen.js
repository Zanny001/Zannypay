import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useWallet } from '../context/WalletContext';

export default function LoginScreen({ navigation }) {
  const { user, login } = useWallet();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleKeyPress = (digit) => {
    if (pin.length >= 4) return;
    setPin(pin + digit);
  };

  const handleDelete = () => setPin(pin.slice(0, -1));

  React.useEffect(() => {
    if (pin.length === 4) {
      (async () => {
        setLoading(true);
        const res = await login(pin);
        setLoading(false);
        if (!res.ok) {
          Alert.alert('Login failed', res.error);
          setPin('');
        }
      })();
    }
  }, [pin]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</Text>
        <Text style={styles.subtitle}>Enter your 4-digit PIN</Text>
      </View>

      <View style={styles.dotsRow}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.dot, pin.length > i && styles.dotFilled]} />
        ))}
      </View>

      <View style={styles.keypad}>
        {['1','2','3','4','5','6','7','8','9','','0','del'].map((key, i) => {
          if (key === '') return <View key={i} style={styles.key} />;
          if (key === 'del') {
            return (
              <TouchableOpacity key={i} style={styles.key} onPress={handleDelete}>
                <Ionicons name="backspace-outline" size={22} color={colors.textDark} />
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity key={i} style={styles.key} onPress={() => handleKeyPress(key)}>
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {!user && (
        <TouchableOpacity style={{ marginTop: 24, alignSelf: 'center' }} onPress={() => navigation.replace('Signup')}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>No account yet? Sign up</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight, paddingHorizontal: 24, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 32 },
  welcome: { fontSize: 20, fontWeight: '800', color: colors.textDark },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 6 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 40 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: colors.primary, marginHorizontal: 8 },
  dotFilled: { backgroundColor: colors.primary },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  key: { width: '30%', aspectRatio: 1.4, alignItems: 'center', justifyContent: 'center' },
  keyText: { fontSize: 24, fontWeight: '600', color: colors.textDark },
});
