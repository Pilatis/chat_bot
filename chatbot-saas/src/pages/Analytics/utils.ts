/** Cores para barras de palavras-chave */
export const ANALYTICS_KEYWORD_COLORS = [
  '#00A8C9',
  '#0099FF',
  '#10b981',
  '#6B7280',
  '#1AC9E6',
] as const;

export function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`;
}

export function formatResponseTime(seconds?: number): string {
  if (!seconds) return 'N/A';
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs.toFixed(0)}s`;
}
