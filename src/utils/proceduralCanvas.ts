import { ScenePanel, AspectRatio } from '../types';

/**
 * Generates a high-quality cinematic placeholder/preview image on a canvas
 * when an image is awaiting generation, or as an instant stylized fallback.
 */
export function generateProceduralCinematicFrame(
  scene: ScenePanel,
  aspectRatio: AspectRatio,
  visualStyleName: string,
  width = 1280,
  height = 720
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Determine color scheme based on lighting and scene
  const lightingLower = (scene.lighting || '').toLowerCase();
  const titleLower = (scene.title || '').toLowerCase();
  const descLower = (scene.visualDescription || '').toLowerCase();

  let gradStart = '#0f172a';
  let gradEnd = '#020617';
  let accentColor = '#f59e0b'; // amber
  let secondaryColor = '#3b82f6'; // blue

  if (lightingLower.includes('neon') || lightingLower.includes('cyber')) {
    gradStart = '#18022a';
    gradEnd = '#030712';
    accentColor = '#f43f5e'; // neon pink
    secondaryColor = '#06b6d4'; // cyan
  } else if (lightingLower.includes('golden') || lightingLower.includes('sunset')) {
    gradStart = '#3b1700';
    gradEnd = '#0f0500';
    accentColor = '#fbbf24'; // golden
    secondaryColor = '#ea580c'; // orange
  } else if (lightingLower.includes('moonlight') || lightingLower.includes('bioluminescent')) {
    gradStart = '#022026';
    gradEnd = '#020b14';
    accentColor = '#10b981'; // emerald
    secondaryColor = '#38bdf8'; // sky
  } else if (lightingLower.includes('gothic') || lightingLower.includes('chiaroscuro')) {
    gradStart = '#1c1917';
    gradEnd = '#0c0a09';
    accentColor = '#a8a29e'; // stone
    secondaryColor = '#44403c';
  } else if (titleLower.includes('space') || descLower.includes('saturn') || descLower.includes('space')) {
    gradStart = '#0b0f2a';
    gradEnd = '#000000';
    accentColor = '#818cf8';
    secondaryColor = '#c084fc';
  }

  // Base background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, gradStart);
  bgGrad.addColorStop(1, gradEnd);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Volumetric Lighting Cone / Atmospheric Glow
  const radialGlow = ctx.createRadialGradient(
    width * 0.5,
    height * 0.4,
    50,
    width * 0.5,
    height * 0.5,
    width * 0.6
  );
  radialGlow.addColorStop(0, `${accentColor}33`);
  radialGlow.addColorStop(0.5, `${secondaryColor}1a`);
  radialGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, width, height);

  // Cinematic Horizon / Depth Silhouettes
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.moveTo(0, height * 0.65);
  ctx.bezierCurveTo(
    width * 0.3,
    height * 0.6,
    width * 0.7,
    height * 0.7,
    width,
    height * 0.62
  );
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Subtle rule-of-thirds grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width / 3, 0);
  ctx.lineTo(width / 3, height);
  ctx.moveTo((2 * width) / 3, 0);
  ctx.lineTo((2 * width) / 3, height);
  ctx.moveTo(0, height / 3);
  ctx.lineTo(width, height / 3);
  ctx.moveTo(0, (2 * height) / 3);
  ctx.lineTo(width, (2 * height) / 3);
  ctx.stroke();

  // Draw light particles or stars
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  const seed = (scene.sceneNumber * 137) % 1000;
  for (let i = 0; i < 40; i++) {
    const px = ((seed * (i + 1) * 31) % width);
    const py = ((seed * (i + 1) * 73) % height);
    const pr = 1 + ((i * 11) % 2.5);
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Anamorphic horizontal lens flare streak
  const flareGrad = ctx.createLinearGradient(0, height * 0.45, width, height * 0.45);
  flareGrad.addColorStop(0, 'transparent');
  flareGrad.addColorStop(0.3, `${accentColor}11`);
  flareGrad.addColorStop(0.5, `${accentColor}aa`);
  flareGrad.addColorStop(0.7, `${secondaryColor}11`);
  flareGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = flareGrad;
  ctx.fillRect(0, height * 0.45 - 2, width, 4);

  // Cinematic Letterbox & Film Frame Overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  const badgeY = 40;

  // Scene Number Badge
  ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
  const sceneBadge = `SCENE #${scene.sceneNumber}`;
  const badgeWidth = ctx.measureText(sceneBadge).width + 32;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.beginPath();
  ctx.roundRect(40, badgeY, badgeWidth, 36, 6);
  ctx.fill();
  ctx.strokeStyle = `${accentColor}88`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.fillText(sceneBadge, 56, badgeY + 25);

  // Camera Shot Badge
  if (scene.cameraAngle) {
    ctx.font = '14px "Plus Jakarta Sans", sans-serif';
    const camText = `🎥 ${scene.cameraAngle}`;
    const camWidth = ctx.measureText(camText).width + 24;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(50 + badgeWidth, badgeY, camWidth, 36, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(camText, 62 + badgeWidth, badgeY + 23);
  }

  // Duration & Aspect Ratio Badge (top right)
  ctx.font = '13px "JetBrains Mono", monospace';
  const timeInfo = `⏱️ ${scene.duration.toFixed(1)}s • ${aspectRatio}`;
  const timeWidth = ctx.measureText(timeInfo).width + 24;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.beginPath();
  ctx.roundRect(width - timeWidth - 40, badgeY, timeWidth, 36, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.stroke();
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(timeInfo, width - timeWidth - 28, badgeY + 23);

  // Center Scene Title
  ctx.font = 'bold 36px "Syne", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  const title = scene.title || `Adegan ${scene.sceneNumber}`;
  ctx.fillText(title, width / 2, height / 2 - 20);

  // Visual description snippet
  ctx.font = '18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#94a3b8';
  const desc = scene.visualDescription
    ? scene.visualDescription.slice(0, 80) + (scene.visualDescription.length > 80 ? '...' : '')
    : 'Menunggu proses render visual AI sinematik...';
  ctx.fillText(desc, width / 2, height / 2 + 25);

  // Bottom Subtitle / Narration Banner
  if (scene.narrative) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    const bannerHeight = 80;
    ctx.fillRect(0, height - bannerHeight, width, bannerHeight);

    ctx.font = 'italic 18px "Plus Jakarta Sans", serif';
    ctx.fillStyle = '#fef08a'; // subtle warm yellow
    ctx.fillText(`“${scene.narrative}”`, width / 2, height - 34);
  }

  ctx.textAlign = 'start';
  return canvas.toDataURL('image/png');
}
