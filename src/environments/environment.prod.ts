export const environment = {
  production: true,
  
  // Coming Soon Mode - Géré par variable Vercel COMING_SOON
  comingSoon: false,
  
  // Configuration API KEPLER (via proxy Vercel)
  keplerVO: {
    apiUrl: '/api',  // Pointe vers le proxy Vercel (même domaine)
    timeout: 10000,
    cacheDuration: 600000,  // 10 minutes en production
    useMockData: false  // Géré par variable Vercel USE_MOCK_DATA
  }
};
