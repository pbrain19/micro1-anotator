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

export interface ExpertOpinion {
  task_id: string;
  programming_language: string;
  topic: string;
  category: string;
  task_progress: string;
  assigned_preference_chooser: string;
  preference_choice: string;
  preference_strength: string;
  preference_justification: string;
  response_a_image: string;
  response_b_image: string;
  assigned_reviewer: string;
  review: string;
  justification_for_review: string;
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
