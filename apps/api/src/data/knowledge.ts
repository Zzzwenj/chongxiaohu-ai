import type { KnowledgeArticle } from "@pet-ai/shared";

export const knowledgeArticles: KnowledgeArticle[] = [
  {
    id: "kb-red-urinary-blockage-cat",
    title: "公猫疑似尿闭属于急症",
    category: "symptom_triage",
    species: "cat",
    riskLevel: "red",
    sourceQuality: "A",
    content:
      "公猫频繁蹲猫砂盆、尿不出、叫声痛苦、舔尿道口、精神差或呕吐时，应按急症处理。不要在家等待观察，不要自行喂药或按摩腹部，应尽快联系宠物医院。",
    sourceLinks: ["占位：待补充兽医审核来源"],
    reviewer: "待补充执业兽医",
    reviewedAt: "2026-04-27"
  },
  {
    id: "kb-red-toxic-food",
    title: "常见危险食物与误食处理",
    category: "safety",
    species: "all",
    riskLevel: "red",
    sourceQuality: "A",
    content:
      "犬猫误食巧克力、葡萄/葡萄干、洋葱、大蒜、酒精、老鼠药、人用止痛药、百合等，应尽快联系宠物医院。不要自行催吐，除非兽医明确指导。",
    sourceLinks: ["占位：待补充毒物资料来源"],
    reviewer: "待补充执业兽医",
    reviewedAt: "2026-04-27"
  },
  {
    id: "kb-yellow-vomiting",
    title: "犬猫呕吐的初步分诊",
    category: "symptom_triage",
    species: "all",
    riskLevel: "yellow",
    sourceQuality: "A",
    content:
      "偶发呕吐可能与换粮、毛球、进食过快、胃肠刺激有关。若持续呕吐、带血、精神沉郁、无法饮水、幼宠老年宠、疑似误食异物或毒物，应尽快就医。",
    sourceLinks: ["占位：待补充兽医科普来源"],
    reviewer: "待补充执业兽医",
    reviewedAt: "2026-04-27"
  },
  {
    id: "kb-yellow-diarrhea",
    title: "犬猫腹泻的观察与就医信号",
    category: "symptom_triage",
    species: "all",
    riskLevel: "yellow",
    sourceQuality: "A",
    content:
      "腹泻需要观察次数、颜色、是否带血或黏液、精神、饮水和食欲。不要自行使用人用止泻药或抗生素。便血、黑便、持续呕吐、精神明显变差、幼宠老年宠或超过 24 小时未改善时应就医。",
    sourceLinks: ["占位：待补充兽医科普来源"],
    reviewer: "待补充执业兽医",
    reviewedAt: "2026-04-27"
  },
  {
    id: "kb-diet-neutered-weight",
    title: "绝育后宠物体重管理",
    category: "diet",
    species: "all",
    riskLevel: "green",
    sourceQuality: "B",
    content:
      "绝育后宠物活动量和代谢可能下降，容易发胖。建议定时定量喂食，控制零食热量，逐步增加活动，每周称重。不要突然大幅减量，慢病、幼宠、老年宠应先咨询兽医。",
    sourceLinks: ["占位：待补充营养资料来源"],
    reviewer: "待补充宠物营养审核",
    reviewedAt: "2026-04-27"
  },
  {
    id: "kb-diet-food-transition",
    title: "换粮 7 天原则",
    category: "diet",
    species: "all",
    riskLevel: "green",
    sourceQuality: "B",
    content:
      "换粮通常建议 7 天左右逐步过渡：旧粮比例逐渐降低，新粮比例逐渐提高。若出现明显呕吐、腹泻、瘙痒或精神变差，应暂停换粮并咨询兽医。",
    sourceLinks: ["占位：待补充营养资料来源"],
    reviewer: "待补充宠物营养审核",
    reviewedAt: "2026-04-27"
  }
];

