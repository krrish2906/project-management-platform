import OpenAI from 'openai';

/**
 * Shared AI client configuration.
 * 
 * Supports any OpenAI-compatible API (OpenAI, Groq, Together, local Ollama, etc.)
 * by setting AI_BASE_URL and AI_API_KEY in .env.local.
 * 
 * Example .env.local configurations:
 * 
 * For OpenAI:
 *   AI_API_KEY=sk-...
 *   AI_MODEL=gpt-4o-mini
 * 
 * For Groq:
 *   AI_API_KEY=gsk_...
 *   AI_BASE_URL=https://api.groq.com/openai/v1
 *   AI_MODEL=llama-3.3-70b-versatile
 * 
 * For Google Gemini (OpenAI-compatible):
 *   AI_API_KEY=...
 *   AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
 *   AI_MODEL=gemini-2.0-flash
 */

const getAIClient = () => {
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
        throw new Error('AI_API_KEY is not set in environment variables. Please add it to .env.local');
    }

    const config: { apiKey: string; baseURL?: string } = { apiKey };

    // If a custom base URL is provided (for Groq, Together, etc.), use it
    if (process.env.AI_BASE_URL) {
        config.baseURL = process.env.AI_BASE_URL;
    }

    return new OpenAI(config);
};

export const getAIModel = () => {
    return process.env.AI_MODEL || 'gpt-4o-mini';
};

export default getAIClient;
