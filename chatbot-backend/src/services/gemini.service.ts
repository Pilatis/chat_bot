/**
 * Serviço de geração de texto com Google Gemini.
 * Usado pelo chatbot para responder mensagens com base no contexto da empresa.
 */

import { GoogleGenAI } from '@google/genai';

const GEMINI_MODEL = 'gemini-2.0-flash';

export interface GeminiGenerateOptions {
  /** Instrução de sistema: papel do assistente e contexto da empresa */
  systemInstruction: string;
  /** Mensagem do usuário */
  userMessage: string;
}

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI | null {
  const apiKey = process.env['GEMINI_API_KEY'];
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

/**
 * Gera uma resposta em texto usando o Gemini.
 * Retorna null se a API key não estiver configurada ou em caso de erro.
 */
export async function generateText(options: GeminiGenerateOptions): Promise<string | null> {
  const ai = getClient();
  if (!ai) {
    return null;
  }

  try {
    const contents =
      `[Contexto do assistente]\n${options.systemInstruction}\n\n[Pergunta do cliente]\n${options.userMessage}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    });

    const text = response.text?.trim();
    return text || null;
  } catch (error) {
    console.error('[Gemini] Erro ao gerar texto:', error);
    return null;
  }
}
