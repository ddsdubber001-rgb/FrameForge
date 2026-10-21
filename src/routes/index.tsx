import { createFileRoute } from "@tanstack/react-router";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  Download,
  Film,
  Image as ImageIcon,
  LoaderCircle,
  RotateCcw,
  Search,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { searchMetadata } from "../services/api";
import { drawPoster, exportPosterPng } from "../utils/canvas";
import type { MediaKind, PosterMetadata } from "../types";

const initialState = {
  image: null as string | null,
  title: "YOUR TITLE",
  subtitle: "",
  description: "A new adventure begins.",
  accent: "#a78bfa",
  rating: "",
  ratingSource: "",
  genres: "",
  status: "",
  seasons: "",
  episodes: "",
  language: "",
  year: "",
};

function Studio() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [poster, setPoster] = useState(initialState);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<MediaKind>("anime");
  const [loading, setLoading] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const [metadata, setMetadata] = useState<PosterMetadata | null>(null);
  const [exporting, setExporting] = useState(false);

  const canvasOptions = useMemo(
    () => ({
      image: poster.image,
      mediaKind: kind,
      title: poster.title,
      subtitle: poster.subtitle,
      description: poster.description,
      accent: poster.accent,
      rating: poster.rating,
      ratingSource: poster.ratingSource,
      genres: poster.genres,
      status: poster.status,
      seasons: poster.seasons,
      episodes: poster.episodes,
      language: poster.language,
      year: poster.year,
    }),
    [poster, kind],
  );

  // Live poster preview.
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    let cancelled = false;

    const renderCanvas = document.createElement("canvas");
    void document.fonts.ready
      .then(() => drawPoster(renderCanvas, canvasOptions))
      .then(() => {
        if (cancelled) return;
        canvas.width = renderCanvas.width;
        canvas.height = renderCanvas.height;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas is not supported by this browser.");
        context.drawImage(renderCanvas, 0, 0);
        setPreviewReady(true);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Preview could not be rendered.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [canvasOptions]);

  function updatePoster<K extends keyof typeof initialState>(
    key: K,
    value: (typeof initialState)[K],
  ) {
    setPoster((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function uploadImage(file?: File) {
    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Choose a JPG, PNG or WEBP image.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    const maximumSize = 25 * 1024 * 1024;

    if (file.size > maximumSize) {
      toast.error("Image size must be 25 MB or less.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        updatePoster("image", reader.result);

        toast.success(
          "Background image added. Your original image is preserved.",
        );
      } else {
        toast.error("Could not read this image.");
      }
    };

    reader.onerror = () => {
      toast.error("Could not read this image file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    };

    reader.readAsDataURL(file);
  }

  async function findDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!query.trim()) {
      toast.error("Enter a title to search.");
      return;
    }

    setLoading(true);

    try {
      const result = await searchMetadata(query, kind);

      setMetadata(result);

      setPoster((current) => ({
        ...current,

        title: result.title || current.title,

        subtitle:
          result.originalTitle && result.originalTitle !== result.title
            ? result.originalTitle
            : "",

        description:
          result.description || current.description,

        rating:
          result.rating == null
            ? ""
            : `${result.rating.toFixed(1)} / 10`,

        ratingSource: result.ratingSource || result.source,

        genres: result.genres.join(" • "),

        status: result.status || "",

        seasons:
          result.seasons != null
            ? `${result.seasons} seasons`
            : "",

        episodes:
          result.episodes != null
            ? `${result.episodes} episodes`
            : "",

        language: result.language || "",

        year: result.year || "",
      }));

      toast.success(`Details loaded from ${result.source}.`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not retrieve title details.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function exportPoster() {
    setExporting(true);

    try {
      await document.fonts.ready;
      await exportPosterPng(canvasOptions);
      toast.success("4K PNG exported successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not export poster.",
      );
    } finally {
      setExporting(false);
    }
  }

  function resetPoster() {
    setPoster(initialState);
    setMetadata(null);
    setQuery("");
    setKind("anime");
    setPreviewReady(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    toast.success("Poster editor reset.");
  }

  return (
    <main className="studio">
      <header className="topbar">
        <a
          className="brand"
          href={`${import.meta.env.BASE_URL}`}
        >
          <span className="brand-icon">
            <Film size={23} />
          </span>

          <span>
            <strong>FrameForge</strong>
            <small>ANIME & MOVIE POSTER STUDIO</small>
          </span>
        </a>

        <span className="status">
          <span className="status-dot" />
          CREATIVE STUDIO
        </span>
      </header>

      <section className="hero">
        <span className="eyebrow">
          YOUR VISION. YOUR POSTER.
        </span>

        <h1>
          Forge your <span>frame.</span>
        </h1>

        <p>
          Upload your artwork, find available title details,
          and create a cinematic poster with a live preview
          and 4K PNG export.
        </p>
      </section>

      <section className="workspace">
        <aside className="editor panel">
          <div className="panel-heading">
            <div>
              <span className="section-label">
                01 / CUSTOMIZE
              </span>

              <h2>Poster editor</h2>
            </div>

            <button
              type="button"
              className="icon-button"
              onClick={resetPoster}
              title="Reset poster"
              aria-label="Reset poster"
            >
              <RotateCcw size={17} />
            </button>
          </div>

          <button
            type="button"
            className="upload-zone"
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="upload-icon">
              <Upload size={24} />
            </span>

            <strong>
              {poster.image
                ? "Change background image"
                : "Upload your artwork"}
            </strong>

            <span>
              JPG, PNG or WEBP · Maximum 25 MB
            </span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(event) => {
              uploadImage(event.target.files?.[0]);
            }}
          />

          <form
            className="metadata-search"
            onSubmit={findDetails}
          >
            <label className="field">
              <span>MEDIA TYPE</span>

              <select
                value={kind}
                disabled={loading}
                onChange={(event) => {
                  setKind(event.target.value as MediaKind);
                  setMetadata(null);
                }}
              >
                <option value="anime">
                  Anime · Jikan / MyAnimeList
                </option>

                <option value="tv">
                  TV show · TVMaze
                </option>

                <option value="movie">
                  Movie · Manual details
                </option>
              </select>
            </label>

            <label className="field">
              <span>SEARCH TITLE</span>

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="e.g. Demon Slayer"
                maxLength={100}
              />
            </label>

            <button
              className="secondary-button"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <LoaderCircle className="spin" size={17} />
              ) : (
                <Search size={17} />
              )}

              {loading
                ? "Searching metadata…"
                : "Add details automatically"}
            </button>
          </form>

          {metadata && (
            <div className="source-card">
              <strong>
                Metadata source: {metadata.source}
              </strong>

              <span>
                {metadata.rating == null
                  ? "Rating unavailable"
                  : `Rating: ${metadata.rating.toFixed(1)} / 10 (${metadata.ratingSource})`}
              </span>

              <a
                href={metadata.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                Verify source ↗
              </a>
            </div>
          )}

          <label className="field">
            <span>POSTER TITLE</span>

            <input
              value={poster.title}
              maxLength={70}
              onChange={(event) =>
                updatePoster("title", event.target.value)
              }
              placeholder="Enter poster title"
            />
          </label>

          <label className="field">
            <span>SUBTITLE</span>

            <input
              value={poster.subtitle}
              maxLength={90}
              onChange={(event) =>
                updatePoster("subtitle", event.target.value)
              }
              placeholder="Enter subtitle"
            />
          </label>

          <label className="field">
            <span>DESCRIPTION</span>

            <textarea
              value={poster.description}
              maxLength={500}
              rows={4}
              onChange={(event) =>
                updatePoster("description", event.target.value)
              }
              placeholder="Enter a short description"
            />
          </label>

          <label className="field">
            <span>RATING (SOURCE SHOWN ON POSTER)</span>

            <input
              value={poster.rating}
              maxLength={30}
              onChange={(event) =>
                updatePoster("rating", event.target.value)
              }
              placeholder="e.g. 8.7 / 10"
            />
          </label>

          <label className="field">
            <span>GENRES</span>

            <input
              value={poster.genres}
              maxLength={120}
              onChange={(event) =>
                updatePoster("genres", event.target.value)
              }
              placeholder="Action • Adventure"
            />
          </label>

          <label className="field">
            <span>EPISODES</span>

            <input
              value={poster.episodes}
              maxLength={40}
              onChange={(event) =>
                updatePoster("episodes", event.target.value)
              }
              placeholder="363 episodes"
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>STATUS</span>

              <input
                value={poster.status}
                maxLength={50}
                onChange={(event) =>
                  updatePoster("status", event.target.value)
                }
                placeholder="Finished airing"
              />
            </label>

            <label className="field">
              <span>SEASONS</span>

              <input
                value={poster.seasons}
                maxLength={40}
                onChange={(event) =>
                  updatePoster("seasons", event.target.value)
                }
                placeholder="2 seasons"
              />
            </label>
          </div>

          <label className="field">
            <span>LANGUAGE</span>

            <input
              value={poster.language}
              maxLength={50}
              onChange={(event) =>
                updatePoster("language", event.target.value)
              }
              placeholder="Japanese / English"
            />
          </label>

          <label className="field">
            <span>ACCENT COLOR</span>

            <div className="color-picker">
              <input
                type="color"
                value={poster.accent}
                onChange={(event) =>
                  updatePoster("accent", event.target.value)
                }
                aria-label="Choose poster accent color"
              />

              <span>{poster.accent.toUpperCase()}</span>
            </div>
          </label>

          <button
            type="button"
            className="primary-button"
            onClick={exportPoster}
            disabled={exporting}
          >
            {exporting ? (
              <LoaderCircle className="spin" size={18} />
            ) : (
              <Download size={18} />
            )}

            {exporting
              ? "Preparing 4K PNG…"
              : "Export 4K PNG · 3840 × 2160"}
          </button>

          <p className="helper">
            Image processing happens in your browser.
            Metadata is fetched from the linked public source;
            availability depends on the title and API.
          </p>
        </aside>

        <section className="preview-panel panel">
          <div className="panel-heading">
            <div>
              <span className="section-label">
                02 / PREVIEW
              </span>

              <h2>Your creation</h2>
            </div>

            <span className="preview-badge">
              <ImageIcon size={14} />
              16:9 LANDSCAPE
            </span>
          </div>

          <div className="poster-stage">
            <div className="poster-frame">
              <canvas
                ref={canvasRef}
                aria-label="Live poster preview"
                role="img"
              />

              {!previewReady && (
                <div className="poster-placeholder">
                  <ImageIcon size={34} />
                  <span>PREPARING YOUR CANVAS</span>
                </div>
              )}
            </div>
          </div>

          <p className="preview-note">
            Live preview updates when you change the image
            or poster details. Export creates a
            3840 × 2160 PNG.
          </p>

          {metadata && (
            <p className="preview-note">
              Source:{" "}
              <a
                href={metadata.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                {metadata.source}
              </a>
              . Please verify ratings and metadata at the source.
            </p>
          )}
        </section>
      </section>

      <footer>
        <span>FRAMEFORGE STUDIO</span>
        <span>MADE FOR YOUR IMAGINATION</span>
      </footer>
    </main>
  );
}

export const Route = createFileRoute("/")({
  component: Studio,
});
