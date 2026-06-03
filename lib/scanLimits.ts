import AsyncStorage from '@react-native-async-storage/async-storage';

const COUNT_KEY = 'cr_scan_count';
const MONTH_KEY = 'cr_scan_month';
const PRO_CACHE_KEY = 'cr_pro_cached';

export const FREE_LIMIT = 3;

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}`;
}

/**
 * Pro status cache. Source of truth = RevenueCat customer info (synced on init,
 * on purchase, on restore, and via real-time listener in useCustomerInfo).
 * This cache provides instant UI for offline + first paint.
 */
export async function isPro(): Promise<boolean> {
  try {
    const cached = await AsyncStorage.getItem(PRO_CACHE_KEY);
    return cached === '1';
  } catch {
    return false;
  }
}

export async function setProCache(pro: boolean) {
  await AsyncStorage.setItem(PRO_CACHE_KEY, pro ? '1' : '0');
}

export async function getScanCount(): Promise<number> {
  const month = await AsyncStorage.getItem(MONTH_KEY);
  if (month !== currentMonth()) {
    await AsyncStorage.setItem(MONTH_KEY, currentMonth());
    await AsyncStorage.setItem(COUNT_KEY, '0');
    return 0;
  }
  const v = await AsyncStorage.getItem(COUNT_KEY);
  return v ? parseInt(v, 10) : 0;
}

export async function incrementScanCount(): Promise<number> {
  const cur = await getScanCount();
  const next = cur + 1;
  await AsyncStorage.setItem(COUNT_KEY, String(next));
  await AsyncStorage.setItem(MONTH_KEY, currentMonth());
  return next;
}

export async function canScan(): Promise<{ allowed: boolean; remaining: number; pro: boolean }> {
  const pro = await isPro();
  if (pro) return { allowed: true, remaining: Infinity, pro: true };
  const used = await getScanCount();
  return { allowed: used < FREE_LIMIT, remaining: Math.max(0, FREE_LIMIT - used), pro: false };
}
