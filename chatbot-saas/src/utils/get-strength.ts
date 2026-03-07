export function getStrength(password: string): { level: number; label: string; color: string } {
    if (!password) return { level: 0, label: '', color: 'gray.200' };
  
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
  
    if (score <= 2) return { level: 1, label: 'Fraca', color: 'red.500' };
    if (score <= 3) return { level: 2, label: 'Média', color: 'orange.400' };
    return { level: 3, label: 'Forte', color: 'green.500' };
  }