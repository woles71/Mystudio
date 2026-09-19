export type AspectRatio = '16:9' | '9:16' | '21:9' | '4:3' | '1:1';

export type CameraAngle =
  | 'Extreme Wide Shot'
  | 'Wide Shot'
  | 'Medium Shot'
  | 'Close-Up'
  | 'Extreme Close-Up'
  | 'Low Angle Heroic'
  | 'High Angle Overlook'
  | 'Dutch Angle / Tilted'
  | 'Over The Shoulder'
  | 'Drone Aerial Shot';

export type TransitionType = 'crossfade' | 'fade-to-black' | 'cut' | 'slide-left' | 'zoom-in';

export interface ScenePanel {
  id: string;
  sceneNumber: number;
  title: string;
  narrative: string; // story beat / song lyrics
  visualDescription: string;
  cinematicPrompt: string;
  cameraAngle: CameraAngle;
  lighting: string;
  duration: number; // in seconds (e.g. 3.5)
  imageUrl?: string;
  isGeneratingImage?: boolean;
  imageError?: string;
  motionEffect?: 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'static';
}

export interface ConsistencyProfile {
  protagonist: string;
  environment: string;
  colorPalette: string;
  artStyleTokens: string;
}

export interface StoryboardProject {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  aspectRatio: AspectRatio;
  visualStyle: string;
  lightingStyle: string;
  transition: TransitionType;
  consistencyProfile: ConsistencyProfile;
  scenes: ScenePanel[];
  rawSourceText?: string;
  sourceType?: 'story' | 'lyrics' | 'storyboard_raw';
}

export interface VisualStylePreset {
  id: string;
  name: string;
  description: string;
  promptSuffix: string;
  colorBadge: string;
  filmLook: string;
}

export interface LightingPreset {
  id: string;
  name: string;
  description: string;
  promptKeywords: string;
  mood: string;
  iconColor: string;
}
