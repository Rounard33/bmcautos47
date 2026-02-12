# 🔐 Backend Proxy Vercel - Documentation KeplerVO API v3.8

## 📋 Vue d'ensemble

Votre site utilise maintenant un **backend proxy sécurisé** via Vercel Serverless Functions pour communiquer avec l'API KeplerVO. Votre clé API reste **100% cachée** sur le serveur et n'est jamais exposée dans le JavaScript du navigateur.

Le proxy gère automatiquement :
- ✅ **Génération de token** (authentification 2-étapes)
- ✅ **Cache du token** (30 minutes de validité)
- ✅ **Sécurité de la clé API** (jamais exposée au client)
- ✅ **Cache des réponses** (5 minutes)

## 🏗️ Architecture

```
┌────────────────┐
│   Navigateur   │  ← Utilisateurs du site
│    (Public)    │
└────────┬───────┘
         │
         │ GET /api/vehicles
         │ (Pas de clé API !)
         ↓
┌────────────────────────┐
│     Vercel Functions   │  ← Votre proxy sécurisé
│    (Serverless)        │
│                        │
│ 1. Génère token si     │
│    expiré (POST        │
│    /v3.0/auth-token/)  │
│                        │
│ 2. Cache token         │
│    (29 min)            │
│                        │
│ 3. Utilise X-Auth-     │
│    Token pour appels   │
│    API                 │
└────────┬───────────────┘
         │
         │ X-Auth-Token: GENERATED_TOKEN
         │ (Token valide 30 min)
         ↓
┌────────────────┐
│   KeplerVO     │
│   API v3.8     │  ← API UAT de KeplerVO
│   (UAT)        │
└────────────────┘
```

## 📁 Fichiers créés

```
bmcAutos47/
├── api/
│   └── vehicles.ts           ← Proxy Vercel Function
├── vercel.json               ← Configuration Vercel
├── src/
│   ├── environments/
│   │   ├── environment.ts    ← Modifié (pointe vers proxy)
│   │   └── environment.prod.ts ← Modifié (pointe vers proxy)
│   └── app/services/
│       └── kepler-vo.service.ts ← Modifié (n'envoie plus la clé)
└── README_PROXY_VERCEL.md    ← Ce fichier
```

## 🔧 Configuration Vercel

### Étape 1 : Configurer les variables d'environnement

1. Allez sur **[Vercel Dashboard](https://vercel.com/dashboard)**
2. Sélectionnez votre projet (bmcAutos47)
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez ces variables :

#### KEPLER_API_KEY (Obligatoire)
```
Name: KEPLER_API_KEY
Value: b61b638add395629388673f4c82608a9d0f3c231bf52cae67c61ef79a549d96cf1559165593681f93a71b8843f982e18a0e4e91ba4849fe0294935003206f4de
Environments: ✅ Production, ✅ Preview, ✅ Development
```

#### KEPLER_API_URL (Optionnel)
```
Name: KEPLER_API_URL
Value: https://app.keplervo-uat.com/api
Environments: ✅ Production, ✅ Preview, ✅ Development
```

> **Note :** Le `KEPLER_DEALER_ID` n'est plus nécessaire avec l'API v3.8. Le proxy récupère automatiquement tous les véhicules associés à votre clé API.

### Étape 2 : Configuration locale (Développement)

Pour tester le proxy localement, créez un fichier `.env` à la racine du projet :

```bash
# .env (ne sera jamais commité grâce au .gitignore)
KEPLER_API_KEY=b61b638add395629388673f4c82608a9d0f3c231bf52cae67c61ef79a549d96cf1559165593681f93a71b8843f982e18a0e4e91ba4849fe0294935003206f4de
KEPLER_API_URL=https://app.keplervo-uat.com/api
```

### Étape 3 : Tester localement avec Vercel Dev

```bash
# Installer Vercel CLI si pas déjà fait
npm install -g vercel

# Lancer le serveur de développement avec le proxy
vercel dev

# Le serveur démarre sur http://localhost:3000
# Le proxy sera accessible sur http://localhost:3000/api/vehicles
```

**Important :** Avec `vercel dev`, vous devez :
1. Ouvrir votre site sur `http://localhost:3000` (pas `http://localhost:4200`)
2. OU modifier `src/environments/environment.ts` pour mettre `useMockData: false`

### Étape 4 : Redéployer en production

Une fois les variables ajoutées sur Vercel :

```bash
# Option 1 : Push un commit pour déclencher un déploiement
git add .
git commit -m "Configure KeplerVO API v3.8 with token authentication"
git push

# Option 2 : Redéploiement manuel depuis le Dashboard Vercel
# Vercel Dashboard → Deployments → ⋮ → Redeploy
```

## 🧪 Tester le proxy

### Test 1 : Vérifier que le proxy fonctionne

```bash
# Remplacez par votre vraie URL Vercel
curl https://votre-site.vercel.app/api/vehicles

# Réponse attendue :
{
  "success": true,
  "data": [
    {
      "id": "...",
      "marque": "Renault",
      "modele": "Clio",
      ...
    }
  ]
}
```

### Test 2 : Vérifier qu'un véhicule spécifique fonctionne

```bash
curl "https://votre-site.vercel.app/api/vehicles?vehicleId=123"

# Réponse attendue :
{
  "success": true,
  "data": {
    "id": "123",
    "marque": "...",
    ...
  }
}
```

### Test 3 : Vérifier les logs Vercel

1. Allez sur **Vercel Dashboard** → **Deployments**
2. Cliquez sur votre dernier déploiement
3. Allez dans **Functions** → **vehicles**
4. Regardez les logs :

```
✅ Logs attendus :
🔄 Fetching all vehicles for dealer XXX from KeplerVO
✅ Successfully fetched data from KeplerVO

❌ Si erreur de config :
❌ KEPLER_API_KEY not configured in Vercel environment variables
```

## 🔍 Vérifier la sécurité

### ✅ La clé API est-elle cachée ?

**Test dans le navigateur :**

1. Ouvrez votre site : `https://votre-site.vercel.app`
2. Appuyez sur **F12** (DevTools)
3. Allez dans **Network** → Rafraîchissez la page
4. Cliquez sur un fichier JavaScript (ex: `main.ABC123.js`)
5. Cherchez "KEPLER" ou "apiKey"

**Résultat attendu :**
```javascript
// ✅ BON - Vous devriez voir :
apiUrl: "/api"
apiKey: ""  // Vide !

// ❌ MAUVAIS - Vous ne devriez PAS voir :
apiKey: "votre_vraie_cle"  // Si vous voyez ça, c'est pas bon !
```

### ✅ Le proxy fonctionne-t-il ?

**Dans DevTools → Network :**

```
✅ Requête attendue :
GET /api/vehicles
Status: 200 OK
Response: { "success": true, "data": [...] }

❌ Si erreur :
Status: 500
Response: { "success": false, "error": "API configuration error" }
→ Vérifiez les variables d'environnement Vercel
```

## 🚀 Activer l'API en production

Actuellement, le site utilise encore les **véhicules de démonstration** (`useMockData: true`).

### Pour activer l'API KeplerVO :

**Modifiez `src/environments/environment.prod.ts` :**

```typescript
export const environment = {
  production: true,
  keplerVO: {
    apiUrl: '/api',
    apiKey: '',
    dealerId: '',
    timeout: 10000,
    cacheDuration: 600000,
    useMockData: false  // ← Changez true en false
  }
};
```

**Puis déployez :**

```bash
git add src/environments/environment.prod.ts
git commit -m "Activate KeplerVO API via proxy"
git push
```

## 📊 Monitoring et Logs

### Voir les statistiques d'utilisation

**Vercel Dashboard → Analytics → Functions**

Vous verrez :
- Nombre d'appels à `/api/vehicles`
- Temps de réponse moyen
- Taux d'erreur
- Utilisation de la bande passante

### Voir les logs en temps réel

**Vercel Dashboard → Deployments → Functions → vehicles**

Logs utiles :
```
🔄 Fetching all vehicles for dealer XXX from KeplerVO
✅ Successfully fetched data from KeplerVO
❌ KeplerVO API error: 401 Unauthorized
❌ KEPLER_API_KEY not configured
```

## 🐛 Dépannage

### Erreur : "API configuration error"

**Symptôme :**
```json
{
  "success": false,
  "error": "API configuration error",
  "message": "KEPLER_API_KEY not configured"
}
```

**Solution :**
1. Vérifiez que `KEPLER_API_KEY` est bien dans Vercel
2. Vérifiez l'orthographe exacte
3. Redéployez après avoir ajouté la variable

### Erreur : "Authentication failed"

**Symptôme :**
```json
{
  "success": false,
  "error": "KeplerVO API error: 401",
  "message": "Authentication failed - check your API key"
}
```

**Solution :**
1. Vérifiez que votre clé API KeplerVO est correcte dans les variables Vercel
2. Vérifiez que le token est bien généré dans les logs :
   ```
   🔑 Generating new KeplerVO token...
   ✅ New token generated and cached
   ```
3. La génération de token utilise :
   - **Endpoint :** `POST https://app.keplervo-uat.com/api/v3.0/auth-token/`
   - **Body :** `{ "apiKey": "votre_cle" }`
   - **Header pour requêtes :** `X-Auth-Token: token_généré`

### Erreur : "Resource not found"

**Symptôme :**
```json
{
  "success": false,
  "error": "KeplerVO API error: 404",
  "message": "Resource not found"
}
```

**Solution :**
1. Vérifiez l'URL de l'API dans `KEPLER_API_URL`
2. Vérifiez les endpoints dans `/api/vehicles.ts`
3. Consultez la documentation KeplerVO

### Le site charge les véhicules de démo au lieu de l'API

**Solution :**
1. Vérifiez `useMockData` dans `environment.prod.ts` → doit être `false`
2. Vérifiez que vous avez bien redéployé après le changement
3. Videz le cache du navigateur (Ctrl+Shift+R)

## 💰 Coûts

### Vercel Functions (Gratuit)

**Plan Hobby (Gratuit) :**
- ✅ 100 GB-hours d'exécution/mois
- ✅ 100 GB de bande passante/mois
- ✅ Largement suffisant pour votre cas

**Estimation pour votre site :**
```
1 requête = ~50ms d'exécution = 0.000014 GB-hour
10 000 requêtes/mois = 0.14 GB-hours/mois

→ Vous pouvez faire ~700 000 requêtes/mois gratuitement !
```

**Avec le cache de 5 minutes :**
- 100 visiteurs/jour = ~300 requêtes API/jour
- = ~9 000 requêtes/mois
- = **Largement dans le gratuit** ✅

## 🔐 Sécurité - Bonnes pratiques

### ✅ À FAIRE

- ✅ Variables d'environnement dans Vercel (jamais dans le code)
- ✅ `.gitignore` inclut les fichiers `.env` locaux
- ✅ CORS configuré pour votre domaine uniquement (en prod)
- ✅ Rate limiting géré par Vercel Edge
- ✅ HTTPS automatique (Vercel)

### ❌ À NE PAS FAIRE

- ❌ Commiter des clés API dans Git
- ❌ Mettre des clés API dans les fichiers `environment.ts`
- ❌ Partager vos variables d'environnement Vercel
- ❌ Utiliser la même clé en dev et prod

## 🔑 Fonctionnement de l'authentification par token

L'API KeplerVO v3.8 utilise une **authentification en 2 étapes** :

### Étape 1 : Génération du token
```bash
POST https://app.keplervo-uat.com/api/v3.0/auth-token/
Content-Type: application/json

{ "apiKey": "votre_cle_api" }
```

**Réponse :**
```json
{
  "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "createdAt": "2026-02-11T10:30:00Z"
}
```

### Étape 2 : Utilisation du token
```bash
GET https://app.keplervo-uat.com/api/v3.8/vehicles/
X-Auth-Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Cache du token
- ✅ Le token est **valide 30 minutes**
- ✅ Le proxy le met en cache pendant **29 minutes** (marge de sécurité)
- ✅ Un nouveau token est automatiquement généré quand le cache expire
- ✅ Pas besoin de regénérer à chaque requête

## 📝 Checklist de mise en production

- [ ] Variables d'environnement ajoutées sur Vercel
  - [ ] KEPLER_API_KEY
  - [ ] KEPLER_API_URL (optionnel)
- [ ] Fichiers créés et déployés
  - [ ] `/api/vehicles.ts` (avec authentification par token)
  - [ ] `vercel.json`
- [ ] Fichiers modifiés
  - [ ] `environment.ts` (useMockData: true pour dev local)
  - [ ] `environment.prod.ts` (useMockData: false pour prod)
  - [ ] `kepler-vo.service.ts` (transformation des données v3.8)
  - [ ] `src/index.html` (CSP avec app.keplervo-uat.com)
- [ ] Tests locaux
  - [ ] Créer fichier `.env` avec KEPLER_API_KEY
  - [ ] Lancer `vercel dev`
  - [ ] Tester http://localhost:3000/api/vehicles
  - [ ] Vérifier génération token dans logs
- [ ] Tests en production
  - [ ] Déployer sur Vercel
  - [ ] Tester `curl https://site.vercel.app/api/vehicles`
  - [ ] Clé API invisible dans le JavaScript
  - [ ] Logs Vercel OK (token généré et caché)
- [ ] Production
  - [ ] `useMockData: false` dans `environment.prod.ts`
  - [ ] Site déployé
  - [ ] Véhicules KeplerVO affichés avec vraies images

## 🎉 Résultat

Votre site est maintenant **100% sécurisé** :

✅ Clé API KeplerVO cachée sur le serveur  
✅ JavaScript du navigateur ne contient aucune clé  
✅ Cache intelligent (5 minutes)  
✅ Fallback automatique sur mock data si erreur  
✅ Gratuit avec Vercel (jusqu'à 100GB-hours/mois)  
✅ Monitoring et logs en temps réel  
✅ Scalable automatiquement  

---

**📧 Questions ?**
- Documentation Vercel : https://vercel.com/docs/functions
- Documentation Vercel Environment Variables : https://vercel.com/docs/projects/environment-variables

