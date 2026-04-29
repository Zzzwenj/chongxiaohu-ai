import type { AiAskRequest, AiAskResponse, KnowledgeHit, RiskLevel } from "@pet-ai/shared";
import { nanoid } from "nanoid";
import { config } from "../config.js";

const disclaimer =
  "本回答仅用于宠物日常养护、信息整理和风险分诊，不构成诊断、治疗或处方。若出现红色急症信号，请立即联系具备资质的宠物医院或执业兽医。";

function petLine(pet: AiAskRequest["pet"]) {
  if (!pet) return "未提供宠物档案。";
  const parts = [
    pet.name ? `名字：${pet.name}` : "",
    pet.species ? `类型：${pet.species === "cat" ? "猫" : "狗"}` : "",
    pet.age ? `年龄：${pet.age}` : "",
    pet.weightKg ? `体重：${pet.weightKg}kg` : "",
    pet.neutered === undefined ? "" : `绝育：${pet.neutered ? "是" : "否"}`,
    pet.chronicConditions ? `慢病：${pet.chronicConditions}` : ""
  ].filter(Boolean);
  return parts.length ? parts.join("，") : "宠物档案信息较少。";
}

function contextLine(context: AiAskRequest["context"]) {
  if (!context?.healthSummary && !context?.recentRecords?.length) {
    return "未提供最近健康记录。";
  }
  const lines = [
    context.healthSummary ? `健康摘要：\n${context.healthSummary}` : "",
    context.recentRecords?.length
      ? `最近记录数量：${context.recentRecords.length} 条。`
      : ""
  ].filter(Boolean);
  return lines.join("\n");
}

function redAnswer(request: AiAskRequest, citations: KnowledgeHit[]) {
  return [
    "风险等级：红色。请现在就联系附近宠物医院或急诊。",
    "",
    `宠物信息：${petLine(request.pet)}`,
    `最近记录：${contextLine(request.context)}`,
    "",
    "根据你描述的信息，存在需要线下紧急处理的可能。不要在家等待观察，不要自行喂人药、抗生素或止痛药，也不要强行按摩腹部或催吐，除非兽医明确指导。",
    "",
    "去医院前可以准备：症状开始时间、照片或视频、最近饮食变化、是否误食、排便排尿、精神食欲、疫苗驱虫记录。",
    "",
    `参考知识：${citations.map((item) => item.title).join("；")}`,
    "",
    disclaimer
  ].join("\n");
}

function yellowAnswer(request: AiAskRequest, citations: KnowledgeHit[]) {
  return [
    "风险等级：黄色。建议密切观察，并在 24-48 小时内联系宠物医院；如果加重，需要更早就医。",
    "",
    `宠物信息：${petLine(request.pet)}`,
    `最近记录：${contextLine(request.context)}`,
    "",
    "这不等于诊断。你现在最重要的是记录症状持续时间、次数、颜色/形态、精神、食欲、饮水、排便排尿，以及是否换粮、吃药、外出或误食。",
    "",
    "现在可以做：保持清洁饮水，暂停零食和新食物，记录照片或视频。不要自行使用人用药、抗生素或止痛药。",
    "",
    "立即就医信号：精神明显变差、持续呕吐、便血或黑便、呼吸异常、无法排尿、疑似误食毒物、幼宠/老年宠状态变差。",
    "",
    `参考知识：${citations.map((item) => item.title).join("；")}`,
    "",
    disclaimer
  ].join("\n");
}

function greenAnswer(request: AiAskRequest, citations: KnowledgeHit[]) {
  const isDiet = request.mode === "diet" || /吃|粮|餐|喂|零食|换粮|肥|体重/.test(request.question);
  const core = isDiet
    ? [
        "风险等级：绿色。可以先按日常养护问题处理。",
        "",
        `宠物信息：${petLine(request.pet)}`,
        `最近记录：${contextLine(request.context)}`,
        "",
        "餐食建议先遵循三个原则：定时定量、零食热量控制在较低比例、任何换粮都逐步过渡。若有慢病、长期呕吐腹泻、泌尿问题、肾病、胰腺炎或需要处方粮，请先咨询兽医。",
        "",
        "你可以补充当前主粮品牌、每日喂食量、零食类型、体况胖瘦和活动量，我可以生成更具体的 7 天调整计划。"
      ]
    : [
        "风险等级：绿色。当前更像日常养护或信息咨询，可以先按安全建议执行。",
        "",
        `宠物信息：${petLine(request.pet)}`,
        `最近记录：${contextLine(request.context)}`,
        "",
        "建议继续观察精神、食欲、饮水、排便排尿和体重变化。若出现症状加重、持续超过 24-48 小时或任何红色急症信号，请联系宠物医院。"
      ];

  return [...core, "", `参考知识：${citations.map((item) => item.title).join("；")}`, "", disclaimer].join("\n");
}

function localFallbackAnswer(request: AiAskRequest, riskLevel: RiskLevel, citations: KnowledgeHit[]) {
  return riskLevel === "red"
    ? redAnswer(request, citations)
    : riskLevel === "yellow"
      ? yellowAnswer(request, citations)
      : greenAnswer(request, citations);
}

function buildSystemPrompt(riskLevel: RiskLevel, citations: KnowledgeHit[]) {
  const knowledge = citations
    .map(
      (item, index) =>
        `[${index + 1}] ${item.title}\n风险等级：${item.riskLevel}\n来源等级：${item.sourceQuality}\n内容：${item.snippet}`
    )
    .join("\n\n");

  return [
    "你是“宠小护”的宠物养护助手，不是执业兽医。",
    "你面向中国宠物主提供宠物日常养护、餐食搭配、症状信息整理、风险分诊和就医准备建议。",
    "你不能确诊疾病，不能开处方，不能给处方药、人用药、抗生素、止痛药的剂量，不能承诺治愈。",
    "健康类问题必须先输出风险等级：绿色、黄色或红色。",
    "如果风险等级是红色，第一句话必须建议立即联系附近宠物医院或急诊，回答要简洁、行动导向。",
    "如果信息不足，要列出最关键的追问，但不要因为缺少信息而淡化急症风险。",
    "回答必须基于下方知识库片段和用户提供的宠物信息；不确定时选择更保守的就医建议。",
    "最后必须包含免责声明：本回答不构成诊断、治疗或处方。",
    "",
    `系统判定风险等级：${riskLevel}`,
    "",
    "可用知识库片段：",
    knowledge || "暂无命中知识库片段。"
  ].join("\n");
}

function buildUserPrompt(request: AiAskRequest) {
  return [
    `问题类型：${request.mode ?? "general"}`,
    `宠物信息：${petLine(request.pet)}`,
    `最近健康记录：${contextLine(request.context)}`,
    `用户问题：${request.question}`,
    "",
    "请按以下结构回答：",
    "1. 风险等级",
    "2. 判断依据",
    "3. 现在可以做什么",
    "4. 需要立即就医的信号",
    "5. 就医前准备",
    "6. 免责声明"
  ].join("\n");
}

async function callDeepSeek(request: AiAskRequest, riskLevel: RiskLevel, citations: KnowledgeHit[]) {
  const response = await fetch(`${config.aiBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.aiApiKey}`
    },
    body: JSON.stringify({
      model: config.aiModel,
      messages: [
        { role: "system", content: buildSystemPrompt(riskLevel, citations) },
        { role: "user", content: buildUserPrompt(request) }
      ],
      stream: false,
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DeepSeek API 请求失败：${response.status} ${text.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("DeepSeek API 未返回有效内容");
  }
  return content;
}

export async function generateAnswer(
  request: AiAskRequest,
  riskLevel: RiskLevel,
  citations: KnowledgeHit[]
): Promise<AiAskResponse> {
  const useMock = config.aiProvider === "mock" || !config.aiApiKey || config.aiApiKey.includes("replace");
  let answer = localFallbackAnswer(request, riskLevel, citations);

  if (!useMock && config.aiProvider === "deepseek") {
    try {
      answer = await callDeepSeek(request, riskLevel, citations);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "未知错误";
      answer = `${answer}\n\n系统提示：DeepSeek 暂时调用失败，已使用本地安全兜底回答。原因：${reason}`;
    }
  }

  return {
    id: nanoid(),
    answer,
    riskLevel,
    citations,
    needsVet: riskLevel !== "green",
    disclaimer
  };
}
