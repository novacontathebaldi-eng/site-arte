export * from './product';
export * from './user';
export * from './order';

export enum Language {
  FR = 'fr',
  EN = 'en',
  DE = 'de',
  PT = 'pt'
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
