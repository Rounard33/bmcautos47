export const environment = {
  production: false,
  
  // Coming Soon Mode - Changez à false pour afficher le site complet
  comingSoon: false, // En dev, on peut voir le site complet
  
  // Configuration API KeplerVO (via proxy Vercel)
  keplerVO: {
    // En dev : utiliser 'vercel dev' pour tester le proxy local
    // ou garder useMockData: true pour développer sans API
    apiUrl: 'http://localhost:3000/api',  // Proxy local (avec vercel dev)
    apiKey: '',  // Vide - la clé est sécurisée sur le serveur
    dealerId: '',  // Vide - géré par le proxy
    timeout: 10000,
    cacheDuration: 300000,
    useMockData: false  // false = utilise l'API (nécessite 'vercel dev')
  }
};
