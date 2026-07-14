export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export type Persona = 'jarvis' | 'sarcastic' | 'friendly';

export interface AppSettings {
  wakeWord: string;
  persona: Persona;
  voiceEnabled: boolean;
  voiceURI: string | null;
}
