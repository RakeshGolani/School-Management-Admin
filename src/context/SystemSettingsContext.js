'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSystemSettingsAction } from '@/actions/systemSettingsActions';

const SystemSettingsContext = createContext({
  systemSettings: null,
  loading: true,
  refreshSettings: async () => {}
});

export function SystemSettingsProvider({ children }) {
  const [systemSettings, setSystemSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await getSystemSettingsAction();
      if (res.success && res.data) {
        setSystemSettings(res.data);
      }
    } catch (err) {
      console.error('Failed to load system settings in context:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <SystemSettingsContext.Provider value={{ systemSettings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SystemSettingsContext.Provider>
  );
}

export function useSystemSettings() {
  return useContext(SystemSettingsContext);
}
