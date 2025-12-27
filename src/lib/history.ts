interface HistoryItem {
  id: string;
  type: "document" | "vote" | "agenda" | "budget" | "network" | "settings" | "other";
  action: string;
  description: string;
  userId: string;
  userName: string;
  userImage?: string;
  timestamp: string;
  metadata?: {
    [key: string]: any;
  };
}

const STORAGE_KEY = "bamas_history";
const MAX_HISTORY_ITEMS = 1000; // Keep last 1000 items

export const logHistory = (
  type: HistoryItem["type"],
  action: string,
  description: string,
  userId: string,
  userName: string,
  userImage?: string,
  metadata?: { [key: string]: any }
) => {
  try {
    const historyItem: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      action,
      description,
      userId,
      userName,
      userImage,
      timestamp: new Date().toISOString(),
      metadata,
    };

    const stored = localStorage.getItem(STORAGE_KEY);
    let history: HistoryItem[] = [];

    if (stored) {
      try {
        history = JSON.parse(stored);
      } catch (error) {
        console.error("Error parsing history:", error);
      }
    }

    // Add new item at the beginning
    history.unshift(historyItem);

    // Keep only the last MAX_HISTORY_ITEMS
    if (history.length > MAX_HISTORY_ITEMS) {
      history = history.slice(0, MAX_HISTORY_ITEMS);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Error logging history:", error);
  }
};

export const getHistory = (): HistoryItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error getting history:", error);
  }
  return [];
};

export const clearHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing history:", error);
  }
};

