import type {VercelRequest, VercelResponse} from '@vercel/node';

interface KeplerPhoto {
  url: string;
  ordre?: number;
  principal?: boolean;
}

interface KeplerCaracteristiques {
  finition?: string;
  categorie?: string;
  dateCirculation?: string;
  garantie?: string;
  couleurExterieure?: string;
  couleurInterieure?: string;
  puissanceFiscale?: number;
  puissanceReelle?: string;
  emissionCO2?: number;
  nbPortes?: number;
  nbPlaces?: number;
  description?: string;
  equipementsStandard?: string[];
  equipementsOption?: string[];
}

interface KeplerVehicle {
  id: string;
  reference?: string;
  marque: string;
  modele: string;
  annee: number;
  kilometrage: number;
  boite: string;
  carburant: string;
  prix: number;
  photos: KeplerPhoto[];
  caracteristiques?: KeplerCaracteristiques;
  statut?: string;
}

interface KeplerResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
}

/**
 * Vercel Serverless Function - Proxy pour l'API KeplerVO
 * 
 * Cette fonction sécurise votre clé API KeplerVO en la gardant côté serveur.
 * Le JavaScript du site n'a jamais accès à la clé réelle.
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
  const apiUrl = process.env.KEPLER_API_URL || 'https://api.kepler-soft.net/v3.60';
  const apiKey = process.env.KEPLER_API_KEY;
  const dealerId = process.env.KEPLER_DEALER_ID;

  // Vérifier que les variables sont configurées
  if (!apiKey) {
    console.error('❌ KEPLER_API_KEY not configured in Vercel environment variables');
    return response.status(500).json({ 
      success: false,
      error: 'API configuration error',
      message: 'KEPLER_API_KEY not configured. Please add it in Vercel Dashboard → Settings → Environment Variables'
    });
  }

  if (!dealerId) {
    console.error('❌ KEPLER_DEALER_ID not configured in Vercel environment variables');
    return response.status(500).json({ 
      success: false,
      error: 'Configuration error',
      message: 'KEPLER_DEALER_ID not configured. Please add it in Vercel Dashboard → Settings → Environment Variables'
    });
  }

  // ============================================
  // Gérer les différentes routes
  // ============================================
  const { vehicleId } = request.query;

  try {
    let url = `${apiUrl}/vehicles`;
    
    // Si un ID de véhicule est demandé
    if (vehicleId && typeof vehicleId === 'string') {
      url = `${apiUrl}/vehicles/${vehicleId}`;
      console.log(`🔄 Fetching vehicle ${vehicleId} from KeplerVO`);
    } else {
      // Sinon, liste avec le dealerId
      url = `${url}?dealerId=${dealerId}&status=available`;
      console.log(`🔄 Fetching all vehicles for dealer ${dealerId} from KeplerVO`);
    }

    // ============================================
    // Appel à l'API KeplerVO
    // ============================================
    const apiResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        // 🔧 À AJUSTER selon la vraie documentation KeplerVO
        // Peut-être plutôt :
        // 'X-API-Key': apiKey,
        // ou autre format
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
    const data: KeplerResponse<KeplerVehicle | KeplerVehicle[]> = await apiResponse.json();
    
    console.log(`✅ Successfully fetched data from KeplerVO`);
    
    // ============================================
    // Cache la réponse
    // ============================================
    // s-maxage=300 : Cache sur le CDN Vercel pendant 5 minutes
    // stale-while-revalidate : Sert une version en cache pendant la revalidation
    response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    
    // Retourner les données
    return response.status(200).json(data);

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

