import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import GradientButton from './GradientButton';
import { colors } from '../theme/colors';

export default function FundModal({ visible, onClose, amount, setAmount, onFund, loading }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Fund Wallet</Text>
          <Text style={styles.modalSubtitle}>Sandbox top-up — no real money is moved.</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Enter amount"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            autoFocus
          />
          <GradientButton title="Add to Wallet" onPress={onFund} loading={loading} />
          <TouchableOpacity style={{ marginTop: 14, alignItems: 'center' }} onPress={onClose}>
            <Text style={{ color: colors.textMuted }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.textDark },
  modalSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 4, marginBottom: 18 },
  modalInput: { backgroundColor: colors.bgLight, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, marginBottom: 18, borderWidth: 1, borderColor: colors.border },
});

