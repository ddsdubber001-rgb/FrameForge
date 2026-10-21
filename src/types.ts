export interface MediaItem {
  id: string | number;
  title: string;
  type: 'anime' | 'movie' | 'tv';
  imageUrl: string;
  rating: string | number;
  genres: string[];
  status: string;
  year: string;
  episodes?: number;
  synopsis?: string;
}

export interface OverlaySettings {
  title: string;
  secondaryTitle: string;
  rating: string;
  status: string;
  genres: string[];
  year: string;
  overlayStyle: 'cinematic' | 'minimal' | 'cyberpunk' | 'glass';
  fontFamily: string;
  accentColor: string;
  opacity: number;
}
