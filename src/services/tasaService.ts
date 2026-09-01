export const tasaService = {
    // Retorna la tasa actual. Más adelante, esto hará un fetch a tu backend.
    getTasaActual: async (): Promise<number> => {
        // Simulamos un pequeño retraso de red
        return new Promise((resolve) => {
            setTimeout(() => resolve(36.50), 300); // Tasa ficticia: 36.50 Bs/USD
        });
    }
};