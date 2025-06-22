export interface Settings {
  siteName: string;
  logoUrl: string;
  faviconUrl: string;
  footerImageUrl: string;
  telegram: string;
  telegramChannel: string;
  instagram: string;
  backgroundColor: string;
}

export interface Statistics {
  totalLikes: number;
  totalDownloads: number;
  totalEvents: number;
  totalAlbums: number;
  albumStats: Record<string, { likes: number; downloads: number; photos: number }>;
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
  stages: Stage[];
}

export interface Stage {
  id: string;
  name: string;
  date: string;
  photos: Photo[];
}

export interface Photo {
  id: string;
  url: string;
  likes: number;
  downloads: number;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  address: string;
  organizerUrl?: string;
  isCompleted: boolean;
}

export interface Review {
  id: string;
  name: string;
  avatar: string;
  socialLink?: string;
  rating: number;
  text: string;
  date: string;
}

export interface Wallpaper {
  id: string;
  url: string;
  name: string;
  likes: number;
  downloads: number;
  createdAt: string;
}