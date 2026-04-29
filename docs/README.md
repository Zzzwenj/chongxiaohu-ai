# 个人宠物平台 + AI 中国版规划文档

日期：2026-04-27  
定位：面向中国宠物主的低成本、可信赖、AI 辅助养宠平台。

## 文档目录

1. [市场分析](./01_market_analysis.md)
2. [产品定位与 MVP](./02_product_positioning_and_mvp.md)
3. [AI 宠物健康与内容能力设计](./03_ai_pet_health_guardrails.md)
4. [技术栈与系统架构](./04_tech_stack_architecture.md)
5. [商业模型与低预算运营](./05_business_model_and_budget.md)
6. [个人开发路线图](./06_roadmap.md)
7. [合规、风险与安全边界](./07_compliance_and_risk.md)
8. [用户提示词与回答示例](./08_user_prompts_and_examples.md)
9. [知识库、RAG 与用户反馈闭环](./09_knowledge_base_rag_feedback.md)
10. [1.0 上线前需要你提供的资料](./10_required_inputs.md)
11. [产品范围、UI/UX 与模型能力策略](./11_product_scope_uiux_model_strategy.md)
12. [竞品 UI 与功能分析](./12_competitor_ui_feature_analysis.md)
13. [当前项目阶段诊断与下一步路线图](./13_current_project_audit_and_next_steps.md)
14. [宠小护 1.0 实施更新记录](./14_v1_implementation_update.md)
15. [宠小护产品、AI 与小程序 UI/UX 深度诊断](./15_product_ai_uiux_deep_audit.md)

## 一句话战略

不要一开始做“大而全宠物生态”。先做一个“宠物档案 + AI 日常养护 + 症状分诊 + 饮食建议 + 提醒”的轻平台，用你自己的宠物知识库和 RAG 检索建立信任，再逐步接入兽医、医院、商品和保险等变现链路。

## 推荐 MVP

第一版只做 5 件事：

- 宠物档案：物种、品种、年龄、体重、绝育、疫苗、驱虫、过敏、慢病、饮食偏好。
- AI 养宠问答：喂养、行为、护理、训练、清洁、用品选择。
- 症状快速分诊：判断紧急程度，而不是替代兽医诊断。
- 餐食搭配建议：按宠物类型、年龄、体重、状态给“原则 + 示例”，避免直接替代处方粮/治疗方案。
- 提醒：疫苗、驱虫、洗澡、体重记录、复诊、用药提醒。

## 核心原则

- AI 只做“建议、分诊、解释、提醒”，不做最终诊断、处方和治疗承诺。
- 所有健康回答必须带风险等级和就医提示。
- 内容要有来源、审核机制和更新日期。
- 个人创业优先做微信小程序/H5，不急着做原生 App。
- 预算有限时，优先把钱花在模型调用、基础云服务、合规备案和专业兽医审核上。
- 核心壁垒不是把知识一次性塞进大模型，而是持续建设“可追溯、可审核、可更新”的宠物知识库。
