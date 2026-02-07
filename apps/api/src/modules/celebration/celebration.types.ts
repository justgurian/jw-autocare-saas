export type CelebrationType =
  | 'birthday'
  | 'work-anniversary'
  | 'milestone'
  | 'retirement'
  | 'employee-of-month'
  | 'grand-opening'
  | 'custom';

export interface CelebrationTemplate {
  id: CelebrationType;
  name: string;
  icon: string;
  description: string;
  prompt: string;
  defaultMessage: string;
}

export interface CelebrationInput {
  celebrationType: CelebrationType;
  personName: string;
  customMessage?: string;
  customDetails?: string;
  photoBase64: string;
  photoMimeType: string;
  aspectRatio?: '16:9' | '9:16';
  duration?: '4s' | '6s' | '8s';
}

export const CELEBRATION_TEMPLATES: CelebrationTemplate[] = [
  {
    id: 'birthday',
    name: 'Happy Birthday',
    icon: '🎂',
    description: 'Birthday celebration video',
    prompt:
      'A warm, festive birthday celebration video. The scene transitions from the person in the photo to a joyful birthday party scene. Colorful confetti rains down in slow motion, balloons float upward, and a beautiful birthday cake with lit candles appears. Warm golden lighting, joyful atmosphere. SFX: party poppers, cheerful music. Text overlay: "[MESSAGE]"',
    defaultMessage: 'Happy Birthday!',
  },
  {
    id: 'work-anniversary',
    name: 'Work Anniversary',
    icon: '🏆',
    description: 'Work anniversary celebration',
    prompt:
      'A professional yet heartfelt work anniversary celebration video. The scene shows the person surrounded by applauding coworkers in an auto shop setting. Gold and blue confetti falls, a "Thank You" banner unfurls. Professional warm lighting. SFX: applause, uplifting music. Text overlay: "[MESSAGE]"',
    defaultMessage: 'Happy Work Anniversary!',
  },
  {
    id: 'milestone',
    name: 'Milestone Achievement',
    icon: '⭐',
    description: 'Milestone celebration (100th customer, etc.)',
    prompt:
      'An exciting milestone achievement celebration video. Fireworks explode in the background, a spotlight shines on the person, golden trophies and stars rain down. High-energy, triumphant mood. SFX: fireworks, crowd cheering, epic fanfare music. Text overlay: "[MESSAGE]"',
    defaultMessage: 'What an Achievement!',
  },
  {
    id: 'retirement',
    name: 'Happy Retirement',
    icon: '🎉',
    description: 'Retirement celebration',
    prompt:
      'A warm, emotional retirement celebration video. The person is shown being celebrated by their team, with a farewell banner and warm embraces. Sunset golden-hour lighting, sentimental atmosphere. SFX: gentle music, applause. Text overlay: "[MESSAGE]"',
    defaultMessage: 'Happy Retirement!',
  },
  {
    id: 'employee-of-month',
    name: 'Employee of the Month',
    icon: '🌟',
    description: 'Employee recognition',
    prompt:
      'A proud employee recognition video. A dramatic spotlight illuminates the person, a golden "Employee of the Month" plaque appears with sparkle effects. Coworkers applaud in the background. Professional, proud atmosphere. SFX: drum roll, triumphant music. Text overlay: "[MESSAGE]"',
    defaultMessage: 'Employee of the Month!',
  },
  {
    id: 'grand-opening',
    name: 'Grand Opening',
    icon: '🎪',
    description: 'Grand opening or new location celebration',
    prompt:
      'An exciting grand opening celebration video. Red ribbon cutting ceremony, balloons release, crowd cheering, confetti cannon explosion. The shop exterior is decorated festively. High-energy, exciting atmosphere. SFX: crowd noise, celebration music, scissors cutting ribbon. Text overlay: "[MESSAGE]"',
    defaultMessage: 'Grand Opening!',
  },
  {
    id: 'custom',
    name: 'Custom Celebration',
    icon: '🎊',
    description: 'Custom celebration video',
    prompt:
      'A warm celebration video. The person from the photo is featured in a joyful celebration scene with confetti, balloons, and festive decorations. [CUSTOM_DETAILS]. Warm, festive lighting. SFX: celebration sounds, upbeat music. Text overlay: "[MESSAGE]"',
    defaultMessage: 'Congratulations!',
  },
];
