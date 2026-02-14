/**
 * Script d'injection des variables d'environnement Vercel
 * dans environment.prod.ts au moment du build
 * 
 * Variables Vercel utilisées :
 * - COMING_SOON: true/false pour activer le mode "Arrive bientôt"
 * - USE_MOCK_DATA: true/false pour forcer les mock data (optionnel)
 */

const fs = require('fs');
const path = require('path');

try {
  // Lecture des variables d'environnement Vercel (avec valeurs par défaut)
  const comingSoon = process.env.COMING_SOON !== 'false'; // Par défaut: true (sécurité)
  const useMockData = process.env.USE_MOCK_DATA === 'true';

  console.log('🔧 Injection des variables d\'environnement...');
  console.log(`   COMING_SOON: ${comingSoon} (raw: "${process.env.COMING_SOON}")`);
  console.log(`   USE_MOCK_DATA: ${useMockData} (raw: "${process.env.USE_MOCK_DATA}")`);

  // Génération du fichier environment.prod.ts
  const envContent = `export const environment = {
  production: true,
  
  // Coming Soon Mode - Géré par variable Vercel COMING_SOON
  comingSoon: ${comingSoon},
  
  // Configuration API KEPLER (via proxy Vercel)
  keplerVO: {
    apiUrl: '/api',  // Pointe vers le proxy Vercel (même domaine)
    timeout: 10000,
    cacheDuration: 600000,  // 10 minutes en production
    useMockData: ${useMockData}  // Géré par variable Vercel USE_MOCK_DATA
  }
};
`;

  // Écriture du fichier
  const targetPath = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');
  console.log(`📝 Écriture dans: ${targetPath}`);
  
  fs.writeFileSync(targetPath, envContent, 'utf-8');

  console.log('✅ Fichier environment.prod.ts généré avec succès');
  process.exit(0);
} catch (error) {
  console.error('❌ Erreur lors de l\'injection:', error.message);
  console.error(error.stack);
  process.exit(1);
}
