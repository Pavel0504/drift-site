/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Settings, Statistics, Album, Stage, Event, Review, Photo, Wallpaper } from '../types';
import apiService from '../services/api';

interface DataContextType {
  settings: Settings;
  statistics: Statistics;
  albums: Album[];
  events: Event[];
  reviews: Review[];
  wallpapers: Wallpaper[];
  loading: boolean;
  updateSettings: (newSettings: Settings) => Promise<void>;
  updateStatistics: (newStats: Statistics) => Promise<void>;
  updateAlbums: (newAlbums: Album[]) => Promise<void>;
  updateEvents: (newEvents: Event[]) => Promise<void>;
  updateReviews: (newReviews: Review[]) => Promise<void>;
  updateWallpapers: (newWallpapers: Wallpaper[]) => Promise<void>;
  createAlbum: (albumData: CreateAlbumData) => Promise<boolean>;
  deleteAlbum: (albumId: string) => Promise<boolean>;
  updateAlbum: (albumId: string, albumData: UpdateAlbumData) => Promise<boolean>;
  getAlbumDetails: (albumId: string) => Promise<Album | null>;
  loadData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface PhotoInput {
  id: string;
  url: string;
  likes?: number;
  downloads?: number;
}

interface StageInput {
  id?: string;
  name: string;
  date: string;
  photos?: PhotoInput[];
}

interface CreateAlbumData {
  name: string;
  date: string;
  previewImage: string;
  coverMedia: string;
  mediaType: 'image' | 'video';
  stages?: StageInput[];
  likes?: number;
  downloads?: number;
}

interface UpdateAlbumData {
  name?: string;
  date?: string;
  previewImage?: string;
  coverMedia?: string;
  mediaType?: 'image' | 'video';
  stages?: StageInput[];
  likes?: number;
  downloads?: number;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    siteName: "AutoFrame Studio",
    logoUrl: "https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
    faviconUrl: "/favicon.ico",
    footerImageUrl: "https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
    telegram: "@autoframe_studio",
    telegramChannel: "@autoframe_channel",
    instagram: "@autoframe.studio",
    backgroundColor: "#1E1E1E"
  });

  const [statistics, setStatistics] = useState<Statistics>({
    totalLikes: 0,
    totalDownloads: 0,
    totalEvents: 0,
    totalAlbums: 0,
    albumStats: {}
  });

  const [albums, setAlbums] = useState<Album[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
     
      const [settingsData, statisticsData, albumsData, eventsData, reviewsData, wallpapersData] = await Promise.all([
        apiService.getSettings().catch(() => ({})),
        apiService.getStatistics().catch(() => ({})),
        apiService.getAlbums().catch(() => ({ albums: [] })),
        apiService.getEvents().catch(() => ({ events: [] })),
        apiService.getReviews().catch(() => ({ reviews: [] })),
        apiService.getWallpapers().catch(() => ({ wallpapers: [] }))
      ]);

      if (settingsData && Object.keys(settingsData).length > 0) {
        setSettings(settingsData as Settings);
      }

      if (statisticsData && Object.keys(statisticsData).length > 0) {
        setStatistics(statisticsData as Statistics);
      }

      if (albumsData?.albums) {
        const albumsWithDetails = await Promise.all(
          albumsData.albums.map(async (album: any) => {
            try {
              const details = await apiService.getAlbum(album.id);
              return details || album;
            } catch {
              return { ...album, stages: [] };
            }
          })
        );
        setAlbums(albumsWithDetails as Album[]);
      }

      if (eventsData?.events) {
        setEvents(eventsData.events as Event[]);
      }

      if (reviewsData?.reviews) {
        setReviews(reviewsData.reviews as Review[]);
      }

      if (wallpapersData?.wallpapers) {
        setWallpapers(wallpapersData.wallpapers as Wallpaper[]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getAlbumDetails = async (albumId: string): Promise<Album | null> => {
    try {
      return await apiService.getAlbum(albumId);
    } catch (error) {
      console.error('Error getting album details:', error);
      return null;
    }
  };

  const updateSettings = async (newSettings: Settings) => {
    try {
      await apiService.updateSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  const updateStatistics = async (newStats: Statistics) => {
    try {
      await apiService.updateStatistics(newStats);
      setStatistics(newStats);
    } catch (error) {
      console.error('Error updating statistics:', error);
      throw error;
    }
  };

  const updateAlbums = async (newAlbums: Album[]) => {
    setAlbums(newAlbums);
  };

  const updateEvents = async (newEvents: Event[]) => {
    try {
      setEvents(newEvents);
    } catch (error) {
      console.error('Error updating events:', error);
      throw error;
    }
  };

  const updateReviews = async (newReviews: Review[]) => {
    try {
      setReviews(newReviews);
    } catch (error) {
      console.error('Error updating reviews:', error);
      throw error;
    }
  };

  const updateWallpapers = async (newWallpapers: Wallpaper[]) => {
    try {
      setWallpapers(newWallpapers);
    } catch (error) {
      console.error('Error updating wallpapers:', error);
      throw error;
    }
  };

  const createAlbum = async (albumData: CreateAlbumData): Promise<boolean> => {
    try {
      const result = await apiService.createAlbum(albumData);
      if (result.success) {
        await loadData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating album:', error);
      return false;
    }
  };

  const deleteAlbum = async (albumId: string): Promise<boolean> => {
    try {
      const result = await apiService.deleteAlbum(albumId);
      if (result.success) {
        await loadData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting album:', error);
      return false;
    }
  };

  const updateAlbum = async (albumId: string, albumData: UpdateAlbumData): Promise<boolean> => {
    try {
      const result = await apiService.updateAlbum(albumId, albumData);
      if (result.success) {
        await loadData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating album:', error);
      return false;
    }
  };

  return (
    <DataContext.Provider value={{
      settings,
      statistics,
      albums,
      events,
      reviews,
      wallpapers,
      loading,
      updateSettings,
      updateStatistics,
      updateAlbums,
      updateEvents,
      updateReviews,
      updateWallpapers,
      createAlbum,
      deleteAlbum,
      updateAlbum,
      getAlbumDetails,
      loadData
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}