import { useEffect, useState } from 'react';
import {
  DEFAULT_BANNERS,
  DEFAULT_CATEGORIES,
  DEFAULT_SITE_SETTINGS,
  DEMO_MOTORCYCLES,
} from '../data/demoData';
import {
  subscribePublicBanners,
  subscribePublicCategories,
  subscribePublicMotorcycles,
  subscribeSiteSettings,
} from '../services/firestoreService';
import type { Banner, Category, Motorcycle, SiteSettings } from '../types';

export interface StorefrontState {
  motorcycles: Motorcycle[];
  categories: Category[];
  banners: Banner[];
  settings: SiteSettings;
  loading: boolean;
  error: string | null;
  isUsingDemoFallback: boolean;
  retry: () => void;
}

export function useStorefrontData(): StorefrontState {
  const [liveMotorcycles, setLiveMotorcycles] = useState<Motorcycle[]>([]);
  const [liveCategories, setLiveCategories] = useState<Category[]>([]);
  const [liveBanners, setLiveBanners] = useState<Banner[]>([]);
  const [liveSettings, setLiveSettings] = useState<SiteSettings | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [motosLoaded, setMotosLoaded] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setError(null);
    const unsubSettings = subscribeSiteSettings(
      (data) => {
        setLiveSettings(data);
        setSettingsLoaded(true);
      },
      (err) => {
        setError(err.message);
        setSettingsLoaded(true);
      },
    );

    const unsubMotos = subscribePublicMotorcycles(
      (data) => {
        setLiveMotorcycles(data);
        setMotosLoaded(true);
      },
      (err) => {
        setError(err.message);
        setMotosLoaded(true);
      },
    );

    const unsubCats = subscribePublicCategories(
      (data) => {
        setLiveCategories(data);
        setCategoriesLoaded(true);
      },
      (err) => {
        setError(err.message);
        setCategoriesLoaded(true);
      },
    );

    const unsubBanners = subscribePublicBanners(
      (data) => setLiveBanners(data),
      () => undefined,
    );

    return () => {
      unsubSettings();
      unsubMotos();
      unsubCats();
      unsubBanners();
    };
  }, [reloadKey]);

  const loading = !settingsLoaded || !motosLoaded || !categoriesLoaded;
  const isUninitialized = !loading && liveSettings === null && liveMotorcycles.length === 0;

  return {
    motorcycles: isUninitialized ? DEMO_MOTORCYCLES : liveMotorcycles,
    categories:
      liveCategories.length > 0
        ? liveCategories
        : isUninitialized
          ? DEFAULT_CATEGORIES
          : [],
    banners: liveBanners.length > 0 ? liveBanners : DEFAULT_BANNERS,
    settings: liveSettings || DEFAULT_SITE_SETTINGS,
    loading,
    error,
    isUsingDemoFallback: isUninitialized,
    retry: () => setReloadKey((k) => k + 1),
  };
}
