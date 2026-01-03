export const environment = {
  production: true,
  
  // Configuration API KeplerVO (via proxy Vercel)
  keplerVO: {
    apiUrl: '/api',  // Pointe vers le proxy Vercel (même domaine)
    apiKey: '',  // Vide - la clé est sécurisée sur le serveur Vercel
    dealerId: '',  // Vide - géré par le proxy
    timeout: 10000,
    cacheDuration: 600000,  // Cache 10 minutes en production
    useMockData: true  // Mettre à false pour utiliser l'API KeplerVO via proxy
  }
};
