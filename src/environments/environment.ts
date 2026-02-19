export const environment = {
  production: false,
  
  // Coming Soon Mode - Changez à false pour afficher le site complet
  comingSoon: false, // En dev, on peut voir le site complet
  
  // Configuration API KEPLER (via proxy Vercel)
  keplerVO: {
    // En dev : utiliser 'vercel dev' pour tester le proxy local
    // ou garder useMockData: true pour développer sans API
    apiUrl: 'http://localhost:3000/api',  // Proxy local (avec vercel dev)
    timeout: 10000,
    cacheDuration: 1800000,  // 30 minutes (pour réduire les appels API)
    useMockData: false  // false = utilise l'API KEPLER (nécessite vercel dev)
  }
};
