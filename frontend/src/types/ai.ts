export interface AIChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface AIChat {
  id: string;
  messages: AIChatMessage[];
  createdAt: string;
}
