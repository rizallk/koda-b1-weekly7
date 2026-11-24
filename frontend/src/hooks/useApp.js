import { AppContext } from '@/context/App/AppContext';
import { useContext } from 'react';

export function useApp() {
  const context = useContext(AppContext);

  if (context === null) {
    throw new Error('useApp harus digunakan di dalam AppProvider.');
  }

  return context;
}
