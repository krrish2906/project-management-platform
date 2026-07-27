import OpenAI from 'openai';

const getAIClient = () => {
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
        throw new Error('AI assistant is currently unavailable. Please contact your workspace administrator to enable AI features.');
    }

    const config: { apiKey: string; baseURL?: string } = { apiKey };

    if (process.env.AI_BASE_URL) {
        config.baseURL = process.env.AI_BASE_URL;
    }

    return new OpenAI(config);
};

export const getAIModel = () => {
    return process.env.AI_MODEL || 'gpt-4o-mini';
};

export default getAIClient;
