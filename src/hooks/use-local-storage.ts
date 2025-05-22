import { useState, useEffect } from 'react';

function getValue<T>(key: string, initialValue: T | (() => T)): T {
  if (typeof window === 'undefined') {
    return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
  }
  const saved = window.localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Error parsing localStorage item:", e);
      // Fallback to initialValue if parsing fails
    }
  }
  return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
}

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => getValue(key, initialValue));

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error("Error setting localStorage item:", e);
      }
    }
  }, [key, value]);

  return [value, setValue];
}
