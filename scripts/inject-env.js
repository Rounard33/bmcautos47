/**
 * Script d'injection des variables d'environnement Vercel
 * dans environment.prod.ts au moment du build
 * 
 * Variables Vercel utilisées :
 * - COMING_SOON: true/false pour activer le mode "Arrive bientôt"
 * - USE_MOCK_DATA: true/false pour forcer les mock data (optionnel)
 */

import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  // Lecture des variables d'environnement Vercel (avec valeurs par défaut)
  const comingSoon = process.env.COMING_SOON !== 'false'; // Par défaut: true (sécurité)
  const useMockData = process.env.USE_MOCK_DATA === 'true';

  process.stdout.write('🔧 Injection des variables d\'environnement...\n');
  process.stdout.write(`   COMING_SOON: ${comingSoon}\n`);
  process.stdout.write(`   USE_MOCK_DATA: ${useMockData}\n`);

  // Génération du fichier environment.prod.ts
  const envContent = `export const environment = {
  production: true,
  
  // Coming Soon Mode - Géré par variable Vercel COMING_SOON
  comingSoon: ${comingSoon},
  
  // Configuration API KEPLER (via proxy Vercel)
  keplerVO: {
    apiUrl: '/api',  // Pointe vers le proxy Vercel (même domaine)
    timeout: 30000,
    cacheDuration: 600000,  // 10 minutes en production
    useMockData: ${useMockData}  // Géré par variable Vercel USE_MOCK_DATA
  }
};
`;

  // Écriture du fichier
  const targetPath = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');
  process.stdout.write(`📝 Écriture dans: ${targetPath}\n`);
  
  fs.writeFileSync(targetPath, envContent, 'utf-8');

  process.stdout.write('✅ Fichier environment.prod.ts généré avec succès\n');
  process.exit(0);
} catch (error) {
  process.stderr.write('❌ Erreur lors de l\'injection: ' + error.message + '\n');
  process.stderr.write(error.stack + '\n');
  process.exit(1);
}
