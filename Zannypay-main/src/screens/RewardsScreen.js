import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import Card from '../components/Card';

export default function RewardsScreen() {
  const [points, setPoints] = useState(1250);
  const [checkedIn, setCheckedIn] = useState(false);

  const handleCheckIn = () => {
    if (checkedIn) return;
    setPoints(prev => prev + 50);
    setCheckedIn(true);
    Alert.alert('Daily Reward Claimed!', 'You earned +50 ZannyPoints. Come back tomorrow for a streak bonus.');
  };

  const tasks = [
    { id: 1, title: 'Fund your wallet', reward: 200, icon: 'wallet', completed: true },
    { id: 2, title: 'Send money to a friend', reward: 150, icon: 'paper-plane', completed: false },
    { id: 3, title: 'Generate an Invoice', reward: 100, icon: 'document-text', completed: false },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Rewards Center</Text>
          <Text style={styles.subtitle}>Complete tasks to earn ZannyPoints</Text>
        </View>

        {/* Hero Points Card */}
        <View style={styles.heroCard}>
          <Ionicons name="star" size={32} color="#F5B700" style={styles.heroIcon} />
          <Text style={styles.pointsLabel}>Available Balance</Text>
          <Text style={styles.pointsValue}>{points.toLocaleString()} <Text style={styles.pts}>PTS</Text></Text>
          
          <TouchableOpacity 
            style={[styles.claimBtn, checkedIn && styles.claimedBtn]} 
            onPress={handleCheckIn}
            disabled={checkedIn}
          >
            <Text style={styles.claimBtnText}>
              {checkedIn ? 'Claimed Today' : 'Claim Daily +50'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Daily Missions</Text>

        {tasks.map(task => (
          <Card key={task.id} style={styles.taskCard}>
            <View style={styles.taskLeft}>
              <View style={[styles.iconWrap, task.completed && { backgroundColor: '#E7F8ED' }]}>
                <Ionicons name={task.icon} size={20} color={task.completed ? colors.success : colors.primary} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskReward}>+{task.reward} PTS</Text>
              </View>
            </View>
            {task.completed ? (
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            ) : (
              <TouchableOpacity style={styles.goBtn}>
                <Text style={styles.goBtnText}>GO</Text>
              </TouchableOpacity>
            )}
          </Card>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight },
  scroll: { padding: 20 },
  header: { marginBottom: 24, marginTop: 10 },
  title: { fontSize: 24, fontWeight: '800', color: colors.textDark },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  heroCard: { backgroundColor: colors.textDark, borderRadius: 20, padding: 30, alignItems: 'center', marginBottom: 30, position: 'relative', overflow: 'hidden' },
  heroIcon: { marginBottom: 10 },
  pointsLabel: { color: '#AAA', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  pointsValue: { color: '#F5B700', fontSize: 40, fontWeight: '800', marginVertical: 8 },
  pts: { fontSize: 18, color: '#fff' },
  claimBtn: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 20, marginTop: 10 },
  claimedBtn: { backgroundColor: '#333' },
  claimBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textDark, marginBottom: 16 },
  taskCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, marginBottom: 12 },
  taskLeft: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F0EBFC', alignItems: 'center', justifyContent: 'center' },
  taskTitle: { fontSize: 15, fontWeight: '600', color: colors.textDark },
  taskReward: { fontSize: 13, color: '#F5B700', fontWeight: '700', marginTop: 2 },
  goBtn: { backgroundColor: colors.bgLight, borderWidth: 1, borderColor: colors.primary, paddingVertical: 6, paddingHorizontal: 16, borderRadius: 12 },
  goBtnText: { color: colors.primary, fontWeight: '700', fontSize: 12 }
});
