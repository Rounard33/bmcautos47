# 🚀 Guide de Démarrage Rapide - Intégration KeplerVO API v3.8

## ✅ Ce qui a été configuré

Votre site est maintenant prêt pour l'intégration avec l'API KeplerVO :

1. ✅ **Proxy Vercel sécurisé** (`api/vehicles.ts`)
   - Génération automatique de token (validité 30 min)
   - Cache intelligent du token (29 min)
   - Authentification via `X-Auth-Token`
   - Cache des véhicules (5 min)

2. ✅ **Service Angular** (`kepler-vo.service.ts`)
   - Support API KeplerVO v3.8
   - Transformation automatique des données
   - Gestion des images (gallery array)
   - Fallback sur mock data en cas d'erreur

3. ✅ **Environnements configurés**
   - Dev : Mock data par défaut (+ vercel dev pour tester l'API)
   - Prod : Prêt pour l'API (changer `useMockData: false`)

4. ✅ **Sécurité**
   - CSP mise à jour pour `app.keplervo-uat.com`
   - Clé API jamais exposée au client
   - CORS géré par le proxy

## 📋 Prochaines étapes

### 1️⃣ Configurer les variables Vercel (Production)

Allez sur [Vercel Dashboard](https://vercel.com/dashboard) → Votre projet → Settings → Environment Variables

Ajoutez :

```
Name: KEPLER_API_KEY
Value: b61b638add395629388673f4c82608a9d0f3c231bf52cae67c61ef79a549d96cf1559165593681f93a71b8843f982e18a0e4e91ba4849fe0294935003206f4de
Environments: ✅ Production, ✅ Preview, ✅ Development
```

### 2️⃣ Tester localement (Optionnel)

```bash
# 1. Créer le fichier .env à la racine
cp .env.example .env

# 2. Éditer .env et ajouter votre clé API
# KEPLER_API_KEY=b61b638add395629388673f4c82608a9d0f3c231bf52cae67c61ef79a549d96cf1559165593681f93a71b8843f982e18a0e4e91ba4849fe0294935003206f4de

# 3. Installer Vercel CLI (si pas déjà fait)
npm install -g vercel

# 4. Lancer le serveur de développement avec le proxy
vercel dev

# 5. Ouvrir http://localhost:3000 dans votre navigateur
```

**Vérifications :**
- ✅ Dans la console, vous devriez voir : `🔑 Generating new KeplerVO token...`
- ✅ Puis : `✅ New token generated and cached`
- ✅ Et enfin : `✅ X vehicle(s) fetched from KeplerVO`

### 3️⃣ Activer l'API en production

Éditez `src/environments/environment.prod.ts` :

```typescript
export const environment = {
  production: true,
  comingSoon: true,
  keplerVO: {
    apiUrl: '/api',
    apiKey: '',
    dealerId: '',
    timeout: 10000,
    cacheDuration: 600000,
    useMockData: false  // ← Changez de true à false
  }
};
```

### 4️⃣ Déployer

```bash
git add .
git commit -m "Activate KeplerVO API v3.8 integration"
git push
```

### 5️⃣ Vérifier le déploiement

1. Une fois déployé, testez l'API :
```bash
curl https://votre-site.vercel.app/api/vehicles
```

2. Vérifiez les logs sur Vercel Dashboard → Functions → vehicles :
```
🔑 Generating new KeplerVO token...
✅ New token generated and cached
🔄 Fetching all vehicles from KeplerVO
✅ Successfully fetched X vehicle(s) from KeplerVO
```

3. Ouvrez votre site et vérifiez que les véhicules s'affichent

## 🧪 Tests rapides

### Test 1 : Génération de token (PowerShell)
```powershell
$body = @{apiKey = "b61b638add395629388673f4c82608a9d0f3c231bf52cae67c61ef79a549d96cf1559165593681f93a71b8843f982e18a0e4e91ba4849fe0294935003206f4de"} | ConvertTo-Json
Invoke-RestMethod -Uri "https://app.keplervo-uat.com/api/v3.0/auth-token/" -Method POST -ContentType "application/json" -Body $body
```

**Réponse attendue :**
```json
{
  "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "createdAt": "2026-02-11T..."
}
```

### Test 2 : Récupération des véhicules (PowerShell)
```powershell
$token = "VOTRE_TOKEN_ICI"
$headers = @{"X-Auth-Token" = $token; "Content-Type" = "application/json"}
Invoke-RestMethod -Uri "https://app.keplervo-uat.com/api/v3.8/vehicles/" -Method GET -Headers $headers
```

### Test 3 : Via le proxy Vercel
```bash
curl https://votre-site.vercel.app/api/vehicles
```

## 🔍 Structure des données API v3.8

L'API KeplerVO v3.8 retourne les véhicules dans ce format :

```json
[
  {
    "uuid": "abc123",
    "reference": "REF001",
    "brand": { "name": "Renault" },
    "model": { "name": "Clio" },
    "version": { "name": "Intens" },
    "year": 2023,
    "distanceTraveled": 15000,
    "pricePublic": 18500,
    "energy": { "name": "Essence" },
    "gearbox": { "name": "Manuelle" },
    "gallery": [
      {
        "photo": "url_thumbnail",
        "large": "url_large",
        "big": "url_big",
        "position": 1
      }
    ],
    "color": { "name": "Noir" },
    "insideColor": { "name": "Gris" },
    "taxHorsepower": 5,
    "horsepower": 90,
    "doors": 5,
    "seats": 5,
    "equipmentStandard": [
      { "name": "Climatisation" }
    ],
    "equipmentOptional": [
      { "name": "GPS", "price": 500 }
    ]
  }
]
```

Le service `kepler-vo.service.ts` transforme automatiquement ce format vers votre modèle `Vehicle` interne.

## 📚 Documentation complète

Pour plus de détails, consultez :
- **[README_PROXY_VERCEL.md](./README_PROXY_VERCEL.md)** - Documentation complète du proxy
- **[Documentation API KeplerVO](https://app.keplervo-uat.com/fr/documentation-api)**

## 🆘 Problèmes courants

### ❌ "KEPLER_API_KEY not configured"
→ Ajoutez la variable sur Vercel Dashboard et redéployez

### ❌ "Authentication failed"
→ Vérifiez que la clé API est correcte dans les variables Vercel

### ❌ CORS error en dev local
→ Utilisez `vercel dev` au lieu de `ng serve` pour avoir le proxy local

### ❌ Les véhicules de démo s'affichent encore
→ Vérifiez `useMockData: false` dans `environment.prod.ts` et redéployez

### ❌ CSP violation dans la console
→ Déjà corrigé dans `src/index.html`, faire un hard refresh (Ctrl+Shift+R)

## ✅ Checklist finale

- [ ] Variables Vercel configurées
- [ ] `useMockData: false` dans `environment.prod.ts`
- [ ] Déployé sur Vercel
- [ ] Test API : `curl https://site.vercel.app/api/vehicles`
- [ ] Véhicules réels affichés sur le site
- [ ] Logs Vercel sans erreurs

---

**🎉 Une fois ces étapes complétées, votre site sera 100% connecté à l'API KeplerVO !**
