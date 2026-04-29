import type { AiAskRequest, AiAskResponse, FeedbackItem } from "@pet-ai/shared";

export interface ConversationRecord {
  id: string;
  request: AiAskRequest;
  response: AiAskResponse;
  createdAt: string;
}

export const conversations: ConversationRecord[] = [];
export const feedbackItems: FeedbackItem[] = [];

// Filter conversations by risk level
export function getConversationsByRisk(risk?: string | null, page = 1, limit = 50) {
  let filtered = conversations;
  if (risk) {
    filtered = conversations.filter((c) => c.response.riskLevel === risk);
  }
  const start = (page - 1) * limit;
  return filtered.slice(start, start + limit);
}

// Get conversation stats
export function getConversationStats() {
  const total = conversations.length;
  const red = conversations.filter((c) => c.response.riskLevel === "red").length;
  const yellow = conversations.filter((c) => c.response.riskLevel === "yellow").length;
  const green = conversations.filter((c) => c.response.riskLevel === "green").length;
  return { total, red, yellow, green };
}

// Update feedback status
export function updateFeedbackStatus(id: string, status: FeedbackItem["status"]) {
  const item = feedbackItems.find((f) => f.id === id);
  if (item) {
    item.status = status;
    return item;
  }
  return null;
}

