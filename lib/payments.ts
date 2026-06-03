import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  PURCHASES_ERROR_CODE,
} from 'react-native-purchases';
import { setProCache } from './scanLimits';

const ENTITLEMENT_ID = 'pro_access';

/**
 * Selects the correct API key per platform.
 * - iOS / Android: production keys from EAS build env vars
 * - Web: returns undefined (RevenueCat doesn't support web)
 */
export const getApiKey = (): string | undefined => {
  return Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
    default: undefined,
  });
};

let _initialized = false;

/**
 * Initialize RevenueCat. Called once at app startup from _layout.tsx.
 * Safe to call multiple times — guarded by `_initialized`.
 */
export const initializePayments = async (userId?: string): Promise<boolean> => {
  if (Platform.OS === 'web') {
    console.log('[RevenueCat] Web platform — IAP unavailable');
    return false;
  }
  if (_initialized) {
    if (userId) {
      try { await Purchases.logIn(userId); } catch {}
    }
    return true;
  }

  const apiKey = getApiKey();
  if (!apiKey || apiKey.length === 0) {
    console.warn('[RevenueCat] No API key found for', Platform.OS);
    return false;
  }

  try {
    await Purchases.configure({ apiKey, appUserID: userId ?? null });
    _initialized = true;
    console.log('[RevenueCat] Configured for', Platform.OS);

    // Sync entitlement cache on startup
    try {
      const info = await Purchases.getCustomerInfo();
      const isPro = !!info.entitlements.active[ENTITLEMENT_ID];
      await setProCache(isPro);
    } catch {}

    return true;
  } catch (error) {
    console.error('[RevenueCat] Configuration error:', error);
    return false;
  }
};

/**
 * Link a Blink user to their RevenueCat user. Call after sign-in.
 */
export const identifyUser = async (userId: string): Promise<void> => {
  if (Platform.OS === 'web' || !_initialized) return;
  try {
    await Purchases.logIn(userId);
  } catch (e) {
    console.error('[RevenueCat] logIn failed:', e);
  }
};

/**
 * Reset RevenueCat user to anonymous. Call after sign-out.
 */
export const resetUser = async (): Promise<void> => {
  if (Platform.OS === 'web' || !_initialized) return;
  try {
    await Purchases.logOut();
    await setProCache(false);
  } catch (e) {
    console.error('[RevenueCat] logOut failed:', e);
  }
};

/**
 * Hook: fetch available subscription packages from the current offering.
 */
export const usePackages = () => {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = useCallback(async () => {
    if (Platform.OS === 'web') {
      setIsLoading(false);
      setError('In-app purchases are only available on iOS and Android.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const offerings = await Purchases.getOfferings();
      const current = offerings.current;
      if (!current) {
        setPackages([]);
        setError('No offering available. Please try again later.');
      } else {
        setPackages(current.availablePackages);
      }
    } catch (e: any) {
      console.error('[RevenueCat] getOfferings error:', e);
      setError(e?.message ?? 'Could not load subscription options.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  return { packages, isLoading, error, refetch: fetchPackages };
};

/**
 * Hook: subscribe to customer info with real-time updates.
 * Returns whether user has the `pro_access` entitlement.
 */
export const useCustomerInfo = () => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    let listener: ((info: CustomerInfo) => void) | null = null;

    (async () => {
      try {
        const info = await Purchases.getCustomerInfo();
        if (mounted) setCustomerInfo(info);
      } catch (e) {
        console.error('[RevenueCat] getCustomerInfo error:', e);
      } finally {
        if (mounted) setIsLoading(false);
      }

      listener = (info: CustomerInfo) => {
        if (mounted) {
          setCustomerInfo(info);
          const isPro = !!info.entitlements.active[ENTITLEMENT_ID];
          setProCache(isPro).catch(() => {});
        }
      };
      Purchases.addCustomerInfoUpdateListener(listener);
    })();

    return () => {
      mounted = false;
      if (listener) Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, []);

  const isPro = !!customerInfo?.entitlements.active[ENTITLEMENT_ID];

  return { customerInfo, isPro, isLoading };
};

export interface PurchaseResult {
  success: boolean;
  cancelled: boolean;
  error?: string;
}

/**
 * Purchase a package. Returns a result object — never throws.
 */
export const purchasePackage = async (pkg: PurchasesPackage): Promise<PurchaseResult> => {
  if (Platform.OS === 'web') {
    return { success: false, cancelled: false, error: 'Purchases unavailable on web.' };
  }
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isPro = !!customerInfo.entitlements.active[ENTITLEMENT_ID];
    await setProCache(isPro);
    return { success: isPro, cancelled: false };
  } catch (e: any) {
    if (e?.userCancelled || e?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      return { success: false, cancelled: true };
    }
    console.error('[RevenueCat] Purchase error:', e);
    return {
      success: false,
      cancelled: false,
      error: e?.message ?? 'Purchase failed. Please try again.',
    };
  }
};

/**
 * Restore previous purchases. Returns whether Pro was restored.
 */
export const restorePurchases = async (): Promise<PurchaseResult> => {
  if (Platform.OS === 'web') {
    return { success: false, cancelled: false, error: 'Restore unavailable on web.' };
  }
  try {
    const info = await Purchases.restorePurchases();
    const isPro = !!info.entitlements.active[ENTITLEMENT_ID];
    await setProCache(isPro);
    return { success: isPro, cancelled: false };
  } catch (e: any) {
    console.error('[RevenueCat] Restore error:', e);
    return {
      success: false,
      cancelled: false,
      error: e?.message ?? 'Could not restore purchases.',
    };
  }
};

/**
 * Helper to extract package by lookup key.
 */
export const findPackage = (
  packages: PurchasesPackage[],
  identifier: '$rc_monthly' | '$rc_annual'
): PurchasesPackage | undefined => {
  return packages.find((p) => p.identifier === identifier);
};
