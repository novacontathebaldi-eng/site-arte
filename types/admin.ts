
export interface BrevoContact {
  email: string;
  id: number;
  emailBlacklisted: boolean;
  smsBlacklisted: boolean;
  createdAt: string;
  modifiedAt: string;
  attributes: {
    NOME?: string;
    FIRSTNAME?: string;
    ROLE?: string;
  };
}

export interface ChatStarter {
  id: string;
  label: string;
  text: string;
  order: number;
}

export interface KnowledgeBaseItem {
  id: string;
  question: string;
  answer: string;
  tags: string[];
}

export interface ChatConfig {
  systemPrompt: string;
  modelTemperature: number;
  rateLimit: {
    maxMessages: number;
    windowMinutes: number;
  };
  starters: ChatStarter[];
}

export interface ChatFeedback {
  id: string;
  userMessage: string;
  aiResponse: string;
  feedback: 'like' | 'dislike';
  timestamp: string;
  resolved: boolean;
}
