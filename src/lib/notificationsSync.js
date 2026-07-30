import { useState, useEffect } from 'react';

export function notifyNotificationsUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('notifications_state_changed'));
  }
}

export function getStoredNotificationTimes() {
  if (typeof window === 'undefined') return { readUntil: 0, clearedAt: 0 };
  const readUntil = Number(localStorage.getItem('notifications_read_until') || 0);
  const clearedAt = Number(localStorage.getItem('notifications_cleared_at') || 0);
  return { readUntil, clearedAt };
}

export function markAllNotificationsRead() {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  localStorage.setItem('notifications_read_until', String(now));
  notifyNotificationsUpdated();
}

export function clearAllNotifications() {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  localStorage.setItem('notifications_cleared_at', String(now));
  localStorage.setItem('notifications_read_until', String(now));
  notifyNotificationsUpdated();
}

export function useNotificationsSync() {
  const [times, setTimes] = useState(() => getStoredNotificationTimes());

  useEffect(() => {
    const sync = () => setTimes(getStoredNotificationTimes());
    window.addEventListener('notifications_state_changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('notifications_state_changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return times;
}
