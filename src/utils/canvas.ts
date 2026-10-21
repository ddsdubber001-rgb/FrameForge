export interface CanvasPosterOptions {
  image: string | null;
  mediaKind?: "anime" | "tv" | "movie";
  title: string;
  subtitle: string;
  description: string;
  accent: string;
  rating: string;
  ratingSource?: string;
  genres: string;
  status: string;
  seasons: string;
  episodes?: string;
  language: string;
  year?: string;
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load the selected image."));
    image.src = source;
  });
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function fitText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  minimumSize: number,
  family: string,
) {
  let size = startSize;
  context.font = `900 ${size}px ${family}`;
  while (size > minimumSize && context.measureText(text).width > maxWidth) {
    size -= 2;
    context.font = `900 ${size}px ${family}`;
  }
  return size;
}

function drawPill(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  scale: number,
  options: { fill?: string; stroke?: string; color?: string; bold?: boolean } = {},
) {
  context.font = `${options.bold === false ? 600 : 800} ${14 * scale}px Arial, sans-serif`;
  const width = context.measureText(text).width + 24 * scale;
  const height = 30 * scale;
  roundedRect(context, x, y, width, height, 8 * scale);
  context.fillStyle = options.fill ?? "#25232bcc";
  context.fill();
  context.strokeStyle = options.stroke ?? "#ffffff55";
  context.lineWidth = 1.2 * scale;
  context.stroke();
  context.fillStyle = options.color ?? "#ffffff";
  context.textBaseline = "middle";
  context.fillText(text, x + 12 * scale, y + height / 2);
  context.textBaseline = "alphabetic";
  return width;
}

function drawCoverImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
) {
  const ratio = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * ratio;
  const drawHeight = image.naturalHeight * ratio;
  context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
}

function drawWrappedLine(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  maxLines: number,
  lineHeight: number,
) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    } else {
      line = candidate;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length === maxLines && words.length && lines[lines.length - 1]) {
    let last = lines[lines.length - 1];
    while (last && context.measureText(`${last}…`).width > maxWidth) {
      last = last.slice(0, -1).trimEnd();
    }
    lines[lines.length - 1] = `${last}…`;
  }
  lines.forEach((value, index) => context.fillText(value, x, y + index * lineHeight));
}

function ratingPercent(rating: string): string {
  const numeric = Number.parseFloat(rating.replace(",", "."));
  if (!Number.isFinite(numeric)) return rating.trim();
  const score = /%/.test(rating) ? numeric : numeric <= 10 ? numeric * 10 : numeric;
  return `${Math.round(Math.max(0, Math.min(100, score)))}%`;
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
  if (!context) throw new Error("Canvas is not supported by this browser.");

  const scale = width / 1200;
  context.fillStyle = "#100e19";
  context.fillRect(0, 0, width, height);

  if (options.image) {
    const image = await loadImage(options.image);
    drawCoverImage(context, image, width, height);
  } else {
    const background = context.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, "#302044");
    background.addColorStop(0.55, "#171321");
    background.addColorStop(1, "#100e19");
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
  }

  const leftFade = context.createLinearGradient(0, 0, width * 0.78, 0);
  leftFade.addColorStop(0, "#080910e8");
  leftFade.addColorStop(0.38, "#080910b8");
  leftFade.addColorStop(0.72, "#08091035");
  leftFade.addColorStop(1, "#08091000");
  context.fillStyle = leftFade;
  context.fillRect(0, 0, width, height);
  const bottomFade = context.createLinearGradient(0, height * 0.36, 0, height);
  bottomFade.addColorStop(0, "#08091000");
  bottomFade.addColorStop(1, "#080910f5");
  context.fillStyle = bottomFade;
  context.fillRect(0, 0, width, height);

  const left = 68 * scale;
  const maxWidth = width * 0.76;
  const accent = /^#[0-9a-f]{6}$/i.test(options.accent) ? options.accent : "#a78bfa";
  let pillX = left;
  const pillY = height * 0.48;
  const kindLabel = options.mediaKind === "tv"
    ? "TV SHOW"
    : options.mediaKind === "movie"
      ? "MOVIE"
      : "ANIME";
  const tags = [kindLabel, options.status?.toUpperCase(), options.language?.toUpperCase()]
    .filter(Boolean)
    .slice(0, 3);
  tags.forEach((tag, index) => {
    const used = drawPill(context, tag, pillX, pillY, scale, index === 0
      ? { fill: accent, stroke: accent, color: "#ffffff" }
      : { fill: "#202027d9", stroke: "#ffffff66", color: "#ffffff" });
    pillX += used + 10 * scale;
  });

  const title = (options.title || "YOUR TITLE").trim().toUpperCase();
  const titleSize = fitText(context, title, maxWidth, 72 * scale, 28 * scale, 'Impact, "Anton", "Arial Narrow", sans-serif');
  context.font = `900 ${titleSize}px Impact, "Anton", "Arial Narrow", sans-serif`;
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.fillStyle = "#ffffff";
  context.shadowColor = "#00000066";
  context.shadowBlur = 8 * scale;
  context.fillText(title, left, height * 0.66, maxWidth);
  context.shadowBlur = 0;

  if (options.subtitle.trim()) {
    context.fillStyle = "#e5e2eb";
    context.font = `600 ${14 * scale}px Arial, sans-serif`;
    context.fillText(options.subtitle.trim().toUpperCase().slice(0, 90), left, height * 0.695, maxWidth);
  }

  const metaY = height * 0.735;
  let metaX = left;
  context.textBaseline = "middle";
  if (options.rating.trim()) {
    context.fillStyle = "#ffd52e";
    context.font = `800 ${23 * scale}px Arial, sans-serif`;
    const ratingText = `★ ${ratingPercent(options.rating)}`;
    context.fillText(ratingText, metaX, metaY);
    metaX += context.measureText(ratingText).width + 9 * scale;
    if (options.ratingSource?.trim()) {
      const source = options.ratingSource.toUpperCase().slice(0, 14);
      metaX += drawPill(context, source, metaX, metaY - 13 * scale, scale, {
        fill: "#100e19cc", stroke: "#d6a91f", color: "#ffd52e", bold: false,
      }) + 12 * scale;
      context.textBaseline = "middle";
    }
  }
  const facts = [options.year, options.seasons, options.episodes].filter((value) => value?.trim());
  context.font = `700 ${21 * scale}px Arial, sans-serif`;
  context.fillStyle = "#f2eff7";
  facts.forEach((fact) => {
    if (metaX > left) {
      context.fillStyle = "#ffffff99";
      context.fillText("•", metaX, metaY);
      metaX += 20 * scale;
      context.fillStyle = "#f2eff7";
    }
    const safeFact = fact!.slice(0, 32);
    context.fillText(safeFact, metaX, metaY, Math.max(50 * scale, width - metaX - 35 * scale));
    metaX += context.measureText(safeFact).width + 18 * scale;
  });
  context.textBaseline = "alphabetic";

  const genres = options.genres.split(/[•,|]/).map((genre) => genre.trim()).filter(Boolean).slice(0, 6);
  let genreX = left;
  let genreY = height * 0.76;
  const genreMaxX = width * 0.83;
  for (const genre of genres) {
    const genreWidth = context.measureText(genre).width + 24 * scale;
    if (genreX > left && genreX + genreWidth > genreMaxX) {
      genreX = left;
      genreY += 36 * scale;
    }
    const used = drawPill(context, genre, genreX, genreY, scale, {
      fill: "#292832cc", stroke: "#ffffff44", color: "#f7f5fb", bold: false,
    });
    genreX += used + 8 * scale;
  }

  const buttonY = Math.min(height * 0.82, genreY + 45 * scale);
  const buttonWidth = 240 * scale;
  const buttonHeight = 52 * scale;
  const buttonGradient = context.createLinearGradient(left, buttonY, left + buttonWidth, buttonY);
  buttonGradient.addColorStop(0, "#8b5cf6");
  buttonGradient.addColorStop(1, "#06b6d4");
  roundedRect(context, left, buttonY, buttonWidth, buttonHeight, 28 * scale);
  context.fillStyle = buttonGradient;
  context.fill();
  context.fillStyle = "#ffffff";
  context.beginPath();
  context.moveTo(left + 24 * scale, buttonY + 15 * scale);
  context.lineTo(left + 24 * scale, buttonY + 37 * scale);
  context.lineTo(left + 42 * scale, buttonY + 26 * scale);
  context.closePath();
  context.fill();
  context.font = `800 ${17 * scale}px Arial, sans-serif`;
  context.textBaseline = "middle";
  context.fillText("DOWNLOAD NOW", left + 53 * scale, buttonY + buttonHeight / 2);
  context.textBaseline = "alphabetic";

  if (options.description.trim()) {
    context.fillStyle = "#ffffffb8";
    context.font = `${12 * scale}px Arial, sans-serif`;
    drawWrappedLine(context, options.description, left, height * 0.965, maxWidth, 1, 15 * scale);
  }
}

export async function exportPosterPng(options: CanvasPosterOptions): Promise<void> {
  const canvas = document.createElement("canvas");
  await drawPoster(canvas, options, true);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error("PNG export failed.")), "image/png");
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeTitle = (options.title || "poster").trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "poster";
  link.href = url;
  link.download = `frameforge-${safeTitle}-4k.png`;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}
