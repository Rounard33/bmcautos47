import type {VercelRequest, VercelResponse} from '@vercel/node';

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

// Cache des réponses API côté serveur (15 min = ~4 appels/h vers Kepler)
const serverCache: Map<string, { data: any; timestamp: number }> = new Map();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Verrou (mutex) pour éviter les appels API simultanés multiples pour la même ressource
// Si plusieurs utilisateurs demandent la même page en même temps, seul le 1er fait l'appel API
// Les autres attendent le résultat du 1er
const pendingRequests: Map<string, Promise<any>> = new Map();

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
  const baseUrl = process.env['KEPLER_API_URL'] || 'https://app.keplervo.com/api';
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
  const apiUrl = process.env['KEPLER_API_URL'] || 'https://app.keplervo.com/api';
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
  const { vehicleId, page, count } = request.query;

  // Créer une clé de cache unique pour cette requête
  const cacheKey = vehicleId 
    ? `vehicle-${vehicleId}` 
    : `vehicles-page-${page || 1}-count-${count || 'default'}`;

  try {
    // ============================================
    // Vérifier le cache serveur en premier
    // ============================================
    const cached = serverCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log(`✅ Cache serveur hit pour ${cacheKey}`);
      response.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1200');
      return response.status(200).json({
        success: true,
        data: cached.data,
        total: Array.isArray(cached.data) ? cached.data.length : 1,
        cached: true
      });
    }

    // ============================================
    // PROTECTION : Vérifier si une requête est déjà en cours (verrou)
    // ============================================
    // Si plusieurs utilisateurs demandent la même ressource en même temps,
    // seul le 1er fait l'appel API, les autres attendent le résultat
    const pendingRequest = pendingRequests.get(cacheKey);
    if (pendingRequest) {
      console.log(`⏳ Requête en cours pour ${cacheKey}, attente du résultat...`);
      try {
        const data = await pendingRequest;
        response.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1200');
        return response.status(200).json({
          success: true,
          data: data,
          total: Array.isArray(data) ? data.length : 1,
          cached: false,
          shared: true // Indique que la requête a été partagée
        });
      } catch (error) {
        // Si la requête en cours échoue, on continue avec une nouvelle requête
        console.warn(`⚠️ Requête partagée échouée pour ${cacheKey}, nouvelle tentative...`);
        pendingRequests.delete(cacheKey);
      }
    }

    // ============================================
    // Créer la requête API et la stocker dans le verrou
    // ============================================
    const requestPromise = (async () => {
      // Générer ou récupérer le token d'authentification
      const authToken = await getAuthToken(apiKey);

      let url: string;
      
      // Si un ID de véhicule est demandé
      if (vehicleId && typeof vehicleId === 'string') {
        url = `${apiUrl}/v3.8/vehicles/${vehicleId}/`;
        console.log(`🔄 Fetching vehicle ${vehicleId} from KeplerVO`);
      } else {
        // Sinon, liste de tous les véhicules avec pagination
        const pageParam = page && typeof page === 'string' ? `page=${page}` : '';
        const countParam = count && typeof count === 'string' ? `count=${count}` : '';
        
        // Construire les paramètres de requête
        const queryParams = [pageParam, countParam].filter(p => p !== '').join('&');
        const urlSuffix = queryParams ? `?${queryParams}` : '';
        
        url = `${apiUrl}/v3.8/vehicles/${urlSuffix}`;
        console.log(`🔄 Fetching vehicles from KeplerVO (page: ${page || 1}, count: ${count || 'default'})`);
      }

      // Appel à l'API KeplerVO avec le token
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
        
        // Gérer spécifiquement l'erreur 429 (quota dépassé)
        if (apiResponse.status === 429) {
          // Essayer de servir le cache stale si disponible
          const staleCache = serverCache.get(cacheKey);
          if (staleCache) {
            console.warn(`⚠️ Erreur 429 - Utilisation du cache stale pour ${cacheKey}`);
            return staleCache.data; // Retourner le cache même s'il est expiré
          }
          // Si pas de cache, lancer une erreur spécifique
          throw new Error('RATE_LIMIT_EXCEEDED');
        }
        
        throw new Error(`API error: ${apiResponse.status}`);
      }

      // Parser la réponse JSON
      const data: KeplerVehicleAPI | KeplerVehicleAPI[] = await apiResponse.json();
      
      console.log(`✅ Successfully fetched ${Array.isArray(data) ? data.length : 1} vehicle(s) from KeplerVO`);
      
      // Mettre en cache serveur
      serverCache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });

      // Limiter la taille du cache (garder max 100 entrées)
      if (serverCache.size > 100) {
        const firstKey = serverCache.keys().next().value;
        serverCache.delete(firstKey);
      }

      return data;
    })();

    // Stocker la Promise dans le verrou AVANT de l'exécuter
    pendingRequests.set(cacheKey, requestPromise);

    try {
      // Attendre le résultat de la requête
      const data = await requestPromise;
      
      // Retirer le verrou après succès
      pendingRequests.delete(cacheKey);

      // ============================================
      // Cache la réponse
      // ============================================
      // s-maxage=900 : Cache sur le CDN Vercel pendant 15 minutes
      // stale-while-revalidate : Sert une version en cache pendant la revalidation
      response.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1200');
      
      // Retourner les données
      return response.status(200).json({
        success: true,
        data: data,
        total: Array.isArray(data) ? data.length : 1,
        cached: false
      });
    } catch (error) {
      // Retirer le verrou en cas d'erreur
      pendingRequests.delete(cacheKey);
      throw error; // Relancer l'erreur pour le catch global
    }

  } catch (error) {
    // Gérer les erreurs réseau ou autres
    console.error('❌ Error in vehicles proxy API:', error);
    
    // Gérer spécifiquement l'erreur 429
    if (error instanceof Error && error.message === 'RATE_LIMIT_EXCEEDED') {
      // Essayer de servir le cache stale si disponible
      const staleCache = serverCache.get(cacheKey);
      if (staleCache) {
        console.warn(`⚠️ Erreur 429 - Utilisation du cache stale pour ${cacheKey}`);
        response.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1200');
        return response.status(200).json({
          success: true,
          data: staleCache.data,
          total: Array.isArray(staleCache.data) ? staleCache.data.length : 1,
          cached: true,
          rateLimited: true // Indique que c'est du cache à cause du quota
        });
      }
      
      // Retourner une erreur 429 propre
      return response.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: 'Quota API dépassé. Veuillez réessayer plus tard.',
        retryAfter: 3600 // 1 heure en secondes
      });
    }
    
    return response.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

