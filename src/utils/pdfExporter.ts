import { jsPDF } from 'jspdf';
import { StoryboardProject, ScenePanel, AspectRatio } from '../types';
import { ASPECT_RATIOS } from '../constants/presets';
import { generateProceduralCinematicFrame } from './proceduralCanvas';

export interface PdfExportOptions {
  project: StoryboardProject;
  theme: 'dark' | 'light';
  layoutMode: 'detailed' | 'compact';
  includeCoverPage: boolean;
  includeScriptText: boolean;
  includePrompts: boolean;
  includeReviewerSignOff: boolean;
  includeConsistencyProfile: boolean;
  reviewerName?: string;
  productionCompany?: string;
  onProgress?: (percent: number, statusText: string) => void;
}

/**
 * Prepares image for embedding into PDF
 */
async function getSceneJpegDataUrl(
  scene: ScenePanel,
  aspectRatio: AspectRatio,
  visualStyle: string
): Promise<string> {
  const aspectConfig = ASPECT_RATIOS.find((a) => a.id === aspectRatio) || ASPECT_RATIOS[0];
  const targetW = 800;
  const targetH = Math.round((targetW * aspectConfig.height) / aspectConfig.width);

  if (scene.imageUrl && scene.imageUrl.startsWith('data:image/')) {
    return scene.imageUrl;
  }

  // If there's an external or blob image URL, attempt to load onto canvas
  if (scene.imageUrl) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = scene.imageUrl!;
      });

      const offCanvas = document.createElement('canvas');
      offCanvas.width = targetW;
      offCanvas.height = targetH;
      const ctx = offCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, targetW, targetH);
        return offCanvas.toDataURL('image/jpeg', 0.85);
      }
    } catch (_) {
      // Fall through to procedural fallback
    }
  }

  // Fallback to procedural high-res cinematic frame
  return generateProceduralCinematicFrame(scene, aspectRatio, visualStyle, targetW, targetH);
}

export async function exportStoryboardToPdf(options: PdfExportOptions): Promise<{
  blob: Blob;
  downloadUrl: string;
  filename: string;
  doc: jsPDF;
}> {
  const {
    project,
    theme,
    layoutMode,
    includeCoverPage,
    includeScriptText,
    includePrompts,
    includeReviewerSignOff,
    includeConsistencyProfile,
    reviewerName,
    productionCompany,
    onProgress = () => {},
  } = options;

  onProgress(5, 'Menyiapkan dokumen PDF...');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Theme Palettes
  const isDark = theme === 'dark';
  const colors = isDark
    ? {
        bg: [10, 10, 12],
        cardBg: [20, 20, 26],
        cardBorder: [45, 45, 55],
        textPrimary: [245, 245, 247],
        textSecondary: [160, 160, 175],
        textMuted: [110, 110, 125],
        accent: [245, 158, 11], // amber
        accentBg: [40, 28, 10],
        accentBorder: [180, 110, 10],
        badgeBg: [30, 30, 38],
        divider: [40, 40, 48],
      }
    : {
        bg: [255, 255, 255],
        cardBg: [248, 249, 251],
        cardBorder: [220, 224, 230],
        textPrimary: [20, 24, 33],
        textSecondary: [75, 85, 99],
        textMuted: [130, 140, 150],
        accent: [217, 119, 6], // amber 600
        accentBg: [254, 243, 199],
        accentBorder: [245, 158, 11],
        badgeBg: [238, 242, 246],
        divider: [226, 232, 240],
      };

  const applyPageBg = () => {
    doc.setFillColor(colors.bg[0], colors.bg[1], colors.bg[2]);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  };

  // Header and Footer for inner pages
  const drawPageChrome = (pageNum: number, totalEstPages?: number) => {
    // Top running header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.text('CINEBOARD AI', margin, 9);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
    doc.text(` |  ${project.title.substring(0, 50)}  •  Professional Review Document`, margin + 22, 9);

    doc.setDrawColor(colors.divider[0], colors.divider[1], colors.divider[2]);
    doc.setLineWidth(0.2);
    doc.line(margin, 11, pageWidth - margin, 11);

    // Bottom running footer
    doc.line(margin, pageHeight - 11, pageWidth - margin, pageHeight - 11);
    doc.setFontSize(7);
    doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
    const dateStr = new Date().toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    doc.text(`Generated: ${dateStr} • Confidential & Proprietary Review`, margin, pageHeight - 7);
  };

  // Pre-load all scene images
  onProgress(15, 'Memuat visual still adegan...');
  const sceneImages: string[] = [];
  for (let i = 0; i < project.scenes.length; i++) {
    onProgress(
      15 + Math.floor((i / project.scenes.length) * 35),
      `Mengoptimalkan visual adegan ${i + 1}/${project.scenes.length}...`
    );
    const imgData = await getSceneJpegDataUrl(
      project.scenes[i],
      project.aspectRatio,
      project.visualStyle
    );
    sceneImages.push(imgData);
  }

  const totalScenes = project.scenes.length;
  const totalDuration = project.scenes.reduce((acc, s) => acc + (s.duration || 3.5), 0);

  // ---------------------------------------------------------------------------
  // 1. COVER / LOGLINE PAGE
  // ---------------------------------------------------------------------------
  if (includeCoverPage) {
    onProgress(55, 'Menyusun halaman sampul eksekutif...');
    applyPageBg();

    // Top Brand Pill
    doc.setFillColor(colors.accentBg[0], colors.accentBg[1], colors.accentBg[2]);
    doc.setDrawColor(colors.accentBorder[0], colors.accentBorder[1], colors.accentBorder[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, 22, 58, 7, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.text('STORYBOARD & SCRIPT DECK', margin + 3, 26.8);

    // Project Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(colors.textPrimary[0], colors.textPrimary[1], colors.textPrimary[2]);
    const splitTitle = doc.splitTextToSize(project.title, contentWidth);
    doc.text(splitTitle, margin, 40);

    let curY = 40 + splitTitle.length * 9;

    // Subtitle / Logline
    if (project.description) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2]);
      const splitDesc = doc.splitTextToSize(project.description, contentWidth);
      doc.text(splitDesc, margin, curY);
      curY += splitDesc.length * 5.5 + 6;
    } else {
      curY += 6;
    }

    // Divider
    doc.setDrawColor(colors.divider[0], colors.divider[1], colors.divider[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, curY, pageWidth - margin, curY);
    curY += 8;

    // Production Specs Bento Grid Box
    doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
    doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, curY, contentWidth, 38, 3, 3, 'FD');

    // Specs Grid: 4 columns
    const colW = contentWidth / 4;
    const specItems = [
      { label: 'TOTAL PANELS', value: `${totalScenes} Adegan` },
      { label: 'EST. RUNNING TIME', value: `${totalDuration.toFixed(1)} Detik` },
      { label: 'ASPECT RATIO', value: project.aspectRatio },
      { label: 'TRANSITION', value: project.transition.toUpperCase() },
    ];

    specItems.forEach((spec, i) => {
      const colX = margin + i * colW + 4;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
      doc.text(spec.label, colX, curY + 9);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      doc.text(spec.value, colX, curY + 16);
    });

    // Row 2 of Specs: Style and Lighting
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
    doc.text('VISUAL STYLE PRESET', margin + 4, curY + 24);
    doc.text('LIGHTING & ATMOSPHERE', margin + colW * 2 + 4, curY + 24);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(colors.textPrimary[0], colors.textPrimary[1], colors.textPrimary[2]);
    doc.text(doc.splitTextToSize(project.visualStyle.split('-')[0].trim(), colW * 2 - 8), margin + 4, curY + 30);
    doc.text(doc.splitTextToSize(project.lightingStyle.split('-')[0].trim(), colW * 2 - 8), margin + colW * 2 + 4, curY + 30);

    curY += 46;

    // Feature Hero Image Preview (First Scene Still)
    if (sceneImages[0]) {
      const aspectConfig = ASPECT_RATIOS.find((a) => a.id === project.aspectRatio) || ASPECT_RATIOS[0];
      const previewW = contentWidth;
      const previewH = Math.min(68, (previewW * aspectConfig.height) / aspectConfig.width);

      try {
        doc.addImage(sceneImages[0], 'JPEG', margin, curY, previewW, previewH);
        doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
        doc.setLineWidth(0.3);
        doc.rect(margin, curY, previewW, previewH, 'S');

        // Label on image
        doc.setFillColor(colors.bg[0], colors.bg[1], colors.bg[2]);
        doc.roundedRect(margin + 3, curY + 3, 50, 6, 1.5, 1.5, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        doc.text('OPENING STILL: SCENE #1', margin + 5, curY + 7);

        curY += previewH + 8;
      } catch (_) {}
    }

    // Consistency Profile Card
    if (includeConsistencyProfile && project.consistencyProfile) {
      doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
      doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
      doc.roundedRect(margin, curY, contentWidth, 34, 2.5, 2.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      doc.text('CONTINUITY ANCHORS & CHARACTER PROFILE', margin + 4, curY + 6.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
      doc.text('PROTAGONIST / LEAD:', margin + 4, curY + 12);
      doc.text('WORLD / SETTING:', margin + contentWidth / 2 + 2, curY + 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2]);

      const protText = project.consistencyProfile.protagonist || 'Tidak ada catatan karakter spesifik';
      const envText = project.consistencyProfile.environment || 'Tidak ada catatan latar spesifik';
      doc.text(doc.splitTextToSize(protText, contentWidth / 2 - 8), margin + 4, curY + 16.5);
      doc.text(doc.splitTextToSize(envText, contentWidth / 2 - 8), margin + contentWidth / 2 + 2, curY + 16.5);

      curY += 40;
    }

    // Reviewer & Production Sign-off metadata in cover bottom
    const bottomBlockY = Math.max(curY, pageHeight - 38);
    doc.setDrawColor(colors.divider[0], colors.divider[1], colors.divider[2]);
    doc.line(margin, bottomBlockY, pageWidth - margin, bottomBlockY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(colors.textPrimary[0], colors.textPrimary[1], colors.textPrimary[2]);
    doc.text(productionCompany || 'CineBoard AI Production Studio', margin, bottomBlockY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
    const reviewerString = reviewerName ? `Target Reviewer: ${reviewerName}  •  ` : '';
    doc.text(`${reviewerString}Date: ${new Date().toLocaleDateString('id-ID')}`, margin, bottomBlockY + 9.5);

    doc.text('Status: READY FOR CLIENT & DIRECTOR APPROVAL', pageWidth - margin - 75, bottomBlockY + 5);

    // End of cover page
    doc.addPage();
  }

  // ---------------------------------------------------------------------------
  // 2. FULL SCRIPT / LYRICS TREATMENT PAGE (IF REQUESTED & PRESENT)
  // ---------------------------------------------------------------------------
  if (includeScriptText && project.rawSourceText && project.rawSourceText.trim()) {
    onProgress(65, 'Menyusun naskah & lirik narasi...');
    applyPageBg();
    drawPageChrome(doc.getNumberOfPages());

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(colors.textPrimary[0], colors.textPrimary[1], colors.textPrimary[2]);
    doc.text(
      project.sourceType === 'lyrics'
        ? 'ORIGINAL LYRICS & MUSIC VIDEO TREATMENT'
        : 'ORIGINAL SCRIPT & STORY TREATMENT',
      margin,
      22
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2]);
    doc.text(
      'Naskah acuan yang digunakan untuk menurunkan panel visual adegan di bawah ini.',
      margin,
      27
    );

    doc.setDrawColor(colors.divider[0], colors.divider[1], colors.divider[2]);
    doc.line(margin, 29, pageWidth - margin, 29);

    // Boxed raw script
    doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
    doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
    doc.roundedRect(margin, 33, contentWidth, pageHeight - 52, 2, 2, 'FD');

    doc.setFont('courier', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(colors.textPrimary[0], colors.textPrimary[1], colors.textPrimary[2]);

    const scriptLines = doc.splitTextToSize(project.rawSourceText, contentWidth - 10);
    const maxLinesPerPage = 42;
    const firstPageLines = scriptLines.slice(0, maxLinesPerPage);
    doc.text(firstPageLines, margin + 5, 40);

    // If script is longer than 1 page
    if (scriptLines.length > maxLinesPerPage) {
      doc.addPage();
      applyPageBg();
      drawPageChrome(doc.getNumberOfPages());

      doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
      doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
      doc.roundedRect(margin, 20, contentWidth, pageHeight - 38, 2, 2, 'FD');

      const remainingLines = scriptLines.slice(maxLinesPerPage, maxLinesPerPage * 2);
      doc.text(remainingLines, margin + 5, 27);
    }

    doc.addPage();
  }

  // ---------------------------------------------------------------------------
  // 3. SCENE BREAKDOWN PANELS (DETAILED OR COMPACT)
  // ---------------------------------------------------------------------------
  onProgress(75, 'Menyusun rincian panel adegan...');

  if (layoutMode === 'detailed') {
    // 2 Detailed Scenes per Page or 1 Scene per Page if detailed prompts/signoff
    // Standard professional format: 2 scenes per page with image, metadata, dialogue/narrative, camera, prompt, and review check
    const scenesPerPage = 2;
    const cardHeight = (pageHeight - 32) / scenesPerPage;

    for (let i = 0; i < project.scenes.length; i++) {
      const sceneIndexOnPage = i % scenesPerPage;
      if (sceneIndexOnPage === 0) {
        if (i > 0) doc.addPage();
        applyPageBg();
        drawPageChrome(doc.getNumberOfPages());
      }

      const scene = project.scenes[i];
      const imgData = sceneImages[i];
      const cardY = 16 + sceneIndexOnPage * cardHeight;

      // Card Container
      doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
      doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, cardY, contentWidth, cardHeight - 5, 3, 3, 'FD');

      // Top Scene Header Bar inside Card
      doc.setFillColor(colors.badgeBg[0], colors.badgeBg[1], colors.badgeBg[2]);
      doc.roundedRect(margin + 1, cardY + 1, contentWidth - 2, 8.5, 2, 2, 'F');

      // Scene Number Badge
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      doc.text(`PANEL #${scene.sceneNumber}`, margin + 4, cardY + 6.5);

      // Scene Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(colors.textPrimary[0], colors.textPrimary[1], colors.textPrimary[2]);
      doc.text(scene.title.substring(0, 42), margin + 28, cardY + 6.5);

      // Duration & Camera Badge
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2]);
      const timeAndAngle = `${(scene.duration || 3.5).toFixed(1)}s  |  ${scene.cameraAngle || 'Medium Shot'}`;
      doc.text(timeAndAngle, pageWidth - margin - 45, cardY + 6.5);

      // Layout Inside Card: Left Column (Image Still), Right Column (Specs & Narrative)
      const aspectConfig = ASPECT_RATIOS.find((a) => a.id === project.aspectRatio) || ASPECT_RATIOS[0];
      const imgColWidth = 64;
      const imgColHeight = Math.min(48, (imgColWidth * aspectConfig.height) / aspectConfig.width);
      const imgY = cardY + 12;

      // Render Still Image
      if (imgData) {
        try {
          doc.addImage(imgData, 'JPEG', margin + 3, imgY, imgColWidth, imgColHeight);
          doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
          doc.rect(margin + 3, imgY, imgColWidth, imgColHeight, 'S');
        } catch (_) {}
      }

      // Metadata tags below image
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
      doc.text('LIGHTING:', margin + 3, imgY + imgColHeight + 4);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2]);
      doc.text((scene.lighting || 'Cinematic').substring(0, 24), margin + 17, imgY + imgColHeight + 4);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
      doc.text('MOTION:', margin + 3, imgY + imgColHeight + 8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2]);
      doc.text((scene.motionEffect || 'zoom-in').toUpperCase(), margin + 17, imgY + imgColHeight + 8);

      // Right Column Content (Narrative, Action Description, Technical Prompt)
      const rightColX = margin + imgColWidth + 7;
      const rightColW = contentWidth - imgColWidth - 10;
      let fieldY = cardY + 13;

      // Narrative / Dialogue / Voiceover Box
      if (scene.narrative) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        doc.text('SCRIPT VOICEOVER / DIALOGUE:', rightColX, fieldY);
        fieldY += 3.5;

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7.5);
        doc.setTextColor(colors.textPrimary[0], colors.textPrimary[1], colors.textPrimary[2]);
        const splitNarrative = doc.splitTextToSize(`“${scene.narrative}”`, rightColW);
        doc.text(splitNarrative.slice(0, 3), rightColX, fieldY);
        fieldY += Math.min(splitNarrative.length, 3) * 3.5 + 2;
      }

      // Visual Action Description
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
      doc.text('SCENE VISUAL ACTION:', rightColX, fieldY);
      fieldY += 3.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2]);
      const splitDesc = doc.splitTextToSize(scene.visualDescription || scene.title, rightColW);
      doc.text(splitDesc.slice(0, 3), rightColX, fieldY);
      fieldY += Math.min(splitDesc.length, 3) * 3.5 + 2;

      // Cinematic Technical Prompt (for AI / VFX Reproduction)
      if (includePrompts && scene.cinematicPrompt) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
        doc.text('CINEMATIC AI / VFX PROMPT:', rightColX, fieldY);
        fieldY += 3.2;

        doc.setFont('courier', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(colors.textSecondary[0], colors.textSecondary[1], colors.textSecondary[2]);
        const splitPrompt = doc.splitTextToSize(scene.cinematicPrompt, rightColW);
        doc.text(splitPrompt.slice(0, 2), rightColX, fieldY);
        fieldY += Math.min(splitPrompt.length, 2) * 3 + 2;
      }

      // Professional Reviewer Sign-Off Box inside Card
      if (includeReviewerSignOff) {
        const signOffY = cardY + cardHeight - 17;
        doc.setDrawColor(colors.divider[0], colors.divider[1], colors.divider[2]);
        doc.line(margin + 3, signOffY, pageWidth - margin - 3, signOffY);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
        doc.text('PANEL REVIEW & SIGN-OFF:', margin + 3, signOffY + 4);

        // Checkboxes
        doc.setDrawColor(colors.accentBorder[0], colors.accentBorder[1], colors.accentBorder[2]);
        doc.rect(margin + 42, signOffY + 1.8, 2.8, 2.8);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(colors.textPrimary[0], colors.textPrimary[1], colors.textPrimary[2]);
        doc.text('Approved', margin + 46, signOffY + 4);

        doc.rect(margin + 62, signOffY + 1.8, 2.8, 2.8);
        doc.text('Revision Needed', margin + 66, signOffY + 4);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
        doc.text('Director Notes: __________________________________________________________________', margin + 92, signOffY + 4);
      }
    }
  } else {
    // Compact Grid: 4 Scenes per Page (Thumbnail contact sheet style with metadata)
    const scenesPerPage = 4;
    const cardHeight = (pageHeight - 32) / 4;

    for (let i = 0; i < project.scenes.length; i++) {
      const sceneIndexOnPage = i % scenesPerPage;
      if (sceneIndexOnPage === 0) {
        if (i > 0) doc.addPage();
        applyPageBg();
        drawPageChrome(doc.getNumberOfPages());
      }

      const scene = project.scenes[i];
      const imgData = sceneImages[i];
      const cardY = 15 + sceneIndexOnPage * cardHeight;

      doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
      doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
      doc.roundedRect(margin, cardY, contentWidth, cardHeight - 4, 2, 2, 'FD');

      // Still Image
      const imgW = 48;
      const aspectConfig = ASPECT_RATIOS.find((a) => a.id === project.aspectRatio) || ASPECT_RATIOS[0];
      const imgH = Math.min(cardHeight - 8, (imgW * aspectConfig.height) / aspectConfig.width);
      if (imgData) {
        try {
          doc.addImage(imgData, 'JPEG', margin + 2, cardY + 2, imgW, imgH);
          doc.setDrawColor(colors.cardBorder[0], colors.cardBorder[1], colors.cardBorder[2]);
          doc.rect(margin + 2, cardY + 2, imgW, imgH, 'S');
        } catch (_) {}
      }

      // Text block
      const textX = margin + imgW + 5;
      const textW = contentWidth - imgW - 8;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      doc.text(`Scene #${scene.sceneNumber}: ${scene.title}`, textX, cardY + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
      doc.text(`Duration: ${(scene.duration || 3.5).toFixed(1)}s  •  Camera: ${scene.cameraAngle}  •  Lighting: ${scene.lighting}`, textX, cardY + 10);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(colors.textPrimary[0], colors.textPrimary[1], colors.textPrimary[2]);
      if (scene.narrative) {
        const narrativeLines = doc.splitTextToSize(`“${scene.narrative}”`, textW);
        doc.text(narrativeLines.slice(0, 2), textX, cardY + 15);
      } else {
        const descLines = doc.splitTextToSize(scene.visualDescription, textW);
        doc.text(descLines.slice(0, 2), textX, cardY + 15);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 4. NUMBER ALL PAGES (Page X of Y)
  // ---------------------------------------------------------------------------
  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
    doc.text(`Page ${page} of ${totalPages}`, pageWidth - margin - 18, pageHeight - 7);
  }

  onProgress(95, 'Mengemas dokumen PDF siap unduh...');

  const pdfBlob = doc.output('blob');
  const downloadUrl = URL.createObjectURL(pdfBlob);
  const cleanTitle = project.title.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_') || 'Storyboard';
  const filename = `${cleanTitle}_Script_Review_Deck.pdf`;

  onProgress(100, 'Dokumen PDF berhasil dibuat!');

  return {
    blob: pdfBlob,
    downloadUrl,
    filename,
    doc,
  };
}
