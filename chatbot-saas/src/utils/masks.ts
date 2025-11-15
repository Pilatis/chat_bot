export const phoneMask = (value: string) => {
    return value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
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