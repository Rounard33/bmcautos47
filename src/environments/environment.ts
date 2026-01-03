export const environment = {
  production: false,
  
  // Configuration API KeplerVO (via proxy Vercel)
  keplerVO: {
    // En dev : peut tester le proxy local avec 'vercel dev'
    // ou garder les mocks pour développer sans API
    apiUrl: 'http://localhost:3000/api',  // Proxy local (si vercel dev)
    apiKey: '',  // Vide - la clé est sécurisée sur le serveur
    dealerId: '',  // Vide - géré par le proxy
    timeout: 10000,
    cacheDuration: 300000,
    useMockData: true  // true = utilise les véhicules de démo
  }
};
