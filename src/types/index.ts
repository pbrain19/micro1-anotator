export interface CSVRow {
  task_id: string;
  prompt: string;
  last_human_message: string;
  response_A: string;
  response_B: string;
  preference: string;
  reasoning: string;
  strength: string;
}

export interface ConversationPart {
  speaker: "Human" | "Assistant";
  content: string;
}

export interface MarkdownComponentsProps {
  node?: React.ReactNode;
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
  [key: string]: unknown;
}
