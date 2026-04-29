export type Species = "cat" | "dog";

export type RiskLevel = "green" | "yellow" | "red";

export interface PetProfile {
  id: string;
  name: string;
  species: Species;
  breed?: string;
  age?: string;
  weightKg?: number;
  gender?: string;
  neutered?: boolean;
  allergies?: string;
  chronicConditions?: string;
  dietNote?: string;
}

export type HealthRecordType =
  | "meal"
  | "water"
  | "poop"
  | "pee"
  | "vomit"
  | "weight"
  | "medicine"
  | "mood"
  | "skin"
  | "note";

export interface HealthRecord {
  id: string;
  petId?: string;
  type: HealthRecordType;
  value: string;
  note?: string;
  createdAt: string;
}

export interface AiPetContext {
  recentRecords?: HealthRecord[];
  healthSummary?: string;
}

export interface AiAskRequest {
  question: string;
  pet?: Partial<PetProfile>;
  context?: AiPetContext;
  mode?: "general" | "symptom" | "diet" | "visit-summary";
}

export interface KnowledgeHit {
  id: string;
  title: string;
  category: string;
  riskLevel: RiskLevel;
  sourceQuality: "S" | "A" | "B";
  snippet: string;
}

export interface AiAskResponse {
  id: string;
  answer: string;
  riskLevel: RiskLevel;
  citations: KnowledgeHit[];
  needsVet: boolean;
  disclaimer: string;
}

export interface UserFeedbackRequest {
  conversationId: string;
  feedbackType: "wrong" | "unsafe" | "too_generic" | "not_applicable" | "helpful";
  feedbackText?: string;
  expectedAnswer?: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  species: Species | "all";
  riskLevel: RiskLevel;
  sourceQuality: "S" | "A" | "B";
  content: string;
  sourceLinks: string[];
  reviewer?: string;
  reviewedAt?: string;
}

export interface FeedbackItem {
  id: string;
  conversationId: string;
  feedbackType: UserFeedbackRequest["feedbackType"];
  feedbackText?: string;
  expectedAnswer?: string;
  status: "pending" | "triaged" | "needs_review" | "approved" | "rejected" | "published";
  createdAt: string;
}
