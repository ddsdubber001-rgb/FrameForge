import { MediaItem } from '../types';

export async function searchMedia(query: string): Promise<MediaItem[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const animeRes = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`);
    const animeData = await animeRes.json();
    
    const animeResults: MediaItem[] = (animeData.data || []).map((item: any) => ({
      id: `anime-${item.mal_id}`,
      title: item.title_english || item.title,
      type: 'anime',
      imageUrl: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
      rating: item.score ? `${item.score} / 10` : 'N/A',
      genres: (item.genres || []).map((g: any) => g.name),
      status: item.status || 'Finished',
      year: item.year ? item.year.toString() : (item.aired?.from ? new Date(item.aired.from).getFullYear().toString() : '2024'),
      episodes: item.episodes
    }));

    const tvRes = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
    const tvData = await tvRes.json();

    const tvResults: MediaItem[] = (tvData || []).slice(0, 5).map((item: any) => {
      const show = item.show;
      return {
        id: `tv-${show.id}`,
        title: show.name,
        type: 'tv',
        imageUrl: show.image?.original || show.image?.medium || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1000&auto=format&fit=crop',
        rating: show.rating?.average ? `${show.rating.average} / 10` : 'N/A',
        genres: show.genres || [],
        status: show.status || 'Running',
        year: show.premiered ? show.premiered.substring(0, 4) : '2024'
      };
    });

    return [...animeResults, ...tvResults];
  } catch (error) {
    console.error('Error fetching media search results:', error);
    return [];
  }
}
