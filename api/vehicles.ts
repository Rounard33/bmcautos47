import type { VercelRequest, VercelResponse } from '@vercel/node';

// ============================================
// INTERFACES KEPLER API
// ============================================

interface KeplerTokenResponse {
  value: string;
  createdAt: string;
}

interface KeplerVehicleAPI {
  uuid: string;
  reference: string;
  brand: { name: string };
  model: { name: string };
  version?: { name: string };
  year: number;
  distanceTraveled?: number;
  pricePublic?: number;
  energy?: { name: string };
  gearbox?: { name: string };
  state?: string;
  gallery?: Array<{
    photo: string;
    large?: string;
    big?: string;
    thumb?: string;
    position?: number;
  }>;
  color?: { name: string };
  insideColor?: { name: string };
  taxHorsepower?: number;
  horsepower?: number;
  doors?: number;
  seats?: number;
  warrantyLabel?: { name: string };
  warrantyDuration?: number;
  equipmentStandard?: Array<{ name: string; reference: string }>;
  equipmentOptional?: Array<{ name: string; reference: string; price?: number }>;
  vin?: string;
  licenseNumber?: string;
  dateOfDistribution?: string;
}

// Cache du token en mémoire (valide 30 minutes)
let tokenCache: { token: string; expiresAt: number } | null = null;

/**
 * Génère et met en cache un token d'authentification KeplerVO
 * Le token est valide pendant 30 minutes
 */
async function getAuthToken(apiKey: string): Promise<string> {
  // Vérifier si le token en cache est encore valide
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    console.log('🔑 Using cached KeplerVO token');
    return tokenCache.token;
  }

  console.log('🔑 Generating new KEPLER token...');

  // Générer un nouveau token (utilise l'URL de base configurée)
  const baseUrl = process.env['KEPLER_API_URL'] || 'https://www.kepler-soft.net/api';
  const tokenResponse = await fetch(`${baseUrl}/v3.0/auth-token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ apiKey }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error(`❌ Failed to generate token: ${tokenResponse.status} ${tokenResponse.statusText}`);
    console.error('Response:', errorText);
    throw new Error(`Authentication failed: ${tokenResponse.status}`);
  }

  const tokenData: KeplerTokenResponse = await tokenResponse.json();

  // Mettre en cache le token (expire dans 29 minutes pour avoir une marge)
  tokenCache = {
    token: tokenData.value,
    expiresAt: Date.now() + 29 * 60 * 1000, // 29 minutes
  };

  console.log('✅ New token generated and cached');
  return tokenData.value;
}

/**
 * Vercel Serverless Function - Proxy pour l'API KeplerVO
 * 
 * Cette fonction sécurise votre clé API KeplerVO en la gardant côté serveur
 * et gère l'authentification par token (valide 30 minutes).
 * 
 * Endpoints :
 * - GET /api/vehicles          → Liste de tous les véhicules
 * - GET /api/vehicles?vehicleId=X → Un véhicule spécifique
 */
export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // ============================================
  // CORS Headers
  // ============================================
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*'); // En prod, remplacez par votre domaine
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Gérer les requêtes OPTIONS (CORS preflight)
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Seules les requêtes GET sont autorisées
  if (request.method !== 'GET') {
    return response.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'Only GET requests are supported'
    });
  }

  // ============================================
  // Configuration depuis les variables d'environnement Vercel
  // ============================================
  const apiUrl = process.env['KEPLER_API_URL'] || 'https://www.kepler-soft.net/api';
  const apiKey = process.env['KEPLER_API_KEY'];

  // Vérifier que la clé API est configurée
  if (!apiKey) {
    console.error('❌ KEPLER_API_KEY not configured in Vercel environment variables');
    return response.status(500).json({ 
      success: false,
      error: 'API configuration error',
      message: 'KEPLER_API_KEY not configured. Please add it in Vercel Dashboard → Settings → Environment Variables'
    });
  }

  // ============================================
  // Gérer les différentes routes
  // ============================================
  const { vehicleId } = request.query;

  try {
    // Générer ou récupérer le token d'authentification
    const authToken = await getAuthToken(apiKey);

    let url: string;
    
    // Si un ID de véhicule est demandé
    if (vehicleId && typeof vehicleId === 'string') {
      url = `${apiUrl}/v3.8/vehicles/${vehicleId}/`;
      console.log(`🔄 Fetching vehicle ${vehicleId} from KeplerVO`);
    } else {
      // Sinon, liste de tous les véhicules
      url = `${apiUrl}/v3.8/vehicles/`;
      console.log(`🔄 Fetching all vehicles from KeplerVO`);
    }

    // ============================================
    // Appel à l'API KeplerVO avec le token
    // ============================================
    const apiResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Auth-Token': authToken,
        'Content-Type': 'application/json',
      },
    });

    // Gérer les erreurs HTTP
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error(`❌ KeplerVO API error: ${apiResponse.status} ${apiResponse.statusText}`);
      console.error('Response body:', errorText);
      
      // Retourner l'erreur au client (sans exposer des détails sensibles)
      return response.status(apiResponse.status).json({
        success: false,
        error: `KeplerVO API error: ${apiResponse.status}`,
        message: apiResponse.status === 401 
          ? 'Authentication failed - check your API key'
          : apiResponse.status === 404
          ? 'Resource not found'
          : 'API request failed'
      });
    }

    // Parser la réponse JSON
    const data: KeplerVehicleAPI | KeplerVehicleAPI[] = await apiResponse.json();
    
    console.log(`✅ Successfully fetched ${Array.isArray(data) ? data.length : 1} vehicle(s) from KeplerVO`);
    
    // ============================================
    // Cache la réponse
    // ============================================
    // s-maxage=300 : Cache sur le CDN Vercel pendant 5 minutes
    // stale-while-revalidate : Sert une version en cache pendant la revalidation
    response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    
    // Retourner les données
    return response.status(200).json({
      success: true,
      data: data,
      total: Array.isArray(data) ? data.length : 1
    });

  } catch (error) {
    // Gérer les erreurs réseau ou autres
    console.error('❌ Error in vehicles proxy API:', error);
    
    return response.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

