/**
 * Valida CPF com algoritmo de dígitos verificadores.
 * Aceita com ou sem máscara (000.000.000-00 ou 00000000000).
 */
export function isValidCPF(raw: string): boolean {
  const cpf = raw.replace(/\D/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  for (let t = 9; t < 11; t++) {
    let sum = 0;
    for (let i = 0; i < t; i++) {
      sum += Number(cpf[i]) * (t + 1 - i);
    }
    let digit = ((sum * 10) % 11) % 10;
    if (Number(cpf[t]) !== digit) return false;
  }
  return true;
}

/** Remove máscara e retorna somente dígitos. */
export function stripCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

/** Valida telefone brasileiro (10 ou 11 dígitos, apenas números). */
export function isValidPhone(raw: string): boolean {
  const phone = raw.replace(/\D/g, '');
  return phone.length === 10 || phone.length === 11;
}

/** Remove máscara do telefone. */
export function stripPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}
