export interface CanvasPosterOptions {
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
  year?: string;
}

function loadImage(
  source: string,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);

    image.onerror = () =>
      reject(
        new Error("Could not load the selected image."),
      );

    image.src = source;
  });
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line
      ? `${line} ${word}`
      : word;

    if (
      context.measureText(candidate).width > maxWidth &&
      line
    ) {
      lines.push(line);
      line = word;

      if (lines.length >= maxLines) {
        break;
      }
    } else {
      line = candidate;
    }
  }

  if (line && lines.length < maxLines) {
    lines.push(line);
  }

  if (
    lines.length === maxLines &&
    words.length &&
    lines[maxLines - 1]
  ) {
    const last = lines[maxLines - 1];

    if (
      context.measureText(`${last}…`).width <= maxWidth
    ) {
      lines[maxLines - 1] = `${last}…`;
    }
  }

  return lines;
}

export async function drawPoster(
  canvas: HTMLCanvasElement,
  options: CanvasPosterOptions,
  export4k = false,
): Promise<void> {
  const width = export4k ? 3840 : 1200;
  const height = export4k ? 2160 : 675;

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error(
      "Canvas is not supported by this browser.",
    );
  }

  const scale = width / 1200;

  // Base background.
  context.fillStyle = "#100e19";
  context.fillRect(0, 0, width, height);

  // Draw uploaded artwork.
  if (options.image) {
    try {
      const image = await loadImage(options.image);

      const imageX = width * 0.36;
      const imageY = 0;
      const imageW = width * 0.64;
      const imageH = height;

      const ratio = Math.max(
        imageW / image.width,
        imageH / image.height,
      );

      const drawW = image.width * ratio;
      const drawH = image.height * ratio;

      context.save();

      context.beginPath();
      context.rect(
        imageX,
        imageY,
        imageW,
        imageH,
      );
      context.clip();

      context.drawImage(
        image,
        imageX + (imageW - drawW) / 2,
        imageY + (imageH - drawH) / 2,
        drawW,
        drawH,
      );

      context.restore();
    } catch {
      // If the image cannot be decoded, retain the designed background.
    }
  } else {
    const background = context.createLinearGradient(
      0,
      0,
      width,
      height,
    );

    background.addColorStop(0, "#302044");
    background.addColorStop(0.55, "#171321");
    background.addColorStop(1, "#100e19");

    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
  }

  // Dark gradient behind text.
  const fade = context.createLinearGradient(
    width * 0.2,
    0,
    width * 0.83,
    0,
  );

  fade.addColorStop(0, "#100e19");
  fade.addColorStop(0.48, "#100e19f2");
  fade.addColorStop(1, "#100e1900");

  context.fillStyle = fade;
  context.fillRect(0, 0, width, height);

  // Accent stripe.
  context.fillStyle = options.accent;
  context.fillRect(0, 0, 12 * scale, height);

  const left = 62 * scale;
  const maxTextWidth = width * 0.59;

  context.textAlign = "left";

  // Language and year.
  context.fillStyle = options.accent;
  context.font = `800 ${17 * scale}px Arial, sans-serif`;

  const kicker =
    [options.language, options.year]
      .filter(Boolean)
      .join("  •  ") || "FRAMEFORGE ORIGINAL";

  context.fillText(
    kicker.toUpperCase().slice(0, 55),
    left,
    height * 0.22,
  );

  // Title.
  let titleSize = 76 * scale;

  context.font =
    `900 ${titleSize}px Impact, Anton, Arial, sans-serif`;

  while (
    context.measureText(
      options.title || "YOUR TITLE",
    ).width > maxTextWidth &&
    titleSize > 28 * scale
  ) {
    titleSize -= 3 * scale;

    context.font =
      `900 ${titleSize}px Impact, Anton, Arial, sans-serif`;
  }

  context.fillStyle = "#ffffff";

  const titleLines = wrapText(
    context,
    options.title || "YOUR TITLE",
    maxTextWidth,
    2,
  );

  titleLines.forEach((line, index) => {
    context.fillText(
      line,
      left,
      height * 0.38 + index * titleSize * 1.04,
    );
  });

  // Subtitle.
  context.fillStyle = options.accent;
  context.font = `800 ${22 * scale}px Arial, sans-serif`;

  context.fillText(
    (
      options.subtitle || "A CINEMATIC STORY"
    ).slice(0, 70).toUpperCase(),
    left,
    height * 0.58,
  );

  // Rating badge.
  if (options.rating.trim()) {
    context.fillStyle = "#171020";

    context.beginPath();

    context.roundRect(
      left,
      height * 0.64,
      142 * scale,
      42 * scale,
      10 * scale,
    );

    context.fill();

    context.fillStyle = "#ffffff";
    context.font = `800 ${17 * scale}px Arial, sans-serif`;

    context.fillText(
      `★  ${options.rating.slice(0, 12)}`,
      left + 13 * scale,
      height * 0.64 + 27 * scale,
    );
  }

  // Genre, status and seasons.
  const meta = [
    options.genres,
    options.status,
    options.seasons,
  ]
    .filter(Boolean)
    .join("  •  ");

  context.fillStyle = "#e5deef";
  context.font = `600 ${16 * scale}px Arial, sans-serif`;

  const metaLines = wrapText(
    context,
    meta,
    maxTextWidth,
    2,
  );

  metaLines.forEach((line, index) => {
    context.fillText(
      line,
      left,
      height * 0.75 + index * 24 * scale,
    );
  });

  // Description.
  context.fillStyle = "#d1c9df";
  context.font = `${17 * scale}px Arial, sans-serif`;

  const descriptionLines = wrapText(
    context,
    options.description || "A new adventure begins.",
    maxTextWidth,
    3,
  );

  descriptionLines.forEach((line, index) => {
    context.fillText(
      line,
      left,
      height * 0.84 + index * 25 * scale,
    );
  });

  // Footer watermark.
  context.fillStyle = "#ffffffaa";
  context.font = `700 ${12 * scale}px Arial, sans-serif`;

  context.fillText(
    "FRAMEFORGE  •  ANIME & MOVIE STUDIO",
    left,
    height * 0.95,
  );
}

export async function exportPosterPng(
  options: CanvasPosterOptions,
): Promise<void> {
  const canvas = document.createElement("canvas");

  await drawPoster(canvas, options, true);

  const blob = await new Promise<Blob>(
    (resolve, reject) => {
      canvas.toBlob(
        (value) => {
          if (value) {
            resolve(value);
          } else {
            reject(new Error("PNG export failed."));
          }
        },
        "image/png",
      );
    },
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const safeTitle =
    (options.title || "poster")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "poster";

  link.href = url;
  link.download = `frameforge-${safeTitle}-4k.png`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
