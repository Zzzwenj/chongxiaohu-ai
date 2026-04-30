import cors from "@fastify/cors";
import Fastify from "fastify";
import { nanoid } from "nanoid";
import { z } from "zod";
import { config } from "./config.js";
import { addKnowledge, listKnowledge, retrieveKnowledge } from "./services/knowledge.js";
import { classifyRisk, mergeRisk } from "./services/risk.js";
import { generateAnswer } from "./services/ai.js";
import { conversations, feedbackItems, getConversationsByRisk, getConversationStats, updateFeedbackStatus } from "./store.js";
import { knowledgeArticles } from "./data/knowledge.js";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: config.corsOrigin
});

const askSchema = z.object({
  question: z.string().min(1),
  pet: z.record(z.unknown()).optional(),
  context: z.object({
    healthSummary: z.string().optional(),
    recentRecords: z.array(z.object({
      id: z.string(),
      petId: z.string().optional(),
      type: z.enum(["meal", "water", "poop", "pee", "vomit", "weight", "medicine", "mood", "skin", "note"]),
      value: z.string(),
      note: z.string().optional(),
      createdAt: z.string()
    })).optional()
  }).optional(),
  mode: z.enum(["general", "symptom", "diet", "visit-summary"]).optional()
});

const feedbackSchema = z.object({
  conversationId: z.string(),
  feedbackType: z.enum(["wrong", "unsafe", "too_generic", "not_applicable", "helpful"]),
  feedbackText: z.string().optional(),
  expectedAnswer: z.string().optional()
});

function buildRiskText(body: z.infer<typeof askSchema>) {
  const recentRecordText = body.context?.recentRecords
    ?.slice(0, 8)
    .map((item) => `${item.type} ${item.value} ${item.note ?? ""}`)
    .join("\n");

  return [
    body.question,
    body.context?.healthSummary,
    recentRecordText,
    body.pet && typeof body.pet === "object" ? JSON.stringify(body.pet) : ""
  ]
    .filter(Boolean)
    .join("\n");
}

app.get("/health", async () => ({
  ok: true,
  service: "pet-ai-api",
  time: new Date().toISOString()
}));

app.get("/api/bootstrap", async () => ({
  appName: process.env.APP_NAME ?? "宠伴 AI",
  supportedSpecies: ["cat", "dog"],
  modes: ["general", "symptom", "diet", "visit-summary"]
}));

app.post("/api/ai/ask", async (request, reply) => {
  const parsed = askSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({ message: "请求参数不正确", issues: parsed.error.issues });
  }

  const riskText = buildRiskText(parsed.data);
  const retrieval = retrieveKnowledge(riskText);
  const ruleRisk = classifyRisk(riskText);
  const riskLevel = mergeRisk(ruleRisk, retrieval.maxRisk);
  const response = await generateAnswer(parsed.data, riskLevel, retrieval.hits);

  conversations.unshift({
    id: response.id,
    request: parsed.data,
    response,
    createdAt: new Date().toISOString()
  });

  return response;
});

app.post("/api/feedback", async (request, reply) => {
  const parsed = feedbackSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({ message: "反馈参数不正确", issues: parsed.error.issues });
  }

  const item = {
    id: nanoid(),
    ...parsed.data,
    status: "pending" as const,
    createdAt: new Date().toISOString()
  };
  feedbackItems.unshift(item);
  return item;
});

app.get("/api/admin/knowledge", async () => listKnowledge());

app.post("/api/admin/knowledge", async (request, reply) => {
  const schema = z.object({
    title: z.string().min(1),
    category: z.string().min(1),
    species: z.enum(["cat", "dog", "all"]),
    riskLevel: z.enum(["green", "yellow", "red"]),
    sourceQuality: z.enum(["S", "A", "B"]),
    content: z.string().min(1),
    sourceLinks: z.array(z.string()).default([])
  });
  const parsed = schema.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({ message: "知识库参数不正确", issues: parsed.error.issues });
  }
  return addKnowledge({
    id: `kb-${nanoid()}`,
    ...parsed.data,
    reviewer: "待审核",
    reviewedAt: new Date().toISOString().slice(0, 10)
  });
});

app.get("/api/admin/feedback", async () => feedbackItems);

app.get("/api/admin/conversations", async () => conversations.slice(0, 100));

// Conversation filtering & stats
app.get<{ Querystring: { risk?: string; page?: string; limit?: string } }>(
  "/api/admin/conversations/search",
  async (request) => {
    const risk = request.query.risk;
    const page = Number(request.query.page) || 1;
    const limit = Number(request.query.limit) || 50;
    return getConversationsByRisk(risk, page, limit);
  }
);

app.get("/api/admin/conversations/stats", async () => getConversationStats());

// Feedback status update
app.put<{ Params: { id: string }; Body: { status: string } }>(
  "/api/admin/feedback/:id",
  async (request, reply) => {
    const { id } = request.params;
    const { status } = request.body;
    const validStatuses = ["pending", "triaged", "needs_review", "approved", "rejected", "published"];
    if (!validStatuses.includes(status)) {
      return reply.code(400).send({ message: "无效的状态" });
    }
    const updated = updateFeedbackStatus(id, status as any);
    if (!updated) {
      return reply.code(404).send({ message: "反馈未找到" });
    }
    return updated;
  }
);

// Knowledge article detail
app.get<{ Params: { id: string } }>(
  "/api/admin/knowledge/:id",
  async (request, reply) => {
    const article = knowledgeArticles.find((a) => a.id === request.params.id);
    if (!article) return reply.code(404).send({ message: "未找到" });
    return article;
  }
);

app.listen({ port: config.port, host: "0.0.0.0" }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
