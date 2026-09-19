import { ScenePanel, AspectRatio, TransitionType } from '../types';
import { ASPECT_RATIOS } from '../constants/presets';
import { generateProceduralCinematicFrame } from './proceduralCanvas';
import { globalAudio } from './audioSynth';

export interface VideoExportOptions {
  scenes: ScenePanel[];
  aspectRatio: AspectRatio;
  visualStyleName: string;
  transition: TransitionType;
  includeSubtitles: boolean;
  includeAudio: boolean;
  onProgress: (percent: number, statusText: string) => void;
}

export async function exportStoryboardToVideo(options: VideoExportOptions): Promise<{ blob: Blob; downloadUrl: string; filename: string }> {
  const { scenes, aspectRatio, visualStyleName, transition, includeSubtitles, includeAudio, onProgress } = options;

  if (!scenes || scenes.length === 0) {
    throw new Error('Tidak ada adegan untuk diekspor ke video.');
  }

  onProgress(5, 'Menyiapkan aset visual adegan...');

  // Resolve target dimensions
  const aspectConfig = ASPECT_RATIOS.find((a) => a.id === aspectRatio) || ASPECT_RATIOS[0];
  const width = aspectConfig.width;
  const height = aspectConfig.height;

  // Pre-load all images
  const loadedImages: HTMLImageElement[] = [];
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    onProgress(5 + Math.floor((i / scenes.length) * 25), `Memuat visual adegan ${i + 1} dari ${scenes.length}...`);

    let srcUrl = scene.imageUrl;
    if (!srcUrl) {
      // Create procedural frame
      srcUrl = generateProceduralCinematicFrame(scene, aspectRatio, visualStyleName, width, height);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => {
        // Fallback procedural
        img.src = generateProceduralCinematicFrame(scene, aspectRatio, visualStyleName, width, height);
        img.onload = () => resolve();
      };
      img.src = srcUrl!;
    });
    loadedImages.push(img);
  }

  onProgress(35, 'Inisialisasi perekam video canvas...');

  // Setup offscreen recording canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context 2D tidak didukung pada browser ini.');
  }

  // Determine media recorder mime type
  const mimeTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4;codecs=h264,aac',
    'video/mp4',
  ];
  let chosenMime = '';
  for (const m of mimeTypes) {
    if (MediaRecorder.isTypeSupported(m)) {
      chosenMime = m;
      break;
    }
  }

  const fps = 30;
  const canvasStream = canvas.captureStream(fps);

  // Combine with audio stream if requested
  let combinedStream = canvasStream;
  if (includeAudio) {
    globalAudio.startAtmosphere();
    const audioDest = globalAudio.getAudioDestinationStream();
    if (audioDest && audioDest.stream.getAudioTracks().length > 0) {
      combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...audioDest.stream.getAudioTracks(),
      ]);
    }
  }

  const recorderOptions: MediaRecorderOptions = chosenMime ? { mimeType: chosenMime, videoBitsPerSecond: 8000000 } : {};
  const recorder = new MediaRecorder(combinedStream, recorderOptions);

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  const totalDuration = scenes.reduce((acc, s) => acc + (s.duration || 3.5), 0);
  const totalFrames = Math.ceil(totalDuration * fps);

  recorder.start(100); // chunk every 100ms

  // Frame-by-frame rendering loop
  let currentSceneIdx = 0;
  let sceneElapsedSec = 0;
  const frameIntervalSec = 1 / fps;

  for (let frame = 0; frame < totalFrames; frame++) {
    const currentScene = scenes[currentSceneIdx];
    const currentImg = loadedImages[currentSceneIdx];
    const sceneDuration = currentScene.duration || 3.5;

    // Progress percentage
    const percent = 35 + Math.floor((frame / totalFrames) * 60);
    if (frame % 15 === 0) {
      onProgress(percent, `Rendering video frame ${frame + 1} / ${totalFrames} (${Math.round((frame / fps) * 10) / 10}s)...`);
    }

    // Render current frame with Ken Burns Motion Effect
    const progressInScene = Math.min(1, sceneElapsedSec / sceneDuration);

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Compute scale and translation for Ken Burns
    const motion = currentScene.motionEffect || (currentSceneIdx % 2 === 0 ? 'zoom-in' : 'pan-right');
    let scale = 1.0;
    let offsetX = 0;
    let offsetY = 0;

    if (motion === 'zoom-in') {
      scale = 1.0 + progressInScene * 0.12;
    } else if (motion === 'zoom-out') {
      scale = 1.12 - progressInScene * 0.12;
    } else if (motion === 'pan-right') {
      scale = 1.08;
      offsetX = (progressInScene - 0.5) * 60;
    } else if (motion === 'pan-left') {
      scale = 1.08;
      offsetX = (0.5 - progressInScene) * 60;
    }

    ctx.save();
    // Center of canvas
    ctx.translate(width / 2 + offsetX, height / 2 + offsetY);
    ctx.scale(scale, scale);

    // Draw image maintaining aspect ratio cover
    const imgRatio = currentImg.naturalWidth / currentImg.naturalHeight;
    const canvasRatio = width / height;
    let drawW = width;
    let drawH = height;

    if (imgRatio > canvasRatio) {
      drawH = height;
      drawW = height * imgRatio;
    } else {
      drawW = width;
      drawH = width / imgRatio;
    }

    ctx.drawImage(currentImg, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Check transition overlap with next scene
    const transitionDuration = 0.6; // 600ms
    const timeLeftInScene = sceneDuration - sceneElapsedSec;
    if (
      transition !== 'cut' &&
      timeLeftInScene <= transitionDuration &&
      currentSceneIdx < scenes.length - 1
    ) {
      const nextImg = loadedImages[currentSceneIdx + 1];
      const transProgress = (transitionDuration - timeLeftInScene) / transitionDuration;

      if (transition === 'crossfade') {
        ctx.save();
        ctx.globalAlpha = transProgress;
        ctx.drawImage(nextImg, 0, 0, width, height);
        ctx.restore();
      } else if (transition === 'fade-to-black') {
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.sin(transProgress * Math.PI)})`;
        ctx.fillRect(0, 0, width, height);
      }
    }

    // Vignette & Cinematic Letterbox Polish
    const vigGrad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.35,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.75
    );
    vigGrad.addColorStop(0, 'transparent');
    vigGrad.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtitle & Caption Rendering
    if (includeSubtitles && currentScene.narrative) {
      const bannerHeight = Math.max(90, Math.floor(height * 0.12));
      const bannerY = height - bannerHeight;

      // Dark gradient bar for readability
      const textBg = ctx.createLinearGradient(0, bannerY - 30, 0, height);
      textBg.addColorStop(0, 'transparent');
      textBg.addColorStop(0.4, 'rgba(0, 0, 0, 0.7)');
      textBg.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
      ctx.fillStyle = textBg;
      ctx.fillRect(0, bannerY - 30, width, bannerHeight + 30);

      // Subtitle text
      ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      ctx.fillStyle = '#fef08a'; // subtle soft yellow
      ctx.fillText(`“${currentScene.narrative}”`, width / 2, bannerY + bannerHeight * 0.45);

      // Scene badge on subtitle
      ctx.font = '500 13px "JetBrains Mono", monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.shadowBlur = 0;
      ctx.fillText(
        `Adegan ${currentScene.sceneNumber}: ${currentScene.title} • ${currentScene.cameraAngle}`,
        width / 2,
        bannerY + bannerHeight * 0.8
      );
    }

    // Step timeline forward
    sceneElapsedSec += frameIntervalSec;
    if (sceneElapsedSec >= sceneDuration && currentSceneIdx < scenes.length - 1) {
      currentSceneIdx++;
      sceneElapsedSec = 0;
    }

    // Allow frame processing tick
    if (frame % 3 === 0) {
      await new Promise((r) => setTimeout(r, 12));
    }
  }

  onProgress(96, 'Menyelesaikan kompilasi video...');
  recorder.stop();

  if (includeAudio) {
    globalAudio.stopAtmosphere();
  }

  const finalBlob = await new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      const type = chosenMime || 'video/webm';
      resolve(new Blob(chunks, { type }));
    };
  });

  const extension = finalBlob.type.includes('mp4') ? 'mp4' : 'webm';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `CineBoard_Video_${timestamp}.${extension}`;
  const downloadUrl = URL.createObjectURL(finalBlob);

  onProgress(100, 'Video berhasil dibuat!');

  return {
    blob: finalBlob,
    downloadUrl,
    filename,
  };
}
