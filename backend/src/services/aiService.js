/**
 * AI Service - 调用 minimax2.5 生成选择题和 Skill 框架
 * 使用 OpenClaw 内置的 AI 能力
 */

const AI_PROMPTS = {
  // 生成选择题的 prompt
  generateQuestions: (userInput) => `
你是 Skill 创建助手。用户想要创建一个 Skill，但需求可能不够清晰。
请基于用户的描述，生成 3-5 个选择题，帮助用户理清思路。

用户描述：${userInput}

请严格按照以下 JSON 格式返回，不要包含其他内容：
[
  {
    "question": "问题内容",
    "options": ["选项1", "选项2", "选项3"],
    "key": "用于识别这个问题的关键字"
  }
]
`,

  // 生成 Skill 框架的 prompt
  generateFramework: (userInput, answers) => `
你是 Skill 创建助手。用户想要创建一个 Skill，已回答了以下问题：

用户原始描述：${userInput}
用户的回答：${answers}

请生成一个完整的 Skill 框架，包含：
1. name - Skill 名称
2. description - 详细描述
3. category - 分类
4. tags - 标签数组
5. config.triggers - 触发条件数组
6. config.actions - 执行动作数组
7. prompt - 完整的 prompt 内容（这是核心，需要详细描述 Skill 的行为）
8. parameters - 参数配置数组，每个参数包含 name, type, required, description

请严格按照以下 JSON 格式返回，不要包含其他内容：
{
  "name": "Skill名称",
  "description": "详细描述",
  "category": "分类",
  "tags": ["标签1", "标签2"],
  "config": {
    "triggers": ["触发条件1"],
    "actions": ["动作1"]
  },
  "prompt": "完整的prompt内容...",
  "parameters": [
    {"name": "参数名", "type": "string", "required": true, "description": "参数描述"}
  ]
}
`
};

/**
 * 调用 AI 生成选择题
 * @param {string} userInput - 用户输入的描述
 * @returns {Promise<Array>} 选择题数组
 */
async function generateQuestions(userInput) {
  const prompt = AI_PROMPTS.generateQuestions(userInput);
  
  // 使用 OpenClaw 内置的 AI 能力（通过 exec 调用 curl）
  const { default: fetch } = await import('node-fetch');
  
  const requestBody = {
    model: 'ark/minimax-2.5',
    messages: [
      { role: 'user', content: prompt }
    ],
    max_tokens: 2000,
    temperature: 0.7
  };
  
  // 从环境变量获取 API key，如果没有则使用模拟响应
  const apiKey = process.env.OPENCLAW_API_KEY || process.env.MINIMAX_API_KEY;
  const baseUrl = process.env.OPENCLAW_BASE_URL || 'https://api.openclaw.com';
  
  if (!apiKey) {
    // 返回模拟数据用于测试
    return getMockQuestions(userInput);
  }
  
  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // 解析 JSON 响应
    return JSON.parse(content);
  } catch (error) {
    console.error('AI service error:', error);
    return getMockQuestions(userInput);
  }
}

/**
 * 调用 AI 生成 Skill 框架
 * @param {string} userInput - 用户输入的描述
 * @param {Object} answers - 用户的选择题答案
 * @returns {Promise<Object>} Skill 框架
 */
async function generateFramework(userInput, answers) {
  const prompt = AI_PROMPTS.generateFramework(userInput, answers);
  
  const { default: fetch } = await import('node-fetch');
  
  const requestBody = {
    model: 'ark/minimax-2.5',
    messages: [
      { role: 'user', content: prompt }
    ],
    max_tokens: 4000,
    temperature: 0.7
  };
  
  const apiKey = process.env.OPENCLAW_API_KEY || process.env.MINIMAX_API_KEY;
  const baseUrl = process.env.OPENCLAW_BASE_URL || 'https://api.openclaw.com';
  
  if (!apiKey) {
    return getMockFramework(userInput, answers);
  }
  
  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    return JSON.parse(content);
  } catch (error) {
    console.error('AI service error:', error);
    return getMockFramework(userInput, answers);
  }
}

/**
 * 模拟选择题数据（当 API 不可用时）
 */
function getMockQuestions(userInput) {
  const lowerInput = userInput.toLowerCase();
  
  // 根据用户输入生成相关的问题
  const questions = [
    {
      question: "这个 Skill 主要面向哪类用户？",
      options: ["企业内部员工", "开发者", "客服人员", "所有用户"],
      key: "targetUsers"
    },
    {
      question: " Skill 需要集成哪些外部系统？",
      options: ["飞书", "企业微信", "Slack", "不需要集成"],
      key: "integrations"
    },
    {
      question: "这个 Skill 的触发方式是什么？",
      options: ["关键词触发", "定时触发", "Webhook", "手动触发"],
      key: "triggerType"
    },
    {
      question: " Skill 执行后需要返回什么结果？",
      options: ["文本回复", "结构化数据", "文件/文档", "多种格式"],
      key: "outputFormat"
    }
  ];
  
  return questions;
}

/**
 * 模拟 Skill 框架数据（当 API 不可用时）
 */
function getMockFramework(userInput, answers) {
  return {
    name: "自定义 Skill",
    description: `基于用户描述 "${userInput}" 创建的 Skill`,
    category: "效率工具",
    tags: ["自定义", "自动化"],
    config: {
      triggers: ["关键词触发"],
      actions: ["执行自定义操作"]
    },
    prompt: `你是一个自定义 Skill，名称为：${userInput}

请根据用户输入的内容，智能地完成相关任务。`,
    parameters: [
      {
        name: "input",
        type: "string",
        required: true,
        description: "用户输入的内容"
      }
    ]
  };
}

module.exports = {
  generateQuestions,
  generateFramework,
  AI_PROMPTS
};
