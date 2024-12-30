export const MULTI_AGENT_CONFIG = {
  "name": "agent",
  "type": "agent",
  "workflow": [
    {
      "name": "Document Verification",
      "type": "DocumentVerification",
      "path": "/api/v1/agent/document-verification"
    },
    {
      "name": "Credit Score Fetcher",
      "type": "CreditScoreFetcher",
      "path": "/api/v1/agent/credit-score-fetcher"
    },
    {
      "name": "Credit Score Verification",
      "type": "CreditScoreVerification",
      "path": "/api/v1/agent/credit-verification"
    },
    {
      "name": "Risk Computer",
      "type": "RiskComputer",
      "path": "/api/v1/agent/risk-computer"
    },
    {
      "name": "Eligibility and Risk Assessment",
      "type": "EligibilityAndRiskAssessment",
      "path": "/api/v1/agent/eligibility-risk-assessment"
    },
    {
      "name": "Loan Application Final Decision",
      "type": "LoanApplicationFinalDecision",
      "path": "/api/v1/agent/loan-application-decision"
    }
  ]
}

export const GUARD_RAIL_CONFIG = {
  "openapi" : "3.1.0"
}

export const BASE_MODELS = [
  {
    "modelName": "Claude",
    "modelProvider": "Anthropic",
    "description": "Anthropic is a safety-focused AI research company dedicated to building reliable and interpretable AI systems. Known for their work on AI alignment, Anthropic aims to develop AI models that prioritize safety, transparency, and ethical use in high-stakes environments.",
    "versions": [
      {
        "name": "Claude 3.5 Sonnet",
        "version": "3.5 Sonnet",
        "tags": ["Anthropic", "Text model", "Max 200k tokens"],
        "description": "Claude 3.5 Sonnet is a high-performance model, excelling at complex reasoning, coding, and natural language tasks with improved vision capabilities for interpreting charts and images.",
        "attributes": ["Text generation", "Coding", "Vision tasks"],
        "modelId": "anthropic.claude-3.5-sonnet",
        "releaseDate": "2024-06-20"
      },
      {
        "name": "Claude 3 Opus",
        "version": "3 Opus",
        "tags": ["Anthropic", "Text model", "Max 200k tokens"],
        "description": "Claude 3 Opus is the most powerful model in the Claude family, capable of handling highly complex tasks, research, and strategy with near-perfect recall.",
        "attributes": ["Advanced reasoning", "Research", "Task automation"],
        "modelId": "anthropic.claude-3-opus",
        "releaseDate": "2024-03-04"
      },
      {
        "name": "Claude 3 Haiku",
        "version": "3 Haiku",
        "tags": ["Anthropic", "Text model", "Max 200k tokens"],
        "description": "Claude 3 Haiku is optimized for speed and responsiveness, making it ideal for handling simple queries and tasks with near-instant answers.",
        "attributes": ["Fast response", "Simple tasks", "Low latency"],
        "modelId": "anthropic.claude-3-haiku",
        "releaseDate": "2024-03-04"
      }
    ]
  },
  {
    "modelName": "Command R+",
    "modelProvider": "Cohere",
    "description": "Cohere is a Canadian AI company specializing in large language models for text generation, search, and understanding. Their models are widely used for applications such as semantic search, conversational AI, and embeddings, with a strong focus on enterprise-level AI solutions.",
    "versions": [
      {
        "name": "Command R+",
        "version": "08-2024",
        "tags": ["Cohere", "Text model", "Max 128k tokens"],
        "description": "Latest version of Cohere’s advanced text generation model, optimized for complex workflows such as code generation, retrieval-augmented generation (RAG), and tool use. It features adaptive tool capabilities and supports 23 languages.",
        "attributes": ["Text generation", "Conversational AI", "Complex reasoning"],
        "modelId": "cohere.command-r-plus-08-2024",
        "releaseDate": "2024-08-30"
      },
      {
        "name": "Command R",
        "version": "08-2024",
        "tags": ["Cohere", "Text model", "Max 128k tokens"],
        "description": "This version focuses on improving performance in text generation, math, and structured data analysis. Ideal for complex multi-step instructions.",
        "attributes": ["Text generation", "Tool use", "Logical reasoning"],
        "modelId": "cohere.command-r-08-2024",
        "releaseDate": "2024-08-30"
      },
      {
        "name": "Command R+",
        "version": "04-2024",
        "tags": ["Cohere", "Text model", "Max 128k tokens"],
        "description": "Previous version of Command R+, known for its high reliability and improved contextual understanding for large-scale RAG workflows.",
        "attributes": ["Text generation", "RAG workflows", "Conversational AI"],
        "modelId": "cohere.command-r-plus-04-2024",
        "releaseDate": "2024-04-09"
      },
      {
        "name": "Embed v3.0 Multilingual",
        "version": "v3.0",
        "tags": ["Cohere", "Embedding model", "Max 512 tokens"],
        "description": "Model focused on improving accuracy of semantic search, clustering, and classification in over 100 languages.",
        "attributes": ["Multilingual embeddings", "Search", "Clustering"],
        "modelId": "cohere.embed-v3.0-multilingual",
        "releaseDate": "2024-03-20"
      }
    ]},
  {
    "modelName": "ChatGPT",
    "modelProvider": "OpenAI",
    "description": "OpenAI is an AI research and deployment company with a mission to ensure that artificial general intelligence (AGI) benefits all of humanity. They focus on developing advanced AI models like GPT-4 and DALL·E, while emphasizing safety, transparency, and ethical AI use in high-stakes applications.",
    "versions": [
      {
        "name": "GPT-4 Turbo",
        "version": "v4 Turbo",
        "tags": ["OpenAI", "Text model", "Max 128k tokens", "Multimodal"],
        "description": "GPT-4 Turbo is a more affordable and efficient version of GPT-4, designed to handle both text and image inputs, enabling use cases such as generating captions, analyzing real-world images, and reading documents.",
        "attributes": ["Text generation", "Multimodal", "Advanced reasoning"],
        "modelId": "openai.gpt-4-turbo",
        "releaseDate": "2024-08-06"
      },
      {
        "name": "GPT-4o",
        "version": "2024-08-06",
        "tags": ["OpenAI", "Text model", "Max 16k tokens"],
        "description": "GPT-4o is the latest in the GPT-4 family, with improvements in structured output generation and fine-tuning support. It enhances long-context text generation for complex tasks.",
        "attributes": ["Text generation", "Long context", "Structured outputs"],
        "modelId": "openai.gpt-4o-2024-08-06",
        "releaseDate": "2024-08-06"
      },
      {
        "name": "DALL·E 3",
        "version": "v3",
        "tags": ["OpenAI", "Image model", "Image generation"],
        "description": "DALL·E 3 is an advanced image generation model, capable of creating high-quality images from detailed text descriptions. It supports moderation features to ensure safe usage.",
        "attributes": ["Image generation", "Text-to-image", "Creative outputs"],
        "modelId": "openai.dalle-3",
        "releaseDate": "2024-10-05"
      },
      {
        "name": "Whisper",
        "version": "v2",
        "tags": ["OpenAI", "Speech model", "Transcription"],
        "description": "Whisper v2 is a speech-to-text model designed for high-quality transcription in multiple languages and dialects, with significant improvements in accuracy and speed.",
        "attributes": ["Speech recognition", "Multilingual", "Transcription"],
        "modelId": "openai.whisper-v2",
        "releaseDate": "2024-09-01"
      },
      {
        "name": "Text-to-Speech",
        "version": "tts-1-hd",
        "tags": ["OpenAI", "Speech model", "TTS"],
        "description": "A high-quality text-to-speech model with multiple preset voices, optimized for real-time and high-quality audio generation.",
        "attributes": ["Speech synthesis", "Real-time", "High-quality"],
        "modelId": "openai.tts-1-hd",
        "releaseDate": "2024-09-15"
      }
    ]
  },
  {
    "modelName": "Llama",
    "modelProvider": "Meta",
    "description": "Llama is Meta's family of open-source large language models, designed for a wide range of applications including text generation, reasoning, and coding. Llama models are optimized for efficiency and are available for both research and commercial use.",
    "versions": [
      {
        "name": "Llama 3.1",
        "version": "3.1",
        "tags": ["Meta", "Text model", "Max 405B tokens"],
        "description": "Llama 3.1 is the latest version of Meta's open-source LLM, offering multilingual and multimodal capabilities with advanced reasoning and coding skills. It comes in three sizes: 8B, 70B, and 405B parameters.",
        "attributes": ["Text generation", "Coding", "Multilingual", "Multimodal"],
        "modelId": "meta.llama-3.1",
        "releaseDate": "2024-07-23"
      },
      {
        "name": "Llama 3",
        "version": "3",
        "tags": ["Meta", "Text model", "Max 70B tokens"],
        "description": "Released in April 2024, Llama 3 introduced a significant upgrade in multilingual capabilities and reasoning, optimized for a larger context window.",
        "attributes": ["Text generation", "Reasoning", "Multilingual"],
        "modelId": "meta.llama-3",
        "releaseDate": "2024-04-18"
      },
      {
        "name": "Llama 2",
        "version": "2",
        "tags": ["Meta", "Text model", "Max 70B tokens"],
        "description": "Llama 2 was released as an open-source model, designed to be efficient for both research and commercial use. It introduced several improvements in text generation and fine-tuning capabilities.",
        "attributes": ["Text generation", "Commercial use", "Fine-tuning"],
        "modelId": "meta.llama-2",
        "releaseDate": "2023-07-18"
      },
      {
        "name": "Mistral 7B",
        "version": "0.1",
        "tags": ["Mistral AI", "Text model", "Max 7B tokens"],
        "description": "Mistral 7B is a transformer-based model with 7 billion parameters that outperforms Llama 2 13B in several benchmarks. It uses Grouped-Query Attention and Sliding-Window Attention for faster inference and efficient handling of longer sequences.",
        "attributes": ["Text generation", "Coding", "Commonsense reasoning", "Multilingual"],
        "modelId": "mistral-7b",
        "releaseDate": "2023-09-27"
      }
    ]
  }

]
