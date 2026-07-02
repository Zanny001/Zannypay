import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { saveJSON, loadJSON } from '../utils/storage';

const WalletContext = createContext(null);

const STORAGE_KEYS = {
  USER: 'zannypay:user',
  BALANCE: 'zannypay:balance',
  TXNS: 'zannypay:transactions',
  ONBOARDED: 'zannypay:onboarded',
};

const STARTING_BALANCE = 25000; // demo seed balance in NGN

export function WalletProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    (async () => {
      const [savedUser, savedBalance, savedTxns, savedOnboarded] = await Promise.all([
        loadJSON(STORAGE_KEYS.USER, null),
        loadJSON(STORAGE_KEYS.BALANCE, STARTING_BALANCE),
        loadJSON(STORAGE_KEYS.TXNS, []),
        loadJSON(STORAGE_KEYS.ONBOARDED, false),
      ]);
      setUser(savedUser);
      setBalance(savedBalance);
      setTransactions(savedTxns);
      setOnboarded(savedOnboarded);
      setLoading(false);
    })();
  }, []);

  const completeOnboarding = useCallback(async () => {
    setOnboarded(true);
    await saveJSON(STORAGE_KEYS.ONBOARDED, true);
  }, []);

  // --- Auth (mock local auth, replace with real backend later) ---
  const signup = useCallback(async ({ name, email, phone, pin }) => {
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      pin,
      accountNumber: '90' + Math.floor(10000000 + Math.random() * 89999999),
      createdAt: new Date().toISOString(),
    };
    await saveJSON(STORAGE_KEYS.USER, newUser);
    await saveJSON(STORAGE_KEYS.BALANCE, STARTING_BALANCE);
    setUser(newUser);
    setBalance(STARTING_BALANCE);
    setIsAuthenticated(true);
    return newUser;
  }, []);

  const login = useCallback(async (pin) => {
    if (!user) return { ok: false, error: 'No account found. Please sign up.' };
    if (user.pin !== pin) return { ok: false, error: 'Incorrect PIN.' };
    setIsAuthenticated(true);
    return { ok: true };
  }, [user]);

  const logout = useCallback(async () => {
    setIsAuthenticated(false);
    // Intentionally keep the user record, balance, and transactions so re-login works in this demo.
  }, []);

  // --- Transactions ---
  const addTransaction = useCallback(async (txn) => {
    const entry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...txn,
    };
    setTransactions((prev) => {
      const updated = [entry, ...prev];
      saveJSON(STORAGE_KEYS.TXNS, updated);
      return updated;
    });
    return entry;
  }, []);

  const updateBalance = useCallback(async (newBalance) => {
    setBalance(newBalance);
    await saveJSON(STORAGE_KEYS.BALANCE, newBalance);
  }, []);

  const transferMoney = useCallback(async ({ recipientName, recipientAccount, bank, amount, note }) => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return { ok: false, error: 'Enter a valid amount.' };
    if (amt > balance) return { ok: false, error: 'Insufficient balance.' };

    const newBalance = balance - amt;
    await updateBalance(newBalance);
    const txn = await addTransaction({
      type: 'debit',
      category: 'Transfer',
      title: `Transfer to ${recipientName}`,
      subtitle: `${bank} · ${recipientAccount}`,
      amount: amt,
      note: note || '',
      status: 'success',
    });
    return { ok: true, txn, newBalance };
  }, [balance, updateBalance, addTransaction]);

  const payBill = useCallback(async ({ billerName, category, amount, reference }) => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return { ok: false, error: 'Enter a valid amount.' };
    if (amt > balance) return { ok: false, error: 'Insufficient balance.' };

    const newBalance = balance - amt;
    await updateBalance(newBalance);
    const txn = await addTransaction({
      type: 'debit',
      category: category || 'Bill Payment',
      title: billerName,
      subtitle: reference ? `Ref: ${reference}` : '',
      amount: amt,
      status: 'success',
    });
    return { ok: true, txn, newBalance };
  }, [balance, updateBalance, addTransaction]);

  const fundWallet = useCallback(async (amount) => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return { ok: false, error: 'Enter a valid amount.' };
    const newBalance = balance + amt;
    await updateBalance(newBalance);
    const txn = await addTransaction({
      type: 'credit',
      category: 'Wallet Funding',
      title: 'Wallet Top-up',
      subtitle: 'Demo funding (sandbox)',
      amount: amt,
      status: 'success',
    });
    return { ok: true, txn, newBalance };
  }, [balance, updateBalance, addTransaction]);

  const value = {
    loading,
    onboarded,
    completeOnboarding,
    user,
    isAuthenticated,
    signup,
    login,
    logout,
    balance,
    transactions,
    transferMoney,
    payBill,
    fundWallet,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
