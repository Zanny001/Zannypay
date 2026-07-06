import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useWallet } from '../context/WalletContext';

export default function FundScreen({ navigation }) {
  const { fundWallet } = useWallet();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFund = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return Alert.alert('Error', 'Please enter a valid amount.');
    }

    setLoading(true);
    // Calls the updated context, which hits /api/v1/transactions/fund
    const response = await fundWallet(amount);
    setLoading(false);

    if (response.ok) {
      Alert.alert('Success', `₦${amount} added to your wallet!`);
      navigation.goBack(); // Return to dashboard
    } else {
      Alert.alert('Funding Failed', response.error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fund Wallet</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.currency}>₦</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleFund} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Top Up Now</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderColor: '#007AFF', paddingBottom: 10, marginBottom: 40 },
  currency: { fontSize: 30, fontWeight: 'bold', marginRight: 10 },
  input: { flex: 1, fontSize: 30, fontWeight: 'bold' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

