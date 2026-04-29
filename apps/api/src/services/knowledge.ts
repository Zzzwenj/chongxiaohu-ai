import type { KnowledgeHit, RiskLevel } from "@pet-ai/shared";
import { knowledgeArticles } from "../data/knowledge.js";
import { mergeRisk } from "./risk.js";

function scoreArticle(question: string, content: string, title: string): number {
  let score = 0;
  const dietPatterns = ["吃", "粮", "餐", "喂", "零食", "换粮", "胖", "肥", "体重", "湿粮", "冻干"];
  const symptomPatterns = ["吐", "呕吐", "拉稀", "腹泻", "咳嗽", "尿", "血", "精神差", "误食", "抽搐"];
  const isDietQuestion = dietPatterns.some((pattern) => question.includes(pattern));
  const isSymptomQuestion = symptomPatterns.some((pattern) => question.includes(pattern));
  const isSafetyQuestion = ["误食", "巧克力", "葡萄", "洋葱", "老鼠药", "百合", "布洛芬"].some((pattern) =>
    question.includes(pattern)
  );

  if (isDietQuestion && title.includes("体重")) score += 8;
  if (isDietQuestion && title.includes("换粮")) score += 8;
  if (isSymptomQuestion && /症状|呕吐|腹泻|尿|急症|就医/.test(title)) score += 8;
  if (isSafetyQuestion && /误食|危险|毒/.test(title)) score += 10;

  const tokens = question
    .replace(/[，。！？、,.!?]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const haystack = `${title} ${content}`.toLowerCase();
  score += tokens.reduce((itemScore, token) => itemScore + (haystack.includes(token.toLowerCase()) ? 2 : 0), 0);
  return score;
}

export function retrieveKnowledge(question: string): { hits: KnowledgeHit[]; maxRisk: RiskLevel } {
  const isDietOnly =
    ["吃", "粮", "餐", "喂", "零食", "换粮", "胖", "肥", "体重", "湿粮", "冻干", "绝育"].some((pattern) =>
      question.includes(pattern)
    ) &&
    !["吐", "呕吐", "拉稀", "腹泻", "咳嗽", "尿不出", "误食", "抽搐", "便血", "精神差"].some((pattern) =>
      question.includes(pattern)
    );

  const scored = knowledgeArticles
    .map((article) => ({
      article,
      score: scoreArticle(question, article.content, article.title)
    }))
    .sort((a, b) => b.score - a.score);

  const selected = scored
    .filter((item) => item.score > 0)
    .filter((item) => !isDietOnly || item.article.category === "diet")
    .slice(0, 5);
  const fallback = selected.length > 0 ? selected : scored.filter((item) => item.article.riskLevel === "green").slice(0, 3);
  const hits: KnowledgeHit[] = fallback.map(({ article }) => ({
    id: article.id,
    title: article.title,
    category: article.category,
    riskLevel: article.riskLevel,
    sourceQuality: article.sourceQuality,
    snippet: article.content
  }));

  const maxRisk = selected.length > 0 ? hits.reduce<RiskLevel>((risk, hit) => mergeRisk(risk, hit.riskLevel), "green") : "green";
  return { hits, maxRisk };
}

export function listKnowledge() {
  return knowledgeArticles;
}

export function addKnowledge(article: (typeof knowledgeArticles)[number]) {
  knowledgeArticles.unshift(article);
  return article;
}
