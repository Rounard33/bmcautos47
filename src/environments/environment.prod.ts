export const environment = {
  production: true,
  
  // Coming Soon Mode - Géré par variable Vercel COMING_SOON
  comingSoon: false,
  
  // Configuration API KEPLER (via proxy Vercel)
  keplerVO: {
    apiUrl: '/api',  // Pointe vers le proxy Vercel (même domaine)
    timeout: 10000,
    cacheDuration: 3600000,  // 1 heure en production (pour réduire les appels API)
    useMockData: false  // Géré par variable Vercel USE_MOCK_DATA
  }
};
