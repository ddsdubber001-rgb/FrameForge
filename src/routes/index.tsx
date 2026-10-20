import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  Upload,
  Image as ImageIcon,
  Download,
  Film,
  RotateCcw,
} from "lucide-react";

function Studio() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState("YOUR TITLE");
  const [subtitle, setSubtitle] = useState("A CINEMATIC MASTERPIECE");
  const [description, setDescription] = useState(
    "A new adventure begins.",
  );
  const [accent, setAccent] = useState("#a78bfa");

  function uploadImage(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      alert("Image size must be 25 MB or less.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImage(reader.result);
      }
    };

    reader.readAsDataURL(file);
  }

  function drawPoster(exportImage = false) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = exportImage ? 3840 : 720;
    const height = exportImage ? 2160 : 405;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#100e19");
    gradient.addColorStop(1, "#302044");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const finish = () => {
      const scale = width / 720;

      ctx.fillStyle = accent;
      ctx.fillRect(0, 0, 8 * scale, height);

      ctx.textAlign = "left";
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${48 * scale}px Anton, Impact, sans-serif`;
      ctx.fillText(title.slice(0, 35), 35 * scale, height * 0.66);

      ctx.fillStyle = accent;
      ctx.font = `bold ${15 * scale}px Arial`;
      ctx.fillText(subtitle.slice(0, 75), 38 * scale, height * 0.75);

      ctx.fillStyle = "#d1c9df";
      ctx.font = `${14 * scale}px Arial`;
      ctx.fillText(description.slice(0, 90), 38 * scale, height * 0.83);

      ctx.fillStyle = "#ffffff99";
      ctx.font = `${11 * scale}px Arial`;
      ctx.fillText("FRAMEFORGE • ANIME & MOVIE STUDIO", 38 * scale, height * 0.93);

      if (exportImage) {
        const link = document.createElement("a");
        link.download = "frameforge-poster.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    };

    if (image) {
      const img = new Image();

      img.onload = () => {
        const imageHeight = height * 0.62;
        const imageWidth = width * 0.48;

        ctx.save();
        ctx.beginPath();
        ctx.rect(width * 0.48, 0, width * 0.52, imageHeight);
        ctx.clip();

        const ratio = Math.max(
          imageWidth / img.width,
          imageHeight / img.height,
        );

        const drawWidth = img.width * ratio;
        const drawHeight = img.height * ratio;

        ctx.drawImage(
          img,
          width - drawWidth,
          (imageHeight - drawHeight) / 2,
          drawWidth,
          drawHeight,
        );

        ctx.restore();

        const overlay = ctx.createLinearGradient(
          width * 0.35,
          0,
          width * 0.8,
          0,
        );

        overlay.addColorStop(0, "#100e19");
        overlay.addColorStop(1, "#100e1900");

        ctx.fillStyle = overlay;
        ctx.fillRect(0, 0, width, imageHeight);

        finish();
      };

      img.onerror = () => {
        finish();
      };

      img.src = image;
    } else {
      finish();
    }
  }

  function exportPoster() {
    drawPoster(true);
  }

  function resetPoster() {
    setImage(null);
    setTitle("YOUR TITLE");
    setSubtitle("A CINEMATIC MASTERPIECE");
    setDescription("A new adventure begins.");
    setAccent("#a78bfa");
  }

  return (
    <main className="studio">
      <header className="topbar">
        <a className="brand" href="./">
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
        <span className="eyebrow">YOUR VISION. YOUR POSTER.</span>

        <h1>
          Forge your <span>frame.</span>
        </h1>

        <p>
          Create your own cinematic artwork with a custom image, title,
          description and high-resolution PNG export.
        </p>
      </section>

      <section className="workspace">
        <aside className="editor panel">
          <div className="panel-heading">
            <div>
              <span className="section-label">01 / CUSTOMIZE</span>
              <h2>Poster editor</h2>
            </div>

            <button
              className="icon-button"
              onClick={resetPoster}
              title="Reset poster"
              aria-label="Reset poster"
            >
              <RotateCcw size={17} />
            </button>
          </div>

          <button
            className="upload-zone"
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="upload-icon">
              <Upload size={24} />
            </span>

            <strong>{image ? "Change image" : "Upload your artwork"}</strong>

            <span>JPG, PNG or WEBP · Maximum 25 MB</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(event) => uploadImage(event.target.files?.[0])}
          />

          <label className="field">
            <span>POSTER TITLE</span>

            <input
              value={title}
              maxLength={35}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter poster title"
            />
          </label>

          <label className="field">
            <span>SUBTITLE</span>

            <input
              value={subtitle}
              maxLength={75}
              onChange={(event) => setSubtitle(event.target.value)}
              placeholder="Enter subtitle"
            />
          </label>

          <label className="field">
            <span>DESCRIPTION</span>

            <textarea
              value={description}
              maxLength={90}
              rows={3}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Enter a short description"
            />
          </label>

          <label className="field">
            <span>ACCENT COLOR</span>

            <div className="color-picker">
              <input
                type="color"
                value={accent}
                onChange={(event) => setAccent(event.target.value)}
              />

              <span>{accent.toUpperCase()}</span>
            </div>
          </label>

          <button className="primary-button" onClick={exportPoster}>
            <Download size={18} />
            Export 4K PNG
          </button>

          <p className="helper">
            Your uploaded image and poster details stay in this browser.
          </p>
        </aside>

        <section className="preview-panel panel">
          <div className="panel-heading">
            <div>
              <span className="section-label">02 / PREVIEW</span>
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
                aria-label="Poster preview"
                role="img"
              />

              <div className="poster-placeholder">
                <ImageIcon size={34} />
                <span>YOUR CANVAS AWAITS</span>
              </div>
            </div>
          </div>

          <p className="preview-note">
            Preview updates as you customize your poster.
          </p>
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
