export const phoneMask = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export const cpfMask = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export const priceMask = (value: string): string => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    if (!numbers) return '';
    
    // Converte para número e divide por 100 para ter centavos
    const number = parseInt(numbers, 10) / 100;
    
    // Formata como moeda brasileira
    return number.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

export const priceUnmask = (value: string): number | undefined => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    if (!numbers) return undefined;
    
    // Converte para número e divide por 100 para ter centavos
    const number = parseInt(numbers, 10) / 100;
    
    return isNaN(number) ? undefined : number;
}