import { OverlaySettings } from '../types';

export async function exportTo4KCanvas(
  imageElement: HTMLImageElement | null,
  settings: OverlaySettings
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 3840;
  canvas.height = 2160;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  if (imageElement) {
    const imgRatio = imageElement.width / imageElement.height;
    const canvasRatio = canvas.width / canvas.height;
    let drawWidth = canvas.width;
    let drawHeight = canvas.height;
    let offsetX = 0;
    let offsetY = 0;

    if (imgRatio > canvasRatio) {
      drawWidth = canvas.height * imgRatio;
      offsetX = (canvas.width - drawWidth) / 2;
    } else {
      drawHeight = canvas.width / imgRatio;
      offsetY = (canvas.height - drawHeight) / 2;
    }

    ctx.drawImage(imageElement, offsetX, offsetY, drawWidth, drawHeight);
  } else {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const opacityVal = settings.opacity / 100;
  
  if (settings.overlayStyle === 'cinematic') {
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, `rgba(9, 13, 22, ${opacityVal * 0.4})`);
    grad.addColorStop(0.5, `rgba(9, 13, 22, ${opacityVal * 0.7})`);
    grad.addColorStop(1, `rgba(5, 7, 12, ${Math.min(1, opacityVal * 1.2)})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (settings.overlayStyle === 'cyberpunk') {
    ctx.fillStyle = `rgba(15, 5, 30, ${opacityVal})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = settings.accentColor || '#38bdf8';
    ctx.lineWidth = 12;
    ctx.strokeRect(80, 80, canvas.width - 160, canvas.height - 160);
  } else if (settings.overlayStyle === 'glass') {
    ctx.fillStyle = `rgba(15, 23, 42, ${opacityVal * 0.85})`;
    ctx.fillRect(160, canvas.height - 750, canvas.width - 320, 540);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 4;
    ctx.strokeRect(160, canvas.height - 750, canvas.width - 320, 540);
  } else {
    ctx.fillStyle = `rgba(0, 0, 0, ${opacityVal * 0.6})`;
    ctx.fillRect(0, canvas.height - 600, canvas.width, 600);
  }

  let fontFamily = 'Inter';
  if (settings.fontFamily === 'Outfit') fontFamily = 'Outfit';
  if (settings.fontFamily === 'Cinzel') fontFamily = 'Cinzel';
  if (settings.fontFamily === 'Orbitron') fontFamily = 'Orbitron';

  ctx.save();

  if (settings.rating) {
    ctx.font = `700 48px "${fontFamily}", sans-serif`;
    const ratingText = `★ ${settings.rating}`;
    const textMetrics = ctx.measureText(ratingText);
    const badgeWidth = textMetrics.width + 60;
    const badgeHeight = 90;
    const badgeX = 240;
    const badgeY = canvas.height - 620;

    ctx.fillStyle = settings.accentColor || '#6366f1';
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 20);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(ratingText, badgeX + 30, badgeY + 60);
  }

  let currentXCoord = 240 + (settings.rating ? 300 : 0);
  if (settings.status) {
    ctx.font = `600 42px "${fontFamily}", sans-serif`;
    const statusText = settings.status.toUpperCase();
    const sMetrics = ctx.measureText(statusText);
    const sWidth = sMetrics.width + 50;
    const sHeight = 90;
    const sY = canvas.height - 620;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.roundRect(currentXCoord, sY, sWidth, sHeight, 20);
    ctx.fill();

    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(statusText, currentXCoord + 25, sY + 58);
  }

  ctx.font = `900 120px "${fontFamily}", sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 10;
  
  const titleY = canvas.height - 420;
  ctx.fillText(settings.title || 'FrameForge Masterpiece', 240, titleY);

  if (settings.secondaryTitle) {
    ctx.font = `500 56px "${fontFamily}", sans-serif`;
    ctx.fillStyle = '#94a3b8';
    ctx.shadowBlur = 10;
    ctx.fillText(settings.secondaryTitle, 240, titleY + 85);
  }

  if (settings.genres && settings.genres.length > 0) {
    ctx.font = `600 40px "${fontFamily}", sans-serif`;
    ctx.fillStyle = settings.accentColor || '#38bdf8';
    const genreString = settings.genres.slice(0, 4).join('   •   ');
    ctx.fillText(genreString, 240, canvas.height - 180);
  }

  ctx.font = `700 36px "Inter", sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.textAlign = 'right';
  ctx.fillText('3840 × 2160 • FRAMEFORGE 4K ULTRA', canvas.width - 240, canvas.height - 180);

  ctx.restore();

  return canvas.toDataURL('image/png');
}
