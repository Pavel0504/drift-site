// src/services/api.ts

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

export interface ApiError {
  status: number;
  message: string;
}

export interface Album {
  id: string;
  name: string;
  date: string;
  previewImage: string;
  coverMedia: string;
  mediaType: 'image' | 'video';
  likes: number;
  downloads: number;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  description: string;
  isCompleted?: boolean;
}

export interface Review {
  id: string;
  name: string;
  avatar: string;
  socialLink?: string;
  text: string;
  rating: number;
  date: string;
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
  id: string;
  url: string;
  title?: string;
  likes: number;
  downloads: number;
  createdAt: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    if (!response.ok) {
      let message = response.statusText;
      try {
        const body = await response.json();
        if (body?.error) message = body.error;
        if (body?.message) message = body.message;
      } catch { /* ignore parse errors */ }
      throw { status: response.status, message } as ApiError;
    }

    return (await response.json()) as T;
  }

  // File upload
  async uploadFile(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(`File upload failed: ${res.status}`);
    return res.json();
  }

  // Multiple file upload
  async uploadMultipleFiles(files: File[]): Promise<{ urls: string[] }> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const res = await fetch(`${API_BASE_URL}/upload/multiple`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(`Multiple file upload failed: ${res.status}`);
    return res.json();
  }

  // Albums
  async getAlbums(): Promise<Album[]> {
    // API returns { albums: Album[] }
    const data = await this.request<{ albums: Album[] }>('/albums');
    return data.albums;
  }

  async getAlbum(id: string): Promise<Album & { stages?: any[]; photos?: any[] }> {
    return this.request<Album & { stages?: any[]; photos?: any[] }>(`/albums/${id}`);
  }

  async createAlbum(payload: {
    name: string;
    date: string;
    previewImage: string;
    coverMedia: string;
    mediaType: 'image' | 'video';
    stages?: any[];
    photos?: any[];
  }): Promise<{ success: boolean; id: string }> {
    return this.request<{ success: boolean; id: string }>('/albums', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateAlbum(
    id: string,
    payload: Partial<Omit<Album, 'id'>> & { stages?: any[]; photos?: any[] }
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/albums/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteAlbum(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/albums/${id}`, {
      method: 'DELETE',
    });
  }

  // Events
  async getEvents(): Promise<Event[]> {
    // API returns { events: Event[] }
    const data = await this.request<{ events: Event[] }>('/events');
    return data.events;
  }

  async createEvent(payload: Omit<Event, 'id' | 'isCompleted'>): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateEvent(id: string, payload: Partial<Omit<Event, 'id'>>): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteEvent(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  // Reviews
  async getReviews(): Promise<Review[]> {
    // API returns { reviews: Review[] }
    const data = await this.request<{ reviews: Review[] }>('/reviews');
    return data.reviews;
  }

  async createReview(payload: Omit<Review, 'id' | 'date'>): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Settings
  async getSettings(): Promise<Settings> {
    return this.request<Settings>('/settings');
  }

  async updateSettings(payload: Partial<Settings>): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // Statistics
  async getStatistics(): Promise<Statistics> {
    return this.request<Statistics>('/statistics');
  }

  async updateStatistics(payload: Partial<Statistics>): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/statistics', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // Wallpapers
  async getWallpapers(): Promise<Wallpaper[]> {
    // API returns { wallpapers: Wallpaper[] }
    const data = await this.request<{ wallpapers: Wallpaper[] }>('/wallpapers');
    return data.wallpapers;
  }

  async createWallpapers(
    payload: Array<Partial<Omit<Wallpaper, 'id' | 'likes' | 'downloads' | 'createdAt'>>>
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/wallpapers', {
      method: 'POST',
      body: JSON.stringify({ wallpapers: payload }),
    });
  }

  async deleteWallpaper(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/wallpapers/${id}`, {
      method: 'DELETE',
    });
  }

  async likeWallpaper(id: string, increment: boolean): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/wallpapers/${id}/like`, {
      method: 'POST',
      body: JSON.stringify({ increment }),
    });
  }

  async downloadWallpaper(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/wallpapers/${id}/download`, {
      method: 'POST',
    });
  }

  // Helpers for downloads that open in new tab
  downloadImage(filename: string): void {
    window.open(`${API_BASE_URL}/download/image/${filename}`, '_blank');
  }

  downloadAlbum(albumId: string): void {
    window.open(`${API_BASE_URL}/download/album/${albumId}`, '_blank');
  }
}

export default new ApiService();
