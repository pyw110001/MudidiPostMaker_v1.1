# Mudidi Poster Maker v1.1

Mudidi Poster Maker 是一款基于 **Gemini 3.1 Flash Image Preview** 模型构建的艺术海报生成工具。它专门用于生成具有特定风格（Mudidi 风格）的拟人化小羊插画海报。

## 🌟 核心特色 (Features)

*   **精准的风格控制 (Precise Style Control)**: 
    *   **极致还原角色设定**: 强制 AI 遵循“白色云朵头 + 彩色衣服躯干 + 极细白色火柴棍手臂 + 极细黑色火柴棍腿”的经典 Mudidi 角色造型。
    *   **色彩阻断 (Color Blocking)**: 严格禁止生成写实动物身体或人类肤色（即使在游泳等特殊场景下），确保角色始终保持扁平化、几何化的可爱风格。
    *   **艺术质感**: 默认采用温暖、带有肌理感、蜡笔或粉彩质感的扁平矢量插画风格（类似儿童绘本或 Apple 风格的干净构图）。
*   **灵活的场景定制 (Flexible Customization)**:
    *   支持自定义角色数量 (1-6只)。
    *   支持选择不同的季节和节日元素。
    *   支持自由输入具体的动作 (Action) 和场景 (Scene)。
    *   支持多种海报比例 (1:1, 3:4, 4:3, 9:16, 16:9)。
*   **参考图驱动 (Reference Image Driven)**:
    *   用户可以上传参考图，AI 将在保持参考图核心解剖结构和画风的前提下，根据用户的文字提示改变角色的服饰、动作和所处环境。
*   **现代化的 UI 界面 (Modern UI)**:
    *   采用深色磨砂玻璃质感 (Dark Frosted Glass) 设计，提供沉浸式的创作体验。
    *   全中文界面，操作直观简便。

## 🛠️ 技术栈 (Tech Stack)

*   **前端框架**: React 19 + Vite 6
*   **样式方案**: Tailwind CSS v4
*   **动画库**: Motion (Framer Motion)
*   **图标库**: Lucide React
*   **AI 模型**: Google Gemini API (`gemini-3.1-flash-image-preview`)

## 🚀 如何使用 (How to Use)

1.  **配置 API Key**: 首次打开应用时，需要通过 AI Studio 平台选择并授权一个启用了计费的 Google Cloud API Key（因为使用了高质量的图像生成模型）。
2.  **上传参考图 (可选)**: 在左侧边栏点击上传一张 Mudidi 风格的小羊图片作为参考，以确保生成的角色造型高度一致。
3.  **设置参数**:
    *   选择角色数量、季节和节日。
    *   在“动作”输入框中描述小羊正在做什么（例如：“围坐在桌旁吃点心”）。
    *   在“场景”输入框中描述环境（例如：“装饰着荷花的温馨餐厅”）。
    *   选择期望的海报比例。
4.  **生成海报**: 点击底部的“立即生成”按钮，等待几秒钟，右侧预览区将展示生成的艺术海报。

## 💡 提示词工程亮点 (Prompt Engineering Highlights)

为了解决 AI 容易将拟人化动物画得过于写实或在特定场景（如游泳）下画出人类肤色的问题，本应用在底层提示词中加入了极其严格的限制：

```text
CRITICAL ANATOMY INSTRUCTION: ABSOLUTELY NO HUMAN SKIN/FLESH COLORS. Follow this EXACT color blocking:
1. Head: White, fluffy, cloud-like...
2. Torso: MUST wear colorful clothes (if swimming, they must wear full-body swimsuits or shirts). NO bare chests, NO bare bellies...
3. Arms: Extremely thin WHITE stick-like lines ONLY...
4. Legs: Extremely thin BLACK stick-like lines ONLY...
```

这种“防御性”的提示词设计，最大程度地保证了生成结果的风格稳定性。

---
*Built with ❤️ using AI Studio*
