// src/services/api.ts

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

export interface ApiError {
  status: number;
  message: string;
}

export interface Album {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: number;
  name: string;
  date: string;
  location: string;
  description: string;
}

export interface Review {
  id: number;
  text: string;
  rating: number;
  author: string;
  createdAt: string;
}

export interface Settings {
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
  language: string;
}

export interface Statistics {
  totalUsers: number;
  totalAlbums: number;
  totalEvents: number;
  totalReviews: number;
}

export interface Wallpaper {
  id: number;
  url: string;
  title?: string;
  likes: number;
  createdAt: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    };

    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const message =
        (errorBody && (errorBody.message as string)) ||
        response.statusText ||
        'Unknown error';
      throw { status: response.status, message } as ApiError;
    }

    return (await response.json()) as T;
  }

  // File upload with FormData
  async uploadFile(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`File upload failed: ${response.status}`);
    }

    return response.json();
  }

  // Multiple file upload
  async uploadMultipleFiles(files: File[]): Promise<{ urls: string[] }> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const response = await fetch(`${API_BASE_URL}/upload/multiple`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Multiple file upload failed: ${response.status}`);
    }

    return response.json();
  }

  // Albums
  async getAlbums(): Promise<Album[]> {
    return this.request<Album[]>('/albums');
  }

  async getAlbum(id: number): Promise<Album> {
    return this.request<Album>(`/albums/${id}`);
  }

  async createAlbum(albumData: Omit<Album, 'id' | 'createdAt' | 'updatedAt'>): Promise<Album> {
    return this.request<Album>('/albums', {
      method: 'POST',
      body: JSON.stringify(albumData),
    });
  }

  async updateAlbum(
    id: number,
    albumData: Partial<Omit<Album, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Album> {
    return this.request<Album>(`/albums/${id}`, {
      method: 'PUT',
      body: JSON.stringify(albumData),
    });
  }

  async deleteAlbum(id: number): Promise<void> {
    return this.request<void>(`/albums/${id}`, { method: 'DELETE' });
  }

  // Events
  async getEvents(): Promise<Event[]> {
    return this.request<Event[]>('/events');
  }

  async createEvent(eventData: Omit<Event, 'id'>): Promise<Event> {
    return this.request<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(
    id: number,
    eventData: Partial<Omit<Event, 'id'>>
  ): Promise<Event> {
    return this.request<Event>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(id: number): Promise<void> {
    return this.request<void>(`/events/${id}`, { method: 'DELETE' });
  }

  // Reviews
  async getReviews(): Promise<Review[]> {
    return this.request<Review[]>('/reviews');
  }

  async createReview(
    reviewData: Omit<Review, 'id' | 'createdAt'>
  ): Promise<Review> {
    return this.request<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // Settings
  async getSettings(): Promise<Settings> {
    return this.request<Settings>('/settings');
  }

  async updateSettings(
    settingsData: Partial<Settings>
  ): Promise<Settings> {
    return this.request<Settings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  }

  // Statistics
  async getStatistics(): Promise<Statistics> {
    return this.request<Statistics>('/statistics');
  }

  async updateStatistics(
    statisticsData: Partial<Statistics>
  ): Promise<Statistics> {
    return this.request<Statistics>('/statistics', {
      method: 'PUT',
      body: JSON.stringify(statisticsData),
    });
  }

  // Wallpapers
  async getWallpapers(): Promise<Wallpaper[]> {
    return this.request<Wallpaper[]>('/wallpapers');
  }

  async createWallpapers(
    wallpapers: Partial<Wallpaper>[]
  ): Promise<Wallpaper[]> {
    return this.request<Wallpaper[]>('/wallpapers', {
      method: 'POST',
      body: JSON.stringify({ wallpapers }),
    });
  }

  async deleteWallpaper(id: number): Promise<void> {
    return this.request<void>(`/wallpapers/${id}`, { method: 'DELETE' });
  }

  async likeWallpaper(
    id: number,
    increment: boolean
  ): Promise<Wallpaper> {
    return this.request<Wallpaper>(`/wallpapers/${id}/like`, {
      method: 'POST',
      body: JSON.stringify({ increment }),
    });
  }

  async downloadWallpaper(id: number): Promise<{ url: string }> {
    return this.request<{ url: string }>(`/wallpapers/${id}/download`, {
      method: 'POST',
    });
  }

  // Download functions
  downloadImage(filename: string): void {
    window.open(`${API_BASE_URL}/download/image/${filename}`, '_blank');
  }

  downloadAlbum(albumId: number): void {
    window.open(`${API_BASE_URL}/download/album/${albumId}`, '_blank');
  }

  // Delete file
  async deleteFile(filename: string): Promise<void> {
    return this.request<void>(`/files/${filename}`, { method: 'DELETE' });
  }
}

export default new ApiService();
