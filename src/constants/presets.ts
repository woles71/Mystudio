import { VisualStylePreset, LightingPreset, AspectRatio, CameraAngle } from '../types';

export const ASPECT_RATIOS: { id: AspectRatio; label: string; ratio: number; iconDesc: string; width: number; height: number }[] = [
  { id: '16:9', label: '16:9 Cinema Widescreen', ratio: 16 / 9, iconDesc: 'Lanskap Standar / Film / YouTube', width: 1920, height: 1080 },
  { id: '9:16', label: '9:16 Vertical Story', ratio: 9 / 16, iconDesc: 'Format Vertikal / TikTok / Reels / Shorts', width: 1080, height: 1920 },
  { id: '21:9', label: '21:9 Anamorphic Ultrawide', ratio: 21 / 9, iconDesc: 'Format Teatrikal Layar Lebar Ultra Sinematik', width: 2560, height: 1080 },
  { id: '4:3', label: '4:3 Vintage Academy', ratio: 4 / 3, iconDesc: 'Rasio Klasik Film Analog & Televisi Retro', width: 1440, height: 1080 },
  { id: '1:1', label: '1:1 Square Art', ratio: 1, iconDesc: 'Format Kotak / Album Cover / Instagram', width: 1080, height: 1080 },
];

export const VISUAL_STYLE_PRESETS: VisualStylePreset[] = [
  {
    id: 'cinematic-35mm',
    name: 'Cinematic 35mm Analog Film',
    description: 'Tone organik film Kodak Vision3 500T, butiran film halus, dynamic range lebar, warna hangat nostalgia.',
    promptSuffix: 'cinematic 35mm photograph, shot on Arri Alexa with vintage anamorphic lens, fine 35mm film grain, rich color science, authentic skin tones, high cinematic fidelity, 8k resolution',
    colorBadge: 'from-amber-600 to-amber-950',
    filmLook: 'Kodak Vision3 500T',
  },
  {
    id: 'cyberpunk-neonoir',
    name: 'Cyberpunk Neo-Noir',
    description: 'Atmosfer futuristik basah oleh hujan, pantulan lampu neon cyan dan magenta, kabut holografik, bayangan kontras.',
    promptSuffix: 'cyberpunk neo-noir aesthetics, blade runner 2049 inspired, rain-slicked dark pavement, holographic neon reflections, volumetric haze, atmospheric steam, anamorphic horizontal lens flare, hyper-detailed',
    colorBadge: 'from-cyan-500 to-fuchsia-900',
    filmLook: 'Technicolor Neo-Glow',
  },
  {
    id: 'anime-shinkai',
    name: 'Makoto Shinkai Anime Aesthetic',
    description: 'Langit magis penuh awan berdimensi, cahaya matahari berkilau, detail arsitektur fotorealistik bernuansa melankolis.',
    promptSuffix: 'Makoto Shinkai style, CoMix Wave Films visual aesthetic, magnificent towering cumulonimbus clouds, sparkling golden lens flare, hyper-detailed anime background art, vibrant twilight sky, emotive beauty',
    colorBadge: 'from-sky-400 to-indigo-900',
    filmLook: 'Vibrant Anime Cel',
  },
  {
    id: 'dark-gothic-fantasy',
    name: 'Dark Gothic Fantasy',
    description: 'Nuansa mistis kelam, kastil tua, kabut tebal, ornamen barok, dan estetika gelap yang megah.',
    promptSuffix: 'dark gothic fantasy, dark romanticism, Guillermo del Toro mood, Elden Ring aesthetics, ancient weathered stone, dramatic shadows, mystical embers, ornate baroque textures, painterly realism',
    colorBadge: 'from-stone-600 to-neutral-900',
    filmLook: 'Baroque Oil & Shadows',
  },
  {
    id: 'wes-anderson-pastel',
    name: 'Symmetrical Pastel Cinema',
    description: 'Komposisi simetri ketat ala Wes Anderson, palet warna pastel hangat yang terkurasi, suasana quirky dan puitis.',
    promptSuffix: 'Wes Anderson directorial style, perfectly centered symmetrical composition, whimsical warm pastel color palette, meticulous set design, flat perspective, 35mm vintage camera, quirky nostalgic atmosphere',
    colorBadge: 'from-yellow-300 to-rose-400',
    filmLook: 'Kodachrome Pastel',
  },
  {
    id: 'ghibli-watercolor',
    name: 'Studio Ghibli Lush Watercolor',
    description: 'Lukisan tangan cat air bernuansa alam yang rimbun, pedesaan damai, angin sepoi-sepoi, dan rasa hangat.',
    promptSuffix: 'Studio Ghibli visual style, Hayao Miyazaki inspired, lush hand-painted watercolor background, rich emerald greens, gentle summer breeze, fluffy painterly clouds, nostalgic warmth, masterwork anime art',
    colorBadge: 'from-emerald-400 to-teal-900',
    filmLook: 'Hand-painted Cel & Gouache',
  },
  {
    id: 'interstellar-scifi',
    name: 'Interstellar IMAX Sci-Fi',
    description: 'Visual kosmos realistis, tekstur logam pesawat luar angkasa yang aus, kedalaman ruang hampa, skala raksasa.',
    promptSuffix: 'Christopher Nolan Interstellar style, shot on 70mm IMAX, hyper-realistic deep space cinematography, authentic spacecraft hull textures, cosmic nebula backlight, scientifically grounded aesthetic, epic scale',
    colorBadge: 'from-blue-600 to-slate-950',
    filmLook: 'IMAX 70mm Clean',
  },
  {
    id: 'monochrome-noir',
    name: 'Dramatic Monochromatic Noir',
    description: 'Hitam-putih berbobot, bayangan garis tirai venetian, kontras tinggi, ekspresionisme film klasik 1940-an.',
    promptSuffix: 'classic film noir, deep black and white cinematography, dramatic chiaroscuro lighting, venetian blind cast shadows, rich silver haloid grain, 1940s mystery cinema, moody high contrast atmosphere',
    colorBadge: 'from-neutral-300 to-neutral-950',
    filmLook: 'Silver Gelatin B&W',
  },
];

export const LIGHTING_PRESETS: LightingPreset[] = [
  {
    id: 'golden-hour',
    name: 'Golden Hour Sunset',
    description: 'Sinar matahari senja keemasan rendah dengan bayangan panjang, hangat, dan lembut.',
    promptKeywords: 'warm golden hour sunlight, low sun angle, long gentle shadows, warm ambient rim light, soft lens flare, dusk glow',
    mood: 'Hangat, Emosional, Puitis',
    iconColor: 'text-amber-400',
  },
  {
    id: 'volumetric-godrays',
    name: 'Volumetric God Rays (Crepuscular)',
    description: 'Berkas cahaya menembus kabut, jendela kaca, atau kanopi pepohonan yang dramatis.',
    promptKeywords: 'dramatic volumetric god rays, sunbeams piercing through mist, atmospheric particles, crepuscular light shafts, majestic depth',
    mood: 'Megah, Spiritual, Sinematik',
    iconColor: 'text-yellow-200',
  },
  {
    id: 'dramatic-chiaroscuro',
    name: 'Dramatic Chiaroscuro',
    description: 'Kontras ekstrem antara area terang dan gelap gulita, menonjolkan tekstur dan ketegangan.',
    promptKeywords: 'intense chiaroscuro lighting, deep tenebrism, Rembrandt key lighting, dark velvety shadows, dramatic specular highlights',
    mood: 'Tegang, Misterius, Intens',
    iconColor: 'text-stone-300',
  },
  {
    id: 'cyber-neon-bicolor',
    name: 'Cyberpunk Bi-Color Neon',
    description: 'Pencahayaan ganda neon cyan dan magenta dari dua sisi yang saling mengontraskan subjek.',
    promptKeywords: 'cyberpunk dual lighting, bright cyan key light, contrasting hot magenta rim light, neon tube reflections, dark gritty backdrop',
    mood: 'Futuristik, Dinamis, Elektrik',
    iconColor: 'text-fuchsia-400',
  },
  {
    id: 'soft-diffused-overcast',
    name: 'Soft Diffused Overcast',
    description: 'Cahaya lembut alami mendung abu-abu tanpa bayangan tajam, warna netral alami yang tenang.',
    promptKeywords: 'soft diffused overcast daylight, gloomy Scandinavian sky, delicate wrapping shadow, matte skin texture, serene melancholic tone',
    mood: 'Tenang, Melankolis, Realistis',
    iconColor: 'text-slate-300',
  },
  {
    id: 'moody-rim-silhouette',
    name: 'Moody Edge & Rim Light',
    description: 'Garis cahaya tegas mengitari siluet karakter memisahkannya dari kegelapan latar.',
    promptKeywords: 'strong edge rim lighting, character silhouette outline, backlit separation from dark background, cinematic halo glow',
    mood: 'Ikonik, Misterius, Epik',
    iconColor: 'text-indigo-300',
  },
  {
    id: 'bioluminescent-moonlight',
    name: 'Bioluminescent & Cool Moonlight',
    description: 'Sinar rembulan perak kebiruan dipadu pendaran cahaya alami flora/fauna yang magis.',
    promptKeywords: 'cool silver moonlight, ethereal blue and teal bioluminescent accents, magical glow, serene midnight atmosphere, soft starlight',
    mood: 'Ajaib, Tenang, Fantastis',
    iconColor: 'text-emerald-300',
  },
  {
    id: 'hard-noon-sunlight',
    name: 'Hard Sunlight & Deep Cut Shadows',
    description: 'Matahari terik siang hari dengan bayangan tajam hitam pekat, cocok untuk tema gurun atau aksi panas.',
    promptKeywords: 'harsh direct midday sunlight, sharp crisp shadows, high contrast specular shine, intense heat haze, brutalist lighting',
    mood: 'Keras, Bertahan Hidup, Tegas',
    iconColor: 'text-orange-400',
  },
];

export const CAMERA_ANGLES: CameraAngle[] = [
  'Extreme Wide Shot',
  'Wide Shot',
  'Medium Shot',
  'Close-Up',
  'Extreme Close-Up',
  'Low Angle Heroic',
  'High Angle Overlook',
  'Dutch Angle / Tilted',
  'Over The Shoulder',
  'Drone Aerial Shot',
];

export const SAMPLE_STORIES = [
  {
    id: 'sample-cyberpunk-jakarta',
    title: 'Jakarta 2088: Neon & Rain',
    type: 'story' as const,
    description: 'Cerita detektif siber menelusuri lorong Glodok futuristik di bawah guyuran hujan asam.',
    text: `Di lantai 42 menara Kota Tua Baru, detektif siber Kaelen menatap kabel serat optik yang terbakar di tangannya. Hujan asam mengetuk kaca jendela dengan suara monoton. Kaelen mengenakan jas hujan sintetis transparan dengan emblem kepolisian yang sudah luntur. Di seberang jalan raya gantung, hologram naga raksasa meliuk di antara gedung pencakar langit berbalut kabut neon biru dan ungu. 

Dia melangkah keluar ke balkon basah, menatap ke jurang kota di bawahnya di mana bajaj bertenaga maglev meluncur senyap di antara kabut. Kaelen meraba saku mantelnya, mengeluarkan sebuah chip memori kristal yang memancarkan cahaya jingga berdenyut pelan. Tiba-tiba di sudut bayangan atap seberang, sebuah drone pengintai berlensa merah menyala dan mengunci tatapan padanya. Kaelen menarik tudung kepalanya, melompat ke tangga darurat, memulai pelarian di tengah malam yang basah.`,
    suggestedStyle: 'cyberpunk-neonoir',
    suggestedLighting: 'cyber-neon-bicolor',
    targetScenes: 5,
  },
  {
    id: 'sample-lyrics-hujan-stasiun',
    title: 'Lirik Lagu: Hujan Terakhir di Stasiun Senja',
    type: 'lyrics' as const,
    description: 'Lirik lagu balada melankolis tentang perpisahan di peron kereta api tua.',
    text: `[Bait 1]
Lampu peron mulai temaram menyala
Kereta senja bersiap pergi ke utara
Kutatap bayangmu di jendela berkaca
Tetes hujan menghapus sisa air mata

[Reff]
Koper tua di genggaman jemari
Tiket lusuh saksi janji yang terhenti
Asap lokomotif membubung ke langit malam
Meninggalkan jejak sepi yang tenggelam

[Bait 2]
Roda besi berdecit perlahan melaju
Lambaian tanganmu kian pudar membiru
Di bawah payung hitam kuberdalih tegar
Padahal hatiku hancur tak lagi berpendar`,
    suggestedStyle: 'cinematic-35mm',
    suggestedLighting: 'golden-hour',
    targetScenes: 4,
  },
  {
    id: 'sample-space-voyager',
    title: 'The Last Watcher of Saturn',
    type: 'story' as const,
    description: 'Kisah astronot tunggal yang menjaga stasiun pemancar di cincin es Saturnus.',
    text: `Commander Astrid stood alone inside the panoramic observation dome of Station Sol-9. Millions of ice shards drifted in slow silent harmony along Saturn's shimmering planetary rings, glistening under the distant pale rays of the Sun. Inside the cockpit, vintage analogue dials and warm phosphor screens hummed softly. 

Astrid held an old printed photograph of a green wheat field on Earth, her reflection ghostly against the thick reinforced glass. Suddenly, the deep space communication beacon flashed a gentle emerald beacon: a signal had arrived from ten light years away. Astrid smiled, strapped into her flight seat, and calibrated the thrusters toward the unknown horizon.`,
    suggestedStyle: 'interstellar-scifi',
    suggestedLighting: 'volumetric-godrays',
    targetScenes: 4,
  },
  {
    id: 'sample-ghibli-valley',
    title: 'Lembah Angin dan Kereta Daun',
    type: 'story' as const,
    description: 'Kisah fantasi hangat tentang anak penggembala dan roh penjaga hutan.',
    text: `Matahari pagi menyapa padang rumput hijau bertabur bunga dandelion. Di atas bukit berangin kencang, Runa bersama anjing kecilnya berlari mengejar bayangan awan putih yang berarak lambat. Dari balik semak pohon ek raksasa, muncul kereta uap kayu yang ditarik oleh kumbang raksasa bersayap zamrud. 

Penumpangnya adalah makhluk-makhluk hutan mungil bertopi biji kenari. Runa melambaikan tangan dengan riang, disambut senyum hangat dari sang masinis hutan yang meniup peluit kayu bersuara merdu seperti kicau burung musim semi.`,
    suggestedStyle: 'ghibli-watercolor',
    suggestedLighting: 'soft-diffused-overcast',
    targetScenes: 4,
  },
];
