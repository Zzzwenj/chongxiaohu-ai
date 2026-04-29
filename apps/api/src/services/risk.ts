import type { RiskLevel } from "@pet-ai/shared";

const redPatterns = [
  "尿不出",
  "尿闭",
  "呼吸困难",
  "舌头发紫",
  "抽搐",
  "昏迷",
  "误食",
  "巧克力",
  "葡萄",
  "老鼠药",
  "百合",
  "布洛芬",
  "对乙酰氨基酚",
  "大量出血",
  "中暑",
  "难产"
];

const yellowPatterns = [
  "呕吐",
  "吐",
  "腹泻",
  "拉稀",
  "咳嗽",
  "打喷嚏",
  "不吃",
  "精神差",
  "便血",
  "皮肤痒",
  "掉毛",
  "耳朵",
  "眼睛红"
];

export function classifyRisk(question: string): RiskLevel {
  const normalized = question.toLowerCase();
  if (redPatterns.some((pattern) => normalized.includes(pattern.toLowerCase()))) {
    return "red";
  }
  if (yellowPatterns.some((pattern) => normalized.includes(pattern.toLowerCase()))) {
    return "yellow";
  }
  return "green";
}

export function mergeRisk(a: RiskLevel, b: RiskLevel): RiskLevel {
  const order: Record<RiskLevel, number> = { green: 1, yellow: 2, red: 3 };
  return order[a] >= order[b] ? a : b;
}

