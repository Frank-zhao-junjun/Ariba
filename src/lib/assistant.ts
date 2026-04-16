export type AssistantMessageRole = 'user' | 'assistant';

export interface AssistantMessage {
  id: string;
  role: AssistantMessageRole;
  content: string;
  timestamp: Date;
}

interface CreateAssistantMessageOptions {
  role: AssistantMessageRole;
  content: string;
  timestamp?: Date;
  idGenerator?: () => string;
}

function generateMessageId(): string {
  return crypto.randomUUID();
}

export function createAssistantMessage({
  role,
  content,
  timestamp = new Date(),
  idGenerator = generateMessageId,
}: CreateAssistantMessageOptions): AssistantMessage {
  return {
    id: idGenerator(),
    role,
    content,
    timestamp,
  };
}