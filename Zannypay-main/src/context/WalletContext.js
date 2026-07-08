import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { saveJSON, loadJSON } from '../utils/storage';
import { apiGet, apiPost, getSavedToken, saveToken, clearToken } from '../services/apiClient';

const WalletContext = createContext(null);

const STORAGE_KEYS = {
  USER: 'zannypay:user',
  BALANCE: 'zannypay:balance',
  TXNS: 'zannypay:transactions',
  ONBOARDED: 'zannypay:onboarded',
};

const STARTING_BALANCE = 0; // Aligned with server-side instantiation

export function WalletProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Synchronize local state with true backend state
  const syncWallet = useCallback(async () => {
    try {
      const data = await apiGet('/user/me');
      console.log('[Sync Engine] Received true payload:', data);

      if (data && data.user) {
        // 1. Process nested wallet balance object & convert DB string value to valid JS Number
        const walletBalance = data.user.wallet?.balance;
        if (walletBalance !== undefined) {
          const processedBalance = Number(walletBalance) || 0;
          setBalance(processedBalance);
          await saveJSON(STORAGE_KEYS.BALANCE, processedBalance);
        }

        // 2. Extract database transactions history array
        const remoteTxns = data.user.transactions || data.transactions;
        if (remoteTxns) {
          setTransactions(remoteTxns);
          await saveJSON(STORAGE_KEYS.TXNS, remoteTxns);
        }
      }
    } catch (error) {
      console.log('Background sync failed, relying on local storage:', error.message);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [savedUser, savedBalance, savedTxns, savedOnboarded, savedToken] = await Promise.all([
          loadJSON(STORAGE_KEYS.USER, null),
          loadJSON(STORAGE_KEYS.BALANCE, STARTING_BALANCE),
          loadJSON(STORAGE_KEYS.TXNS, []),
          loadJSON(STORAGE_KEYS.ONBOARDED, false),
          getSavedToken(),
        ]);

        setUser(savedUser);
        setBalance(Number(savedBalance) || 0);
        setTransactions(savedTxns);
        setOnboarded(savedOnboarded);

        if (savedToken && savedUser) {
          setToken(savedToken);
          setIsAuthenticated(true);
          syncWallet();
        }
      } catch (error) {
        console.error("Storage load error:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [syncWallet]);

  const completeOnboarding = useCallback(async () => {
    setOnboarded(true);
    await saveJSON(STORAGE_KEYS.ONBOARDED, true);
  }, []);

  const signup = useCallback(async ({ name, email, phone, pin }) => {
    try {
      const data = await apiPost('/auth/signup', { name, email, phone, pin });
      const { access_token, user: newUser } = data;

      await saveToken(access_token);
      await saveJSON(STORAGE_KEYS.USER, newUser);
      await saveJSON(STORAGE_KEYS.BALANCE, STARTING_BALANCE);

      setToken(access_token);
      setUser(newUser);
      setBalance(STARTING_BALANCE);
      setIsAuthenticated(true);

      return { ok: true, user: newUser };
    } catch (error) {
      return { ok: false, error: error.message || 'Signup failed.' };
    }
  }, []);

  const login = useCallback(async (phone, pin) => {
    try {
      const data = await apiPost('/auth/login', { phone, pin });
      const { access_token, user: loggedInUser } = data;

      await saveToken(access_token);
      await saveJSON(STORAGE_KEYS.USER, loggedInUser);

      setToken(access_token);
      setUser(loggedInUser);
      setIsAuthenticated(true);
      
      // Delay slightly to give headers/token time to settle into SecureStore
      setTimeout(() => {
        syncWallet();
      }, 300);

      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message || 'Invalid credentials.' };
    }
  }, [syncWallet]);

  const logout = useCallback(async () => {
    setIsAuthenticated(false);
    setToken(null);
    setUser(null);
    setBalance(0);
    setTransactions([]);
    await clearToken();
  }, []);

  const addTransactionOptimistically = useCallback(async (txn, amt) => {
    // Structural optimization: store both `createdAt` and `date` fields to align frontend formatting components
    const currentIsoString = new Date().toISOString();
    const entry = { 
      id: Date.now().toString(), 
      date: currentIsoString, 
      createdAt: currentIsoString,
      ...txn 
    };
    
    setTransactions((prev) => {
      const updated = [entry, ...prev];
      saveJSON(STORAGE_KEYS.TXNS, updated);
      return updated;
    });
    
    setBalance((prev) => {
      const updated = txn.type === 'credit' ? prev + amt : prev - amt;
      saveJSON(STORAGE_KEYS.BALANCE, updated);
      return updated;
    });
    return entry;
  }, []);

  const transferMoney = useCallback(async ({ recipientName, recipientAccount, bank, amount, note, pin }) => {
    try {
      const amt = Number(amount);
      if (!amt || amt <= 0) return { ok: false, error: 'Enter a valid amount.' };
      if (amt > balance) return { ok: false, error: 'Insufficient balance.' };

      const data = await apiPost(
        '/transactions/transfer',
        { recipientAccount, amount: amt, pin },
        { type: 'transfer', amount: amt, account: recipientAccount }
      );

      const txn = await addTransactionOptimistically({
        type: 'debit',
        category: 'Transfer',
        title: `Transfer to ${recipientName || recipientAccount}`,
        subtitle: `${bank || 'ZannyPay'} · ${recipientAccount}`,
        amount: amt,
        note: note || '',
        status: 'success',
        reference: data.transactionId || data.id
      }, amt);

      syncWallet();
      return { ok: true, txn };
    } catch (error) {
      return { ok: false, error: error.message || 'Transfer failed.' };
    }
  }, [balance, addTransactionOptimistically, syncWallet]);

  const payBill = useCallback(async ({ billerName, category, amount, reference, pin }) => {
    try {
      const amt = Number(amount);
      if (!amt || amt <= 0) return { ok: false, error: 'Enter a valid amount.' };
      if (amt > balance) return { ok: false, error: 'Insufficient balance.' };

      const data = await apiPost(
        '/transactions/bills',
        { billerName, category, amount: amt, reference, pin },
        category === 'Airtime' ? { type: 'airtime', amount: amt } : null
      );

      const txn = await addTransactionOptimistically({
        type: 'debit',
        category: category || 'Bill Payment',
        title: billerName,
        subtitle: reference ? `Ref: ${reference}` : '',
        amount: amt,
        status: 'success',
        reference: data.transactionId || data.id
      }, amt);

      syncWallet();
      return { ok: true, txn };
    } catch (error) {
      return { ok: false, error: error.message || 'Bill payment failed.' };
    }
  }, [balance, addTransactionOptimistically, syncWallet]);

  const fundWallet = useCallback(async (amount) => {
    try {
      const amt = Number(amount);
      if (!amt || amt <= 0) return { ok: false, error: 'Enter a valid amount.' };

      // Client-side guard aligned with backend constraints to prevent 400 Bad Request
      const MAX_FUNDING_LIMIT = 10000000;
      if (amt > MAX_FUNDING_LIMIT) {
        return { ok: false, error: 'Watch your spending. Amount cannot be processed online.' };
      }

      const data = await apiPost('/transactions/fund', { amount: amt });

      const txn = await addTransactionOptimistically({
        type: 'credit',
        category: 'Wallet Funding',
        title: 'Wallet Top-up',
        subtitle: 'Paystack Checkout',
        amount: amt,
        status: 'pending', // Accurately reflects pending webhook confirmation
        reference: data.reference || data.transactionId || data.id
      }, amt);

      syncWallet();
      return { ok: true, txn };
    } catch (error) {
      return { ok: false, error: error.message || 'Wallet funding failed.' };
    }
  }, [addTransactionOptimistically, syncWallet]);

  const value = {
    loading, onboarded, completeOnboarding, user, isAuthenticated,
    signup, login, logout, balance, transactions,
    transferMoney, payBill, fundWallet, syncWallet
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
