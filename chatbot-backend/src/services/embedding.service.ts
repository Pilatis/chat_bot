import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Serviço para geração de embeddings
 * 
 * Suporta múltiplos provedores:
 * - OpenAI (text-embedding-ada-002 ou text-embedding-3-small)
 * - Fallback para simulação local (apenas para desenvolvimento)
 */
export class EmbeddingService {
  private readonly apiKey: string | undefined;
  private readonly model: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = process.env['OPENAI_API_KEY'];
    this.model = process.env['EMBEDDING_MODEL'] || 'text-embedding-3-small';
    this.baseUrl = process.env['OPENAI_BASE_URL'] || 'https://api.openai.com/v1';
  }

  /**
   * Gera embedding para um texto
   * 
   * @param text - Texto para gerar embedding
   * @returns Array de números representando o embedding (1536 dimensões para ada-002, 1536 para 3-small)
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!text || text.trim().length === 0) {
      throw new Error('Texto não pode ser vazio');
    }

    // Mock: sem API key ou USE_MOCK_EMBEDDINGS=true → usa embedding simulado até integrar a API
    const useMock = !this.apiKey || process.env['USE_MOCK_EMBEDDINGS'] === 'true';
    if (useMock) {
      if (!this.apiKey) {
        console.warn('⚠️  OPENAI_API_KEY não configurada. Usando embedding simulado até integrar a API.');
      }
      return this.generateSimulatedEmbedding(text);
    }

    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          input: text.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' })) as any;
        throw new Error(`Erro ao gerar embedding: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json() as any;
      
      if (!data.data || !data.data[0] || !data.data[0].embedding) {
        throw new Error('Resposta inválida da API de embeddings');
      }

      return data.data[0].embedding;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao gerar embedding:', errorMessage);
      
      // Fallback para simulação em caso de erro
      if (process.env['NODE_ENV'] === 'development') {
        console.warn('⚠️  Usando embedding simulado como fallback');
        return this.generateSimulatedEmbedding(text);
      }
      
      throw error;
    }
  }

  /**
   * Gera embeddings em lote (mais eficiente)
   * 
   * @param texts - Array de textos para gerar embeddings
   * @returns Array de embeddings
   */
  async generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    if (!texts || texts.length === 0) {
      return [];
    }

    // Mock: sem API key ou USE_MOCK_EMBEDDINGS=true → usa embeddings simulados até integrar a API
    const useMock = !this.apiKey || process.env['USE_MOCK_EMBEDDINGS'] === 'true';
    if (useMock) {
      if (!this.apiKey) {
        console.warn('⚠️  OPENAI_API_KEY não configurada. Usando embeddings simulados até integrar a API.');
      }
      return texts.map(text => this.generateSimulatedEmbedding(text));
    }

    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          input: texts.map(t => t.trim())
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' })) as any;
        throw new Error(`Erro ao gerar embeddings: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json() as any;
      
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Resposta inválida da API de embeddings');
      }

      return data.data.map((item: any) => item.embedding);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao gerar embeddings em lote:', errorMessage);
      
      // Fallback para simulação
      if (process.env['NODE_ENV'] === 'development') {
        console.warn('⚠️  Usando embeddings simulados como fallback');
        return texts.map(text => this.generateSimulatedEmbedding(text));
      }
      
      throw error;
    }
  }

  /**
   * Gera embedding simulado (apenas para desenvolvimento/testes)
   * Usa hash do texto para gerar valores consistentes
   */
  private generateSimulatedEmbedding(text: string): number[] {
    // Gera um embedding simulado baseado no hash do texto
    // Isso garante que o mesmo texto sempre gere o mesmo embedding
    const hash = this.simpleHash(text);
    const dimensions = 1536; // Dimensões padrão do OpenAI
    
    const embedding: number[] = [];
    for (let i = 0; i < dimensions; i++) {
      // Gera valores pseudo-aleatórios baseados no hash
      const seed = hash + i;
      const value = Math.sin(seed) * 0.5 + 0.5; // Normaliza entre 0 e 1
      embedding.push(value);
    }
    
    return embedding;
  }

  /**
   * Hash simples para gerar valores consistentes
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Calcula similaridade de cosseno entre dois embeddings
   * 
   * @param embedding1 - Primeiro embedding
   * @param embedding2 - Segundo embedding
   * @returns Similaridade entre 0 e 1 (1 = idêntico)
   */
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings devem ter a mesma dimensão');
    }

    if (embedding1.length === 0 || embedding2.length === 0) {
      return 0;
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      const val1 = embedding1[i] ?? 0;
      const val2 = embedding2[i] ?? 0;
      dotProduct += val1 * val2;
      norm1 += val1 * val1;
      norm2 += val2 * val2;
    }

    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    if (magnitude === 0) return 0;

    return dotProduct / magnitude;
  }
}

