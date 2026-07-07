import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = '@zannypay_sync_queue';

export const SyncEngine = {
  // Add a failed action to the queue
  enqueue: async (actionType, payload) => {
    try {
      const existingQueue = await AsyncStorage.getItem(QUEUE_KEY);
      const queue = existingQueue ? JSON.parse(existingQueue) : [];
      
      queue.push({
        id: Date.now().toString(),
        type: actionType,
        payload,
        timestamp: new Date().toISOString()
      });
      
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      console.log(`[SyncEngine] Queued action: ${actionType}`);
    } catch (e) {
      console.error('[SyncEngine] Failed to enqueue action', e);
    }
  },

  // Process the queue when connection is restored
  processQueue: async () => {
    try {
      const existingQueue = await AsyncStorage.getItem(QUEUE_KEY);
      if (!existingQueue) return;
      
      const queue = JSON.parse(existingQueue);
      if (queue.length === 0) return;

      console.log(`[SyncEngine] Processing ${queue.length} queued items...`);
      
      // Here you would map over the queue and re-fire API requests
      // For now, we simulate a successful sync and clear the queue
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await AsyncStorage.removeItem(QUEUE_KEY);
      console.log('[SyncEngine] Queue synced and cleared successfully.');
    } catch (e) {
      console.error('[SyncEngine] Failed to process queue', e);
    }
  }
};
