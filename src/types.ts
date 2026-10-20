export type MediaKind = "anime" | "tv" | "movie";

export interface PosterMetadata {
  source: string;

  sourceUrl: string;

  title: string;

  originalTitle?: string;

  description?: string;

  rating?: number | null;

  ratingSource?: string;

  genres: string[];

  status?: string;

  year?: string;

  seasons?: number | null;

  episodes?: number | null;

  language?: string;

  imageUrl?: string;
}

export interface PosterState {
  image: string | null;

  title: string;

  subtitle: string;

  description: string;

  accent: string;

  rating: string;

  genres: string;

  status: string;

  seasons: string;

  language: string;

  year: string;
}
