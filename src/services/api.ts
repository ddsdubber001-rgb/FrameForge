import type {
  MediaKind,
  PosterMetadata,
} from "../types";

const REQUEST_TIMEOUT_MS = 12_000;

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();

  const timeout = window.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  try {
    const response = await fetch(url, {
      signal: controller.signal,

      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Metadata service returned HTTP ${response.status}.`,
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      throw new Error(
        "The metadata request timed out. Please try again.",
      );
    }

    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

interface JikanSearchResponse {
  data?: Array<{
    mal_id: number;

    title: string;

    title_english?: string | null;

    title_japanese?: string | null;

    synopsis?: string | null;

    score?: number | null;

    status?: string | null;

    year?: number | null;

    episodes?: number | null;

    images?: {
      jpg?: {
        large_image_url?: string;

        image_url?: string;
      };
    };

    genres?: Array<{
      name: string;
    }>;

    type?: string | null;
  }>;
}

interface TVMazeSearchItem {
  show: {
    id: number;

    name: string;

    url: string;

    summary?: string | null;

    status?: string | null;

    premiered?: string | null;

    language?: string | null;

    rating?: {
      average?: number | null;
    };

    genres?: string[];

    image?: {
      original?: string;

      medium?: string;
    } | null;

    _embedded?: {
      seasons?: Array<{
        id: number;
      }>;
    };
  };
}

function stripHtml(value = ""): string {
  const element = document.createElement("div");

  element.innerHTML = value;

  return (
    element.textContent ||
    element.innerText ||
    ""
  ).trim();
}

export async function searchMetadata(
  query: string,
  kind: MediaKind,
): Promise<PosterMetadata> {
  const term = query.trim();

  if (term.length < 2) {
    throw new Error(
      "Enter at least 2 characters to search.",
    );
  }

  /*
   * Anime metadata
   * Source: Jikan API / MyAnimeList catalogue
   */
  if (kind === "anime") {
    const data = await fetchJson<JikanSearchResponse>(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(
        term,
      )}&limit=8&sfw=true`,
    );

    const first = data.data?.[0];

    if (!first) {
      throw new Error(
        "No anime match found. Try another title.",
      );
    }

    return {
      source: "MyAnimeList via Jikan",

      sourceUrl: `https://myanimelist.net/anime/${first.mal_id}`,

      title: first.title_english || first.title,

      originalTitle:
        first.title_japanese || first.title,

      description:
        first.synopsis ||
        "No synopsis is available for this title.",

      rating:
        typeof first.score === "number"
          ? first.score
          : null,

      ratingSource: "MyAnimeList",

      genres:
        first.genres?.map(
          (genre) => genre.name,
        ) ?? [],

      status: first.status ?? "Unknown",

      year: first.year
        ? String(first.year)
        : undefined,

      episodes: first.episodes ?? null,

      language: "Japanese",

      imageUrl:
        first.images?.jpg?.large_image_url ||
        first.images?.jpg?.image_url,
    };
  }

  /*
   * TV show metadata
   * Source: TVMaze
   */
  if (kind === "tv") {
    const data = await fetchJson<TVMazeSearchItem[]>(
      `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(
        term,
      )}&embed=seasons`,
    );

    const show = data[0]?.show;

    if (!show) {
      throw new Error(
        "No TV show match found. Try another title.",
      );
    }

    return {
      source: "TVMaze",

      sourceUrl: show.url,

      title: show.name,

      description: stripHtml(
        show.summary ||
          "No synopsis is available for this title.",
      ),

      rating:
        typeof show.rating?.average === "number"
          ? show.rating.average
          : null,

      ratingSource: "TVMaze",

      genres: show.genres ?? [],

      status: show.status ?? "Unknown",

      year: show.premiered?.slice(0, 4),

      seasons:
        show._embedded?.seasons?.length ?? null,

      language: show.language ?? undefined,

      imageUrl:
        show.image?.original ||
        show.image?.medium,
    };
  }

  /*
   * Movie metadata is manual in this version.
   *
   * A movie provider such as TMDB or OMDb needs
   * separate API setup and configuration.
   */
  throw new Error(
    "Automatic movie metadata needs a movie API key. Anime search (Jikan) and TV show search (TVMaze) work without a key; enter movie details manually for now.",
  );
}
